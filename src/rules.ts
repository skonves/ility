import { OpenAPI } from './types';

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

export type RequiredRule = {
  id: 'required';
};

export type StringRule = {
  id: 'string';
};

export type StringMaxLengthRule = {
  id: 'string-max-length';
  length: number;
};

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

export type StringMinLengthRule = {
  id: 'string-min-length';
  length: number;
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

export type StringPatternRule = {
  id: 'string-pattern';
  pattern: string;
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

export type StringFormatRule = {
  id: 'string-format';
  format: string;
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

export type StringEnumRule = {
  id: 'string-enum';
  values: string[];
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

export type NumberMultipleOfRule = {
  id: 'number-multiple-of';
  value: number;
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

export type NumberGtRule = {
  id: 'number-gt';
  value: number;
};

export type NumberGteRule = {
  id: 'number-gte';
  value: number;
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

export type NumberLtRule = {
  id: 'number-lt';
  value: number;
};

export type NumberLteRule = {
  id: 'number-lte';
  value: number;
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

export type ObjectMinPropertiesRule = {
  id: 'object-min-properties';
  min: number;
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

export type ObjectMaxPropertiesRule = {
  id: 'object-max-properties';
  max: number;
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

export type ObjectAdditionalPropertiesRule = {
  id: 'object-additional-properties';
  forbidden: true;
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

export type ValidationRule =
  | RequiredRule
  | StringMaxLengthRule
  | StringMinLengthRule
  | StringPatternRule
  | StringFormatRule
  | StringEnumRule
  | NumberMultipleOfRule
  | NumberGtRule
  | NumberGteRule
  | NumberLtRule
  | NumberLteRule;

export type ObjectValidationRule =
  | ObjectMinPropertiesRule
  | ObjectMaxPropertiesRule
  | ObjectAdditionalPropertiesRule;

export const factories = [
  stringEnumFactory,
  stringFormatFactory,
  stringMaxLengthFactory,
  stringMinLengthFactory,
  stringPatternFactory,
  numberMultipleOfFactory,
  numberGreaterThanFactory,
  numberLessThanFactory,
];

export const objectFactories = [
  objectMaxPropertiesFactory,
  objectMinPropertiesFactory,
  objectAdditionalPropertiesFactory,
];
