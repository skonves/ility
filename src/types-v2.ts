import {
  Enum,
  Interface,
  Method,
  Parameter,
  Property,
  ReturnType,
  Service,
  Type,
} from './types';

export interface Plugin {
  readonly id: string;
}

export type ValidationError = {
  validator: string;
  message: string;
};

export interface Validator {
  (input: Buffer, encoding?: BufferEncoding): ValidationError[];
}

export type ParserOptions = {
  encoding?: BufferEncoding;
  validators?: Validator[];
  servicePlugins?: ServicePlugin[];
  interfacePlugins?: InterfacePlugin[];
  typePlugins?: TypePlugin[];
  propertyPlugins?: PropertyPlugin[];
  enumPlugins?: EnumPlugin[];
  methodPlugins?: MethodPlugin[];
  parameterPlugins?: ParameterPlugin[];
  returnTypePlugins?: ReturnTypePlugin[];
};
export interface Parser {
  (input: Buffer, parser: ParserCore, options?: ParserOptions):
    | Service
    | ValidationError[];
}

export interface ParserCore {
  (input: Buffer, encoding?: BufferEncoding): Service;
}

export type PluginOptions = {
  encoding?: BufferEncoding;
};

export type PluginOutput = {
  id: string;
  payload: any;
};

export type ServicePluginOptions = PluginOptions;
export interface ServicePlugin {
  (input: Buffer, target: Service, options: ServicePluginOptions): PluginOutput;
}

export type InterfacePluginOptions = PluginOptions & {
  service: Service;
};
export interface InterfacePlugin {
  (
    input: Buffer,
    target: Interface,
    options: InterfacePluginOptions,
  ): PluginOutput;
}

export type TypePluginOptions = PluginOptions & {
  service: Service;
};
export interface TypePlugin {
  (input: Buffer, target: Type, options: TypePluginOptions): PluginOutput;
}

export type PropertyPluginOptions = PluginOptions & {
  service: Service;
  type: Type;
};
export interface PropertyPlugin {
  (
    input: Buffer,
    target: Property,
    options: PropertyPluginOptions,
  ): PluginOutput;
}

export type EnumPluginOptions = PluginOptions;
export interface EnumPlugin {
  (input: Buffer, target: Enum, options: EnumPluginOptions): PluginOutput;
}

export type MethodPluginOptions = PluginOptions & {
  service: Service;
  int: Interface;
};
export interface MethodPlugin {
  (input: Buffer, target: Method, options: MethodPluginOptions): PluginOutput;
}

export type ParameterPluginOptions = PluginOptions & {
  service: Service;
  int: Interface;
  method: Method;
};
export interface ParameterPlugin {
  (
    input: Buffer,
    target: Parameter,
    options: ParameterPluginOptions,
  ): PluginOutput;
}

export type ReturnTypePluginOptions = PluginOptions & {
  service: Service;
  int: Interface;
  method: Method;
};
export interface ReturnTypePlugin {
  (
    input: Buffer,
    target: ReturnType,
    options: ParameterPluginOptions,
  ): PluginOutput;
}
