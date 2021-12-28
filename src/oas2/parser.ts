import { major } from 'semver';
import { singular } from 'pluralize';
import { camel, pascal } from 'case';

import { OpenAPI } from './types';

import {
  Enum,
  Interface,
  Method,
  MethodSpec,
  ObjectValidationRule,
  Parameter,
  Parser,
  PathSpec,
  Property,
  ReturnType,
  Service,
  Type,
  ValidationRule,
} from '../types';

export class OAS2Parser implements Parser {
  constructor(private readonly schema: OpenAPI.Schema) {}

  private readonly ruleFactories: ValidationRuleFactory[] = factories;
  private enums: Enum[];
  private anonymousTypes: Type[];

  parse(): Service {
    this.enums = [];
    this.anonymousTypes = [];
    const interfaces = this.parseInterfaces();
    const types = this.parseDefinitions();

    return {
      title: pascal(this.schema.info.title),
      majorVersion: major(this.schema.info.version),
      interfaces,
      types: [...types, ...this.anonymousTypes],
      enums: this.enums,
    };
  }

  private parseInterfaces(): Interface[] {
    return Object.keys(this.schema.paths)
      .map((path) => path.split('/')[1])
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((name) => ({
        name: singular(name),
        methods: this.parseMethods(name),
        protocols: {
          http: this.parseHttpProtocol(name),
        },
      }));
  }
  private parseResponseCode(
    verb: Exclude<keyof OpenAPI.PathItem, 'parameters'>,
    operation: OpenAPI.Operation,
  ): number {
    const primary = this.parsePrimaryResponseKey(operation);

    if (typeof primary === 'number') {
      return primary;
    } else if (primary === 'default') {
      if (!!this.resolve(operation.responses[primary]).schema) {
        switch (verb) {
          case 'delete':
            return 202;
          case 'options':
            return 204;
          case 'post':
            return 201;
        }
      } else {
        return 204;
      }
    }

    return 200;
  }

  private parseHttpProtocol(interfaceName: string): PathSpec[] {
    const paths = Object.keys(this.schema.paths).filter(
      (path) => path.split('/')[1] === interfaceName,
    );

    const pathSpecs: PathSpec[] = [];

    for (const path of paths) {
      const pathItem = this.resolve(this.schema.paths[path]);
      const commonParameters = this.schema.paths[path]['parameters'] || [];

      const pathSpec: PathSpec = {
        path,
        methods: [],
      };

      for (const verb of keysOf(pathItem)) {
        if (verb === 'parameters') continue;

        const operation = pathItem[verb]!;

        const methodSpec: MethodSpec = {
          name: operation.operationId || 'unknown',
          verb,
          parameters: [],
          successCode: this.parseResponseCode(verb, operation),
        };

        for (const param of [
          ...(operation.parameters || []),
          ...commonParameters,
        ]) {
          const name = this.parseParameterName(param);

          const resolved = this.resolve(param);

          if (
            (resolved.in === 'header' ||
              resolved.in === 'path' ||
              resolved.in === 'query') &&
            resolved.type === 'array'
          ) {
            methodSpec.parameters.push({
              name,
              in: this.parseParameterLocation(param),
              array: resolved.collectionFormat || 'csv',
            });
          } else {
            methodSpec.parameters.push({
              name,
              in: this.parseParameterLocation(param),
            });
          }
        }

        pathSpec.methods.push(methodSpec);
      }

      pathSpecs.push(pathSpec);
    }
    return pathSpecs;
  }

  private parseMethods(interfaceName: string): Method[] {
    const paths = Object.keys(this.schema.paths).filter(
      (path) => path.split('/')[1] === interfaceName,
    );

    const methods: Method[] = [];

    for (const path of paths) {
      const commonParameters = this.schema.paths[path]['parameters'] || [];
      for (const verb in this.schema.paths[path]) {
        if (verb === 'parameters') continue;

        const operation: OpenAPI.Operation = this.schema.paths[path][verb];
        methods.push({
          name: operation.operationId || 'UNNAMED',
          parameters: this.parseParameters(operation, commonParameters),
          description: this.parseDescription(
            operation.summary,
            operation.description,
          ),
          returnType: this.parseReturnType(operation),
        });
      }
    }
    return methods;
  }

  private parseDescription(
    summary: string | undefined,
    description: string | undefined,
  ): string | string[] | undefined {
    if (summary && description) return [summary, description];
    if (summary) return summary;
    if (description) return description;
    return;
  }

  private parseParameters(
    operation: OpenAPI.Operation,
    commonParameters: (OpenAPI.Parameter | OpenAPI.Reference)[],
  ): Parameter[] {
    const allParameters = [
      ...commonParameters,
      ...(operation.parameters || []),
    ];
    if (!allParameters.length) return [];

    return allParameters.map((p) =>
      this.parseParameter(this.resolve(p), operation.operationId || ''),
    );
  }

  private parseParameter(
    param: OpenAPI.Parameter,
    methodName: string,
  ): Parameter {
    const resolved = isBodyParameter(param) ? param.schema : param;

    const { typeName, isUnknown, isLocal, isArray } = this.parseType(
      resolved,
      param.name,
      methodName,
    );
    return {
      name: param.name,
      description: this.parseDescription(undefined, param.description),
      typeName,
      isUnknown,
      isLocal,
      isArray,
      rules: this.parseRules(this.resolve(resolved), param.required),
    };
  }

  private parseParameterLocation(
    def: OpenAPI.Parameter | OpenAPI.Reference,
  ): OpenAPI.Parameter['in'] {
    return this.resolve(def).in;
  }

  private parseParameterName(
    def: OpenAPI.Parameter | OpenAPI.Reference,
  ): OpenAPI.Parameter['name'] {
    return this.resolve(def).name;
  }

  private parseType(
    def: OpenAPI.NonBodyParameter | OpenAPI.JsonSchema | OpenAPI.Reference,
    localName: string,
    parentName: string,
  ): {
    typeName: string;
    isUnknown: boolean;
    enumValues?: string[];
    isLocal: boolean;
    isArray: boolean;
    rules: ValidationRule[];
  } {
    if (isReference(def)) {
      const res = this.resolve(def) as unknown as
        | OpenAPI.JsonSchema
        | OpenAPI.NonBodyParameter;
      if (def.$ref.startsWith('#/definitions/')) {
        if (res.type === 'object') {
          return {
            typeName: def.$ref.substr(14),
            isUnknown: false,
            isLocal: true,
            isArray: false,
            rules: this.parseRules(res),
          };
        } else {
          return {
            typeName: res.type,
            isUnknown: false,
            isLocal: false,
            isArray: false,
            rules: this.parseRules(res),
          };
        }
      } else {
        return {
          typeName: def.$ref,
          isUnknown: true,
          isLocal: true,
          isArray: false,
          rules: this.parseRules(res),
        };
      }
    }
    const rules = this.parseRules(def);

    switch (def.type) {
      case 'string':
        if (def.enum) {
          const enumName = camel(`${parentName}_${singular(localName)}`);
          this.enums.push({
            name: enumName,
            values: def.enum,
          });
          return {
            typeName: enumName,
            isUnknown: false,
            isLocal: true,
            isArray: false,
            rules,
          };
        } else {
          return {
            typeName: def.type,
            isUnknown: false,
            isLocal: false,
            isArray: false,
            rules,
          };
        }
      case 'number':
      case 'integer':
      case 'boolean':
      case 'null':
        return {
          typeName: def.type,
          isUnknown: false,
          isLocal: false,
          isArray: false,
          rules,
        };
      case 'array':
        const items = this.parseType(def.items, localName, parentName);
        return {
          typeName: items.typeName,
          isUnknown: false,
          isLocal: items.isLocal,
          isArray: true,
          rules,
        };
      case 'object':
        const typeName = camel(`${parentName}_${localName}`);
        this.anonymousTypes.push({
          name: typeName,
          properties: this.parseProperties(def, typeName),
          description: def.description,
          rules: this.parseObjectRules(def),
        });

        return {
          typeName,
          isUnknown: false,
          isLocal: true,
          isArray: false,
          rules,
        };
      default:
        return {
          typeName: 'unknown',
          isUnknown: true,
          isLocal: false,
          isArray: false,
          rules,
        };
    }
  }

  private parsePrimaryResponseKey(
    operation: OpenAPI.Operation,
  ): number | 'default' | undefined {
    const hasDefault = typeof operation.responses.default !== 'undefined';
    const code = Object.keys(operation.responses).filter((c) =>
      c.startsWith('2'),
    )[0];

    if (code === 'default') return 'default';

    const n = Number(code);

    if (!Number.isNaN(n)) return n;
    if (hasDefault) return 'default';
    return;
  }

  private parseReturnType(
    operation: OpenAPI.Operation,
  ): ReturnType | undefined {
    const primaryCode = this.parsePrimaryResponseKey(operation);
    const success = operation.responses[`${primaryCode}`];
    if (!success) return;

    const response = this.resolve(success);
    const name =
      isReference(success) && success.$ref.startsWith('#/responses/')
        ? success.$ref.substr(11)
        : undefined;

    if (!response.schema) return;

    return this.parseType(
      response.schema,
      'response',
      name || operation.operationId || '',
    );
  }

  private parseDefinitions(): Type[] {
    if (!this.schema.definitions) return [];

    const definitions = Object.keys(this.schema.definitions)
      .map((name) => ({ ...this.schema.definitions![name], name }))
      .filter((def) => def.type === 'object');

    return definitions.map((def) => {
      return {
        name: def.name,
        description: def.description,
        properties:
          def.type === 'object' ? this.parseProperties(def, def.name) : [],
        rules: this.parseObjectRules(def),
      };
    });
  }

  private parseProperties(
    def: OpenAPI.ObjectSchema,
    parentName?: string,
  ): Property[] {
    if (def.allOf) {
      const { allOf, ...rest } = def;
      return def.allOf
        .map((subDef) =>
          this.parseProperties(
            {
              ...rest,
              properties: this.resolve(subDef).properties as any,
            },
            parentName,
          ),
        )
        .reduce((a, b) => a.concat(b), []);
    } else {
      const required = new Set<string>(def.required || []);
      const props: Property[] = [];
      for (const name in def.properties) {
        const resolvedProp = this.resolve(def.properties[name]);

        const { typeName, isUnknown, isArray, isLocal } = this.parseType(
          resolvedProp,
          name,
          parentName || '',
        );
        props.push({
          name,
          description: resolvedProp.description,
          typeName,
          isUnknown,
          isArray,
          isLocal,
          rules: this.parseRules(resolvedProp, required.has(name)),
        });
      }
      return props;
    }
  }

  private resolveRef(ref: OpenAPI.Reference) {
    let result: any = undefined;

    for (const segment of ref.$ref.split('/')) {
      result = segment === '#' ? this.schema : result[segment];
    }

    return result;
  }

  private resolve<T>(itemOrRef: T | OpenAPI.Reference): T {
    if (isReference(itemOrRef)) {
      return this.resolveRef(itemOrRef);
    } else {
      return itemOrRef;
    }
  }

  private parseRules(
    def: OpenAPI.JsonSchema | OpenAPI.NonBodyParameter,
    required?: boolean,
  ): ValidationRule[] {
    const localRules = this.ruleFactories
      .map((f) => f(def))
      .filter((x): x is ValidationRule => !!x);

    const itemRules =
      def.type === 'array'
        ? this.ruleFactories
            .map((f) => f(this.resolve(def.items)))
            .filter((x): x is ValidationRule => !!x)
        : [];

    const rules = [...localRules, ...itemRules];

    return required ? [{ id: 'required' }, ...rules] : rules;
  }

  private parseObjectRules(
    def: OpenAPI.JsonSchema | OpenAPI.NonBodyParameter,
  ): ObjectValidationRule[] {
    return objectFactories
      .map((f) => f(def))
      .filter((x): x is ObjectValidationRule => !!x);
  }
}

export interface ValidationRuleFactory {
  (def: OpenAPI.JsonSchema | OpenAPI.NonBodyParameter):
    | ValidationRule
    | undefined;
}

export interface ObjectValidationRuleFactory {
  (def: OpenAPI.JsonSchema | OpenAPI.NonBodyParameter):
    | ObjectValidationRule
    | undefined;
}

const stringMaxLengthFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'string' && typeof def.maxLength === 'number') {
    return {
      id: 'string-max-length',
      length: def.maxLength,
    };
  } else {
    return;
  }
};

const stringMinLengthFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'string' && typeof def.minLength === 'number') {
    return {
      id: 'string-min-length',
      length: def.minLength,
    };
  } else {
    return;
  }
};

const stringPatternFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'string' && typeof def.pattern === 'string') {
    return {
      id: 'string-pattern',
      pattern: def.pattern,
    };
  } else {
    return;
  }
};

const stringFormatFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'string' && typeof def.format === 'string') {
    return {
      id: 'string-format',
      format: def.format,
    };
  } else {
    return;
  }
};

const stringEnumFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'string' && Array.isArray(def.enum)) {
    return {
      id: 'string-enum',
      values: def.enum,
    };
  } else {
    return;
  }
};

const numberMultipleOfFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'number' && typeof def.multipleOf === 'number') {
    return {
      id: 'number-multiple-of',
      value: def.multipleOf,
    };
  } else {
    return;
  }
};

const numberGreaterThanFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'number' && typeof def.minimum === 'number') {
    return {
      id: def.exclusiveMinimum ? 'number-gt' : 'number-gte',
      value: def.minimum,
    };
  } else {
    return;
  }
};

const numberLessThanFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'number' && typeof def.maximum === 'number') {
    return {
      id: def.exclusiveMaximum ? 'number-lt' : 'number-lte',
      value: def.maximum,
    };
  } else {
    return;
  }
};

const arrayMinItemsFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'array' && typeof def.minItems === 'number') {
    return {
      id: 'array-min-items',
      min: def.minItems,
    };
  } else {
    return;
  }
};

const arrayMaxItemsFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'array' && typeof def.maxItems === 'number') {
    return {
      id: 'array-max-items',
      max: def.maxItems,
    };
  } else {
    return;
  }
};

const arrayUniqueItemsFactory: ValidationRuleFactory = (def) => {
  if (def.type === 'array' && def.uniqueItems) {
    return {
      id: 'array-unique-items',
      required: true,
    };
  } else {
    return;
  }
};

const objectMinPropertiesFactory: ObjectValidationRuleFactory = (def) => {
  if (def.type === 'object' && typeof def.minProperties === 'number') {
    return {
      id: 'object-min-properties',
      min: def.minProperties,
    };
  } else {
    return;
  }
};

const objectMaxPropertiesFactory: ObjectValidationRuleFactory = (def) => {
  if (def.type === 'object' && typeof def.maxProperties === 'number') {
    return {
      id: 'object-max-properties',
      max: def.maxProperties,
    };
  } else {
    return;
  }
};

const objectAdditionalPropertiesFactory: ObjectValidationRuleFactory = (
  def,
) => {
  if (def.type === 'object' && def.additionalProperties === false) {
    return {
      id: 'object-additional-properties',
      forbidden: true,
    };
  } else {
    return;
  }
};

const factories = [
  stringEnumFactory,
  stringFormatFactory,
  stringMaxLengthFactory,
  stringMinLengthFactory,
  stringPatternFactory,
  numberMultipleOfFactory,
  numberGreaterThanFactory,
  numberLessThanFactory,
  arrayMaxItemsFactory,
  arrayMinItemsFactory,
  arrayUniqueItemsFactory,
];

const objectFactories = [
  objectMaxPropertiesFactory,
  objectMinPropertiesFactory,
  objectAdditionalPropertiesFactory,
];

function isReference<T>(
  param: T | OpenAPI.Reference,
): param is OpenAPI.Reference {
  return typeof (param as any).$ref !== 'undefined';
}

function isBodyParameter(obj: any): obj is OpenAPI.BodyParameter {
  return typeof obj['in'] === 'string' && obj.in === 'body';
}

function keysOf<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as any;
}
