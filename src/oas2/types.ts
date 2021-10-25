/* eslint-disable @typescript-eslint/no-namespace */
export namespace OpenAPI {
  export type Schema = {
    swagger: '2.0';
    info: Info;
    host?: string;
    basePath?: string;
    schemes?: ['http' | 'https' | 'ws' | 'wss'];
    consumes?: string[];
    produces?: string[];
    paths: Record<string, PathItem | Reference>;
    definitions?: Definitions;
    parameters?: ParameterDefinitions;
    responses?: ResponseDefinitions;
    securityDefinitions?: SecurityDefinitions;
    security?: SecurityRequirement[];
    tags?: Tag[];
    externalDocs?: ExternalDocumentation;
  };

  export type Info = {
    version: string;
    title: string;
    description?: string;
    termsOfService?: string;
    contact?: Contact;
    license?: License;
  };

  export type PathItem = {
    get?: Operation;
    put?: Operation;
    post?: Operation;
    delete?: Operation;
    options?: Operation;
    head?: Operation;
    patch?: Operation;
    parameters?: (Parameter | Reference)[];
  };

  export type BodyParameter = {
    name: string;
    in: 'body';
    description?: string;
    required?: boolean;
    schema: JsonSchema | Reference;
  };

  export type NonBodyParameter = {
    name: string;
    in: 'query' | 'header' | 'path' | 'formData';
    description?: string;
    required?: boolean;
    allowEmptyValue?: boolean;
    collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi';
    default?: any;
  } & Exclude<JsonSchema, ObjectSchema>;

  export type Parameter = BodyParameter | NonBodyParameter;

  export type Headers = {
    [name: string]: Header;
  };

  export type Header = {
    description?: string;
    collectionFormat?: 'csv' | 'ssv' | 'tsv' | 'pipes' | 'multi';
    default?: any;
  } & JsonSchema;

  export type Reference = {
    $ref: string;
  };

  export type Definitions = {
    [name: string]: JsonSchema;
  };

  export type ParameterDefinitions = {
    [name: string]: Parameter;
  };

  export type Responses = {
    [httpStatusCode: string]: Response | Reference;
  };

  export type ResponseDefinitions = {
    [name: string]: Response;
  };

  export type Response = {
    description: string;
    schema?: JsonSchema | Reference;
    headers?: Headers;
    examples?: Examples;
  };

  export type Examples = {
    [mimeType: string]: any;
  };

  export type SecurityDefinitions = {
    [name: string]: SecurityScheme;
  };

  export type SecurityScheme =
    | {
        type: 'basic';
        description?: string;
      }
    | {
        type: 'apiKey';
        description?: string;
        name: string;
        in: 'header' | 'query';
      }
    | {
        type: 'oauth2';
        description?: string;
        name: string;
        authorizationUrl: string;
        tokenUrl: string;
        scopes: Scopes;
      };

  export type Scopes = {
    [name: string]: string;
  };

  export type SecurityRequirement = {
    [name: string]: string[];
  };

  export type Tag = {
    name: string;
    description?: string;
    externalDocs?: ExternalDocumentation;
  };

  export type ExternalDocumentation = {
    description?: string;
    url: string;
  };

  export type Contact = {
    name?: string;
    url?: string;
    email?: string;
  };

  export type License = {
    name: string;
    url?: string;
  };

  export type Operation = {
    tags?: string[];
    summary?: string;
    description?: string;
    externalDocs?: ExternalDocumentation;
    operationId?: string;
    consumes?: string[];
    produces?: string[];
    parameters?: (Parameter | Reference)[];
    responses: Responses;
    schemes?: ['http' | 'https' | 'ws' | 'wss'];
    deprecated?: boolean;
    security?: SecurityRequirement[];
  };

  export type JsonSchema =
    | StringSchema
    | NumberSchema
    | BooleanSchema
    | NullSchema
    | ArraySchema
    | ObjectSchema;

  export type StringSchema = {
    type: 'string';
    description?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
    enum?: string[];
  };

  export type NumberSchema = {
    type: 'number' | 'integer';
    description?: string;
    multipleOf?: number;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maximum?: number;
    exclusiveMaximum?: boolean;
  };

  export type BooleanSchema = {
    type: 'boolean';
    description?: string;
  };

  export type NullSchema = {
    type: 'null';
    description?: string;
  };

  export type ArraySchema = {
    type: 'array';
    description?: string;
    items: JsonSchema | Reference;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
  };

  export type ObjectSchema = {
    type: 'object';
    description?: string;
    required?: string[];
    properties?: Record<string, JsonSchema | Reference>;
    allOf?: (Record<string, JsonSchema | Reference> | Reference)[];
    minProperties?: number;
    maxProperties?: number;
    additionalProperties?: boolean;
  };

  export type TypePrimitive = JsonSchema['type'];

  export type PropertyType = TypePrimitive | TypePrimitive[];
}
