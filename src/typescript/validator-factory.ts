import { camel, constant, pascal } from 'case';
import { format } from 'prettier';
import {
  Enum,
  File,
  FileFactory,
  isRequired,
  Method,
  Parameter,
  Property,
  Service,
  Type,
  ValidationRule,
} from '../types';
import { warning } from './warning';

export type GuardClauseFactory = (
  param: Parameter | Property,
  rule: ValidationRule,
) => string | undefined;

export class ValidatorFactory implements FileFactory {
  public readonly target = 'typescript';

  constructor(private readonly factories: GuardClauseFactory[]) {}

  build(service: Service): File[] {
    const imports = Array.from(this.buildImports()).join('\n');
    const standardTypes = Array.from(this.buildStandardTypes()).join('\n');

    const methodParams = service.interfaces
      .map((int) => int.methods)
      .reduce((a, b) => a.concat(b), [])
      .map((m) =>
        Array.from(this.buildMethodParamsValidator(m))
          .filter((x) => x)
          .join('\n'),
      )
      .join('\n\n');

    const types = service.types
      .map((t) =>
        Array.from(this.buildTypeValidator(t))
          .filter((x) => x)
          .join('\n'),
      )
      .join('\n\n');

    const enums = service.enums
      .map((e) =>
        Array.from(this.buildEnumValidator(e))
          .filter((x) => x)
          .join('\n'),
      )
      .join('\n\n');

    const contents = [
      warning,
      imports,
      standardTypes,
      methodParams,
      types,
      enums,
    ].join('\n\n');
    const formatted = format(contents, {
      singleQuote: true,
      useTabs: false,
      tabWidth: 2,
      trailingComma: 'all',
      parser: 'typescript',
    });

    return [
      {
        path: [`v${service.majorVersion}`, 'validators.ts'],
        contents: formatted,
      },
    ];
  }

  private *buildImports(): Iterable<string> {
    yield 'import * as types from "./types"';
  }

  private *buildStandardTypes(): Iterable<string> {
    yield 'export type ValidationError = { code: string, title: string, path: string };';
  }

  private *buildMethodParamsValidator(
    method: Method,
  ): Iterable<string | undefined> {
    yield* this.buildDescription(method.name, method.parameters);
    yield `export function ${camel(`validate_${method.name}_params`)}(`;

    const sortedParams = [
      ...method.parameters.filter((p) => isRequired(p)),
      ...method.parameters.filter((p) => !isRequired(p)),
    ];

    for (const param of sortedParams) {
      yield `    ${camel(param.name)}${isRequired(param) ? '' : '?'}: ${
        param.isLocal ? 'types.' : ''
      }${buildTypeName(param)},`;
    }

    yield `): ValidationError[] {`;
    if (method.parameters.length) {
      yield 'const errors: ValidationError[] = [];';
    }

    for (const param of method.parameters) {
      yield buildRequiredClause(param);
      yield buildNonLocalTypeClause(param);
      yield buildLocalTypeClause(param);

      for (const rule of param.rules) {
        for (const factory of this.factories) {
          yield factory(param, rule);
        }
      }
    }

    if (method.parameters.length) {
      yield 'return errors;';
    } else {
      yield 'return [];';
    }
    yield `}`;
  }

  private *buildTypeValidator(type: Type): Iterable<string | undefined> {
    yield `export function ${camel(`validate_${type.name}`)}({`;
    yield type.properties.map((p) => camel(p.name)).join(',');
    yield `}: types.${pascal(type.name)}): ValidationError[] {`;

    if (type.properties.length || type.rules.length) {
      yield 'const errors: ValidationError[] = [];';
    }

    // TODO: build object rules
    // for (const rule of type.rules) {
    //   for (const factory of this.factories) {
    //     yield factory(type, rule);
    //   }
    // }

    for (const property of type.properties) {
      yield buildRequiredClause(property);
      yield buildNonLocalTypeClause(property);
      yield buildLocalTypeClause(property);

      for (const rule of property.rules) {
        for (const factory of this.factories) {
          yield factory(property, rule);
        }
      }
    }

    if (type.properties.length || type.rules.length) {
      yield 'return errors;';
    } else {
      yield 'return [];';
    }

    yield `}`;

    yield `export function ${camel(
      `is_${type.name}`,
    )}(obj: any): obj is types.${pascal(
      type.name,
    )} { return typeof obj !== 'undefined' && !${camel(
      `validate_${type.name}`,
    )}(obj).length }`;
  }

  private *buildEnumValidator(e: Enum): Iterable<string | undefined> {
    yield `export function ${camel(`validate_${e.name}`)}(${camel(
      e.name,
    )}: types.${pascal(e.name)}): ValidationError[] {`;

    yield 'const errors: ValidationError[] = [];';

    const values = `[${e.values.map((v) => `"${v}"`).join(', ')}]`;

    const conditions = [
      `typeof ${camel(e.name)} === 'string'`,
      `!${values}.includes(${camel(e.name)})`,
    ];

    yield `if(${conditions.join(' && ')}) {${buildError(
      'string-enum',
      `Value must be one of ${values}`,
      '',
    )}}`;

    yield 'return [];';

    yield `}`;
  }

  private *buildDescription(
    name: string,
    params: Parameter[] = [],
    indent: number = 0,
  ): Iterable<string> {
    const s = ' '.repeat(indent);

    yield ``;
    yield `${s}/**`;

    yield `${s} * Validates input parameters for the ${camel(name)}() method.`;

    const sortedParams = [
      ...params.filter((p) => isRequired(p)),
      ...params.filter((p) => !isRequired(p)),
    ];

    for (const param of sortedParams) {
      yield `${s} * @param ${camel(param.name)}${
        param.description ? ` ${param.description}` : ''
      }`;
    }

    yield `${s} */`;
  }
}

function buildError(id: string, title: string, path: string): string {
  return `errors.push({code: '${constant(
    id,
  )}', title: '${title}', path: '${path}' });`;
}

function buildTypeName(
  type: {
    typeName: string;
    isUnknown: boolean;
    enumValues?: string[];
    isArray: boolean;
    isLocal: boolean;
  },
  skipArrayify: boolean = false,
): string {
  const arrayify = (n: string) =>
    type.isArray && !skipArrayify ? `${n}[]` : n;

  if (type.isUnknown) {
    return arrayify('any');
  } else if (type.isLocal) {
    return arrayify(`${pascal(type.typeName)}`);
  }

  switch (type.typeName) {
    case 'string':
      if (type.enumValues) {
        return arrayify(
          `(${type.enumValues.map((v) => `'${v}'`).join(' | ')})`,
        );
      } else {
        return arrayify('string');
      }
    case 'number':
    case 'integer':
      return arrayify('number');
    case 'boolean':
      return arrayify('boolean');
    default:
      return arrayify('any');
  }
}

function buildConditions(
  param: Parameter,
  conditions: (n: string) => string[],
): string[] {
  if (param.isArray) {
    return [
      `Array.isArray(${camel(param.name)})`,
      `!${camel(param.name)}.some((x) => ${conditions('x').join(' && ')})`,
    ];
  } else {
    return conditions(camel(param.name));
  }
}

function buildMessage(param: Parameter | Property, message: string): string {
  return param.isArray ? `Each item in ${message}` : message;
}

function buildRequiredClause(param: Parameter | Property): string | undefined {
  if (isRequired(param)) {
    return `if(typeof ${camel(param.name)} === 'undefined') {${buildError(
      'required',
      `"${camel(param.name)}" is required`,
      camel(param.name),
    )}}`;
  }
  return;
}

function buildNonLocalTypeClause(
  param: Parameter | Property,
): string | undefined {
  if (!param.isLocal && !param.isUnknown) {
    const rootTypeName = buildTypeName(param, true);

    const conditions = param.isArray
      ? [
          `Array.isArray(${camel(param.name)})`,
          `${camel(param.name)}.some(x => typeof x !== '${rootTypeName}')`,
        ]
      : [
          `typeof ${camel(param.name)} !== 'undefined'`,
          `typeof ${camel(param.name)} !== '${rootTypeName}'`,
        ];

    const message = `"${camel(param.name)}" must be a ${rootTypeName}`;

    return `if(${conditions.join(' && ')}) {${buildError(
      'type',
      buildMessage(
        param,
        `${message}${isRequired(param) ? '' : ` if supplied`}`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
}

function buildLocalTypeClause(param: Parameter | Property): string | undefined {
  if (param.isLocal && !param.isUnknown) {
    if (param.isArray) {
      return `if(typeof ${camel(param.name)} !== 'undefined') {${camel(
        param.name,
      )}.forEach( arrayItem => errors.push(...${camel(
        `validate_${buildTypeName(param)}`,
      )}(arrayItem)));}`;
    } else {
      return `if(typeof ${camel(
        param.name,
      )} !== 'undefined') { errors.push(...${camel(
        `validate_${buildTypeName(param)}`,
      )}(${camel(param.name)})); }`;
    }
  }
  return;
}

export const buildStringEnumRuleClause: GuardClauseFactory = (param, rule) => {
  if (rule.id === 'string-enum') {
    const values = `[${rule.values.map((v) => `"${v}"`).join(', ')}]`;

    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'string'`,
      `!${values}.includes(${name})`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(param, `"${camel(param.name)}" must be one of ${values}`),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildStringMaxLengthClause: GuardClauseFactory = (param, rule) => {
  if (rule.id === 'string-max-length') {
    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'string'`,
      `${name}.length > ${rule.length}`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(
        param,
        `"${camel(param.name)}" max length is ${rule.length}`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildStringMinLengthClause: GuardClauseFactory = (param, rule) => {
  if (rule.id === 'string-min-length') {
    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'string'`,
      `${name}.length < ${rule.length}`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(
        param,
        `"${camel(param.name)}" min length is ${rule.length}`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildStringPatternClause: GuardClauseFactory = (param, rule) => {
  if (rule.id === 'string-pattern') {
    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'string'`,
      `/${rule.pattern}/.test(${name})`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(
        param,
        `"${camel(param.name)}" must match the pattern /${rule.pattern}/`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildNumberMultipleOfClause: GuardClauseFactory = (
  param,
  rule,
) => {
  if (rule.id === 'number-multiple-of') {
    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'number'`,
      `${name} % ${rule.value} !== 0`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(
        param,
        `"${camel(param.name)}" must be a multiple of ${rule.value}`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildNumberGreaterThanClause: GuardClauseFactory = (
  param,
  rule,
) => {
  if (rule.id === 'number-gt') {
    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'number'`,
      `${name} <= ${rule.value}`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(
        param,
        `"${camel(param.name)}" must be greater than ${rule.value}`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildNumberGreaterOrEqualClause: GuardClauseFactory = (
  param,
  rule,
) => {
  if (rule.id === 'number-gte') {
    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'number'`,
      `${name} < ${rule.value}`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(
        param,
        `"${camel(param.name)}" must be greater than or equal to ${rule.value}`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildNumberLessThanClause: GuardClauseFactory = (param, rule) => {
  if (rule.id === 'number-lt') {
    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'number'`,
      `${name} >= ${rule.value}`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(
        param,
        `"${camel(param.name)}" must be less than ${rule.value}`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildNumberLessOrEqualClause: GuardClauseFactory = (
  param,
  rule,
) => {
  if (rule.id === 'number-lte') {
    const conditions = buildConditions(param, (name: string) => [
      `typeof ${name} === 'number'`,
      `${name} > ${rule.value}`,
    ]);

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      buildMessage(
        param,
        `"${camel(param.name)}" must be less than or equal to ${rule.value}`,
      ),
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildArrayMaxItemsClause: GuardClauseFactory = (param, rule) => {
  if (rule.id === 'array-max-items') {
    const conditions = [
      `Array.isArray(${camel(param.name)})`,
      `${camel(param.name)}.length > ${rule.max}`,
    ];

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      `"${camel(param.name)}" max length is ${rule.max}`,
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildArrayMinItemsClause: GuardClauseFactory = (param, rule) => {
  if (rule.id === 'array-min-items') {
    const conditions = [
      `Array.isArray(${camel(param.name)})`,
      `${camel(param.name)}.length < ${rule.min}`,
    ];

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      `"${camel(param.name)}" min length is ${rule.min}`,
      camel(param.name),
    )}}`;
  }
  return;
};

export const buildArrayUniqueItemsClause: GuardClauseFactory = (
  param,
  rule,
) => {
  if (rule.id === 'array-unique-items') {
    const conditions = [
      `Array.isArray(${camel(param.name)})`,
      `${param.name}.length === new Set(${camel(param.name)}).length`,
    ];

    return `if(${conditions.join(' && ')}) {${buildError(
      rule.id,
      `"${camel(param.name)}" must contain unique values`,
      camel(param.name),
    )}}`;
  }
  return;
};

export const defaultFactories = [
  buildStringEnumRuleClause,
  buildStringMaxLengthClause,
  buildStringMinLengthClause,
  buildStringPatternClause,
  buildNumberMultipleOfClause,
  buildNumberGreaterThanClause,
  buildNumberGreaterOrEqualClause,
  buildNumberLessThanClause,
  buildNumberLessOrEqualClause,
  buildArrayMaxItemsClause,
  buildArrayMinItemsClause,
  buildArrayUniqueItemsClause,
];
