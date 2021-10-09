import { major } from 'semver';
import { singular } from 'pluralize';
import { OpenAPI } from './types';
import { camel } from 'case';

export class Parser {
  constructor(
    private readonly schema: OpenAPI.Schema,
    private readonly title: string,
  ) {}

  private enums: Enum[];
  private anonymousTypes: Type[];

  parse(): Service {
    this.enums = [];
    this.anonymousTypes = [];
    const interfaces = this.parseInterfaces();
    const types = this.parseDefinitions();

    return {
      title: this.title,
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
      for (const verb in this.schema.paths[path]) {
        const operation: OpenAPI.Operation = this.schema.paths[path][verb];
        methods.push({
          name: operation.operationId || 'UNNAMED',
          parameters: this.parseParameters(operation),
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

  private parseParameters(operation: OpenAPI.Operation): Parameter[] {
    if (!operation.parameters?.length) return [];

    return operation.parameters.map((p) =>
      this.parseParameter(this.resolve(p), operation.operationId || ''),
    );
  }

  private parseParameter(
    param: OpenAPI.Parameter,
    methodName: string,
  ): Parameter {
    const { typeName, isLocal, isArray } = this.parseType(
      param.in === 'body' ? param.schema : param,
      param.name,
      methodName,
    );
    return {
      name: param.name,
      description: this.parseDescription(undefined, param.description),
      typeName,
      isRequired: param.required || false,
      isLocal,
      isArray,
    };
  }

  private parseType(
    def: OpenAPI.Parameter | OpenAPI.JsonSchema | OpenAPI.Reference,
    localName: string,
    parentName: string,
  ): {
    typeName: string;
    enumValues?: string[];
    isLocal: boolean;
    isArray: boolean;
  } {
    if (isReference(def)) {
      return {
        typeName: def.$ref.startsWith('#/definitions/')
          ? def.$ref.substr(14)
          : def.$ref,
        isLocal: true,
        isArray: false,
      };
    }

    const resolved = isReference(def) ? this.resolve(def) : def;

    switch (resolved.type) {
      case 'string':
        if (resolved.enum) {
          const enumName = camel(`${parentName}_${singular(localName)}`);
          this.enums.push({
            name: enumName,
            values: resolved.enum,
          });
          return {
            typeName: enumName,
            isLocal: true,
            isArray: false,
          };
        } else {
          return {
            typeName: resolved.type,
            isLocal: false,
            isArray: false,
          };
        }
      case 'number':
      case 'integer':
      case 'boolean':
      case 'null':
        return { typeName: resolved.type, isLocal: false, isArray: false };
      case 'array':
        const items = this.parseType(resolved.items, localName, parentName);
        return {
          typeName: items.typeName,
          isLocal: items.isLocal,
          isArray: true,
        };
      case 'object':
        const typeName = camel(`${parentName}_${localName}`);
        this.anonymousTypes.push({
          name: typeName,
          properties: this.parseProperties(resolved),
          description: resolved.description,
        });

        return {
          typeName,
          isLocal: true,
          isArray: false,
        };
      default:
        return {
          typeName: '>>>>>>>>>>>>>>>>> unknown <<<<<<<<<<<<<<<<<<<',
          isLocal: true,
          isArray: false,
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

    if (!response.schema?.type && !response.schema?.$ref) return;

    return this.parseType(
      response.schema,
      'response',
      operation.operationId || '',
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
        properties: this.parseProperties(def),
      };
    });
  }

  private parseProperties(def: OpenAPI.JsonSchema): Property[] {
    if (def.allOf) {
      return def.allOf
        .map((subDef) => this.parseProperties(this.resolve(subDef)))
        .reduce((a, b) => a.concat(b), []);
    } else {
      const required = new Set<string>(def.required || []);
      const props: Property[] = [];
      for (const name in def.properties) {
        const prop = def.properties[name];
        const { typeName, isArray, isLocal } = this.parseType(
          prop,
          name,
          def.name,
        );
        props.push({
          name,
          description: prop.description,
          typeName,
          isArray,
          isLocal,
          isRequired: required.has(name),
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
  isRequired: boolean;
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
  isRequired: boolean;
};

export type ReturnType = {
  typeName: string;
  isArray: boolean;
  isLocal: boolean;
};

function isReference<T>(
  param: T | OpenAPI.Reference,
): param is OpenAPI.Reference {
  return typeof (param as any).$ref !== 'undefined';
}
