import { major } from 'semver';
import { singular } from 'pluralize';
import { camel, pascal } from 'case';

import {
  factories,
  objectFactories,
  ObjectValidationRule,
  ValidationRule,
  ValidationRuleFactory,
} from './rules';
import { OpenAPI } from './types';

export class Parser {
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
      }));
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
      ...(operation.parameters || []),
      ...commonParameters,
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

    const { typeName, isLocal, isArray } = this.parseType(
      resolved,
      param.name,
      methodName,
    );
    return {
      name: param.name,
      description: this.parseDescription(undefined, param.description),
      typeName,
      isLocal,
      isArray,
      rules: this.parseRules(this.resolve(resolved), param.required),
    };
  }

  private parseType(
    def: OpenAPI.NonBodyParameter | OpenAPI.JsonSchema | OpenAPI.Reference,
    localName: string,
    parentName: string,
  ): {
    typeName: string;
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
            isLocal: true,
            isArray: false,
            rules: this.parseRules(res),
          };
        } else {
          return {
            typeName: res.type,
            isLocal: false,
            isArray: false,
            rules: this.parseRules(res),
          };
        }
      } else {
        return {
          typeName: def.$ref,
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
            isLocal: true,
            isArray: false,
            rules,
          };
        } else {
          return {
            typeName: def.type,
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
          isLocal: false,
          isArray: false,
          rules,
        };
      case 'array':
        const items = this.parseType(def.items, localName, parentName);
        return {
          typeName: items.typeName,
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
          isLocal: true,
          isArray: false,
          rules,
        };
      default:
        return {
          typeName: '>>>>>>>>>>>>>>>>> unknown <<<<<<<<<<<<<<<<<<<',
          isLocal: true,
          isArray: false,
          rules,
        };
    }
  }

  private parseReturnType(
    operation: OpenAPI.Operation,
  ): ReturnType | undefined {
    const responseCodes = Object.keys(operation.responses).filter((c) =>
      c.startsWith('2'),
    );

    const success =
      operation.responses[responseCodes[0]] || operation.responses.default;
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
        const prop = def.properties[name];

        const resolvedProp = this.resolve(prop);

        const { typeName, isArray, isLocal } = this.parseType(
          prop,
          name,
          parentName || '',
        );
        props.push({
          name,
          description: resolvedProp.description,
          typeName,
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
    const rules = this.ruleFactories
      .map((f) => f(def))
      .filter((x): x is ValidationRule => !!x);

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

export type Service = {
  title: string;
  majorVersion: number;
  interfaces: Interface[];
  types: Type[];
  enums: Enum[];
};

export type Type = {
  name: string;
  description?: string | string[];
  properties: Property[];
  rules: ObjectValidationRule[];
};

export type Enum = {
  name: string;
  values: string[];
};

export type Property = {
  name: string;
  description?: string | string[];
  typeName: string;
  isArray: boolean;
  isLocal: boolean;
  rules: ValidationRule[];
};

export type Interface = {
  name: string;
  description?: string | string[];
  methods: Method[];
};

export type Method = {
  name: string;
  description?: string | string[];
  parameters: Parameter[];
  returnType: ReturnType | undefined;
};

export type Parameter = {
  name: string;
  description?: string | string[];
  typeName: string;
  isArray: boolean;
  isLocal: boolean;
  rules: ValidationRule[];
};

export type ReturnType = {
  typeName: string;
  isArray: boolean;
  isLocal: boolean;
  rules: ValidationRule[];
};

export function isRequired(obj: { rules: ValidationRule[] }): boolean {
  return obj.rules.some((r) => r.id === 'required');
}

function isReference<T>(
  param: T | OpenAPI.Reference,
): param is OpenAPI.Reference {
  return typeof (param as any).$ref !== 'undefined';
}

function isBodyParameter(obj: any): obj is OpenAPI.BodyParameter {
  return typeof obj['in'] === 'string' && obj.in === 'body';
}
