import { constant, pascal, snake } from 'case';
import {
  File,
  FileFactory,
  isRequired,
  Method,
  Parameter,
  Property,
  Service,
  ValidationRule,
  ReturnType,
  Type,
} from '../types';
import {
  buildMethodParams,
  buildModuleNamespace,
  buildNamespacedPath,
  buildTypeName,
  preamble,
  prefix,
} from './utils';

export type GuardClauseFactory = (
  param: Parameter | Property,
  rule: ValidationRule,
  moduleNamespace: string,
  errorType: string,
  indent: number,
  typeName?: string,
) => Iterable<string>;

export type RulelessGuardClauseFactory = (
  param: Parameter | Property,
  moduleNamespace: string,
  errorType: string,
  indent: number,
  typeName?: string,
) => Iterable<string>;

export class ValidatorFactory implements FileFactory {
  public readonly target = 'ruby-sorbet';

  build(service: Service): File[] {
    return [
      {
        path: [...buildNamespacedPath(service), `validators.rb`],
        contents: Array.from(this.buildModule(service)).join('\n'),
      },
    ];
  }

  private *buildModule(service: Service): Iterable<string> {
    const methods = service.interfaces
      .map((i) => i.methods)
      .reduce((a, b) => a.concat(b), []);

    yield* preamble();

    yield `module ${buildModuleNamespace(service)}::Validators`;
    yield `${prefix(1)}extend T::Sig`;

    for (const method of methods) {
      if (!method.parameters.length) continue;
      yield '';
      yield* this.buildMethodParamsValidator(method, service, 1);
    }

    for (const type of service.types) {
      if (!type.properties.length) continue;
      yield '';
      yield* this.buildTypeValidator(type, service, 1);
    }

    yield 'end';
  }

  private *buildMethodParamsValidator(
    method: Method,
    service: Service,
    indent: number,
  ): Iterable<string> {
    const errorType = `${buildModuleNamespace(service)}::ValidationError`;
    yield* buildSignature(method.parameters, service, errorType, indent);
    yield `${prefix(indent)}def ${snake(
      `validate_${snake(method.name)}_params`,
    )}${buildMethodParams(method)}`;
    yield `${prefix(
      indent + 1,
    )}errors = T.let([], T::Array[${buildModuleNamespace(
      service,
    )}::ValidationError])`;
    const moduleNamespace = buildModuleNamespace(service);

    for (const param of method.parameters) {
      for (const factory of rulelessFactories) {
        yield* factory(param, moduleNamespace, errorType, indent + 1);
      }
      for (const rule of param.rules) {
        for (const factory of ruleFactories) {
          yield* factory(param, rule, moduleNamespace, errorType, indent + 1);
        }
      }
    }
    yield '';
    yield `${prefix(indent + 1)}errors`;
    yield `${prefix(indent)}end`;
  }

  private *buildTypeValidator(
    type: Type,
    service: Service,
    indent: number,
  ): Iterable<string> {
    const errorType = `${buildModuleNamespace(service)}::ValidationError`;

    const params = `${snake(type.name)}: ${buildModuleNamespace(
      service,
    )}::${pascal(type.name)}`;

    yield `${prefix(indent)}sig do`;
    yield `${prefix(indent + 1)}params(${params}).`;
    yield `${prefix(indent + 2)}return(T::Array[${errorType}])`;
    yield `${prefix(indent)}end`;

    yield `${prefix(indent)}def ${snake(
      `validate_${snake(type.name)}`,
    )}(${snake(type.name)}:)`;
    yield `${prefix(
      indent + 1,
    )}errors = T.let([], T::Array[${buildModuleNamespace(
      service,
    )}::ValidationError])`;
    const moduleNamespace = buildModuleNamespace(service);

    for (const property of type.properties) {
      for (const factory of rulelessFactories) {
        yield* factory(
          property,
          moduleNamespace,
          errorType,
          indent + 1,
          snake(type.name),
        );
      }
      for (const rule of property.rules) {
        for (const factory of ruleFactories) {
          yield* factory(
            property,
            rule,
            moduleNamespace,
            errorType,
            indent + 1,
            snake(type.name),
          );
        }
      }
    }

    yield '';
    yield `${prefix(indent + 1)}errors`;
    yield `${prefix(indent)}end`;
  }
}

function* buildSignature(
  parameters: Parameter[],
  service: Service,
  errorType: string,
  indent: number,
): Iterable<string> {
  const sortedParams = [
    ...parameters.filter((p) => isRequired(p)),
    ...parameters.filter((p) => !isRequired(p)),
  ];

  const params = sortedParams
    .map(
      (p) =>
        `${snake(p.name)}: ${
          isRequired(p)
            ? buildTypeName(p, buildModuleNamespace(service))
            : `T.nilable(${buildTypeName(p, buildModuleNamespace(service))})`
        }`,
    )
    .join(', ');

  yield `${prefix(indent)}sig do`;
  yield `${prefix(indent + 1)}params(${params}).`;
  yield `${prefix(indent + 2)}return(T::Array[${errorType}])`;
  yield `${prefix(indent)}end`;
}

function buildValidatorName(
  type: Parameter | Property | ReturnType,
  moduleNamespace: string,
): string {
  const x = buildTypeName(type, moduleNamespace).split('::');

  x[x.length - 1] = `validate_${snake(x[x.length - 1])}`;

  return x.join('::');
}

function buildConditions(
  typeName: string | undefined,
  param: Parameter | Property,
  conditions: (n: string) => string[],
): string[] {
  if (param.isArray) {
    return [
      `${buildName(typeName, param.name)}.is_a? Array`,
      `!${buildName(typeName, param.name)}.any? { |x| => ${conditions('x').join(
        ' && ',
      )} }`,
    ];
  } else {
    return conditions(param.name);
  }
}

function buildMessage(param: Parameter | Property, message: string): string {
  return param.isArray ? `Each item in ${message}` : message;
}

function* buildError(
  id: string,
  title: string,
  path: string,
  errorType: string,
  indent: number,
): Iterable<string> {
  yield `${prefix(indent)}errors << ${errorType}.new(`;
  yield `${prefix(indent + 1)}code: '${constant(id)}',`;
  yield `${prefix(indent + 1)}title: '${title}',`;
  yield `${prefix(indent + 1)}path: '${path}',`;
  yield `${prefix(indent)})`;
}

const buildRequiredClause: RulelessGuardClauseFactory = function* (
  param,
  moduleNamespace,
  errorType,
  indent,
) {
  if (isRequired(param)) {
    yield '';
    yield `${prefix(indent)}if ${snake(param.name)}.nil?`;
    yield* buildError(
      'required',
      `"${snake(param.name)}" is required`,
      snake(param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
};

function buildName(parent: string | undefined, child: string) {
  return [parent, child]
    .filter((x) => x)
    .map(snake)
    .join('.');
}

const buildNonLocalTypeClause: RulelessGuardClauseFactory = function* (
  param,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (!param.isLocal) {
    const rootTypeName = buildTypeName(param, moduleNamespace, true);

    const conditions = param.isArray
      ? [
          `${buildName(typeName, param.name)}.is_a? Array`,
          `${buildName(
            typeName,
            param.name,
          )}.any? { |x| => !x.is_a? ${rootTypeName} }`,
        ]
      : [
          `!${buildName(typeName, param.name)}.nil?`,
          `!${buildName(typeName, param.name)}.is_a? ${rootTypeName}`,
        ];

    const message = `"${buildName(
      typeName,
      param.name,
    )}" must be a ${rootTypeName}`;

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      'type',
      buildMessage(
        param,
        `${message}${isRequired(param) ? '' : ` if supplied`}`,
      ),
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

const buildLocalTypeClause: RulelessGuardClauseFactory = function* (
  param,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  const name = buildName(typeName, param.name);
  const fn = buildValidatorName(param, moduleNamespace);

  if (param.isLocal) {
    yield '';
    if (param.isArray) {
      yield `${prefix(indent)}if !${name}.nil?`;
      yield `${prefix(indent + 1)}${name}.each { |x| errors.concat(${fn}(x)) }`;
      yield `${prefix(indent)}end`;
    } else {
      yield `${prefix(indent)}if !${name}.nil?`;
      yield `${prefix(indent + 1)}errors.concat(${fn}(${name}))`;
      yield `${prefix(indent)}end`;
    }
  }
  return;
};

const rulelessFactories = [
  buildRequiredClause,
  buildNonLocalTypeClause,
  buildLocalTypeClause,
];

// TODO: fix non-type-prefixed names

export const buildStringMaxLengthClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'string-max-length') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_a? String`,
      `${buildName(typeName, name)}.length > ${rule.length}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      `"${buildName(typeName, param.name)}" max length is ${rule.length}`,
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildStringMinLengthClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'string-min-length') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_a? String`,
      `${buildName(typeName, name)}.length < ${rule.length}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      `"${buildName(typeName, param.name)}" min length is ${rule.length}`,
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildStringPatternClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'string-pattern') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_a? String`,
      `/${rule.pattern}/.match? ${buildName(typeName, name)}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      `"${buildName(typeName, param.name)}" must match the pattern /${
        rule.pattern
      }/`,
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildNumberMultipleOfClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'number-multiple-of') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_a? Numeric`,
      `${buildName(typeName, name)} % ${rule.value} != 0`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      `"${buildName(typeName, param.name)}" must be a multiple of ${
        rule.value
      }`,
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildNumberGreaterThanClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'number-gt') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_a? Numeric`,
      `${buildName(typeName, name)} <= ${rule.value}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      buildMessage(
        param,
        `"${buildName(typeName, param.name)}" must be greater than ${
          rule.value
        }`,
      ),
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildNumberGreaterOrEqualClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'number-gte') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_a? Numeric`,
      `${buildName(typeName, name)} < ${rule.value}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      buildMessage(
        param,
        `"${buildName(
          typeName,
          param.name,
        )}" must be greater than or equal to ${rule.value}`,
      ),
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildNumberLessThanClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'number-lt') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_a? Numeric`,
      `${buildName(typeName, name)} => ${rule.value}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      buildMessage(
        param,
        `"${buildName(typeName, param.name)}" must be less than ${rule.value}`,
      ),
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildNumberLessOrEqualClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'number-lte') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_a? Numeric`,
      `${buildName(typeName, name)} > ${rule.value}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      buildMessage(
        param,
        `"${buildName(typeName, param.name)}" must be less than or equal to ${
          rule.value
        }`,
      ),
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildArrayMaxItemsClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'array-max-items') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_an? Array`,
      `${buildName(typeName, name)}.length > ${rule.max}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      `"${buildName(typeName, param.name)}" max length is ${rule.max}`,
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildArrayMinItemsClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'array-min-items') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_an? Array`,
      `${buildName(typeName, name)}.length < ${rule.min}`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      `"${buildName(typeName, param.name)}" min length is ${rule.min}`,
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

export const buildArrayUniqueItemsClause: GuardClauseFactory = function* (
  param,
  rule,
  moduleNamespace,
  errorType,
  indent,
  typeName,
) {
  if (rule.id === 'array-unique-items') {
    const conditions = buildConditions(typeName, param, (name: string) => [
      `${buildName(typeName, name)}.is_an? Array`,
      `${buildName(typeName, name)}.length != ${buildName(
        typeName,
        name,
      )}.uniq.length`,
    ]);

    yield '';
    yield `${prefix(indent)}if ${conditions.join(' && ')}`;
    yield* buildError(
      rule.id,
      `"${param.name}" must contain unique values`,
      buildName(typeName, param.name),
      errorType,
      indent + 1,
    );
    yield `${prefix(indent)}end`;
  }
  return;
};

// TODO: build object errors here

const ruleFactories = [
  buildStringMaxLengthClause,
  buildStringMinLengthClause,
  buildStringPatternClause,
  buildNumberMultipleOfClause,
  buildNumberGreaterThanClause,
  buildNumberGreaterOrEqualClause,
  buildNumberLessThanClause,
  buildArrayMaxItemsClause,
  buildArrayMinItemsClause,
  buildArrayUniqueItemsClause,
];
