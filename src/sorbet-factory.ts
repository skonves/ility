import { File, FileFactory } from './file-factory';
import {
  Enum,
  Interface,
  Method,
  Parameter,
  ReturnType,
  Service,
  Type,
} from './parser';

import { snake, pascal, constant } from 'case';

export class SorbetFactory implements FileFactory {
  public readonly target = 'ruby-sorbet';

  build(service: Service): File[] {
    const warning = `# This code was generated by a tool.
# ${require('../package.json').name}${require('../package.json').version}
#
# Changes to this file may cause incorrect behavior and will be lost if
# the code is regenerated.`;

    const interfaceFiles: File[] = service.interfaces.map((i) => ({
      path: [
        snake(service.title),
        `v${service.majorVersion}`,
        `${snake(i.name)}_service.rb`,
      ],
      contents: `${warning}\n\n${Array.from(
        this.buildInterface(i, service),
      ).join('\n')}`,
    }));

    const typeFiles: File[] = service.types.map((t) => ({
      path: [
        snake(service.title),
        `v${service.majorVersion}`,
        `${snake(`${t.name}`)}.rb`,
      ],
      contents: `${warning}\n\n${Array.from(this.buildStruct(t, service)).join(
        '\n',
      )}`,
    }));

    const enumFiles: File[] = service.enums.map((e) => ({
      path: [
        snake(service.title),
        `v${service.majorVersion}`,
        `${snake(`${e.name}`)}.rb`,
      ],
      contents: `${warning}\n\n${Array.from(this.buildEnum(e, service)).join(
        '\n',
      )}`,
    }));

    return [...interfaceFiles, ...typeFiles, ...enumFiles];
  }

  private *buildEnum(e: Enum, service: Service): Iterable<string> {
    yield '# typed: strict';
    yield '';
    yield "require 'typed_struct_helper'";
    yield '';
    yield `module ${pascal(service.title)}::V${service.majorVersion}`;
    yield `  class ${pascal(e.name)} < T::Enum`;
    yield '    enums do';
    for (const value of e.values) {
      yield `      ${constant(value)} = new('${value}')`;
    }
    yield '    end';
    yield '  end';
    yield 'end';
  }

  private *buildStruct(type: Type, service: Service): Iterable<string> {
    yield '# typed: strict';
    yield '';
    yield "require 'typed_struct_helper'";
    yield '';
    yield `module ${pascal(service.title)}::V${service.majorVersion}`;
    yield `  class ${pascal(type.name)} < T::Struct`;
    yield '    extend T::Sig';
    yield '    include TypedStructHelper';
    yield '';
    for (const property of type.properties) {
      const typeName = this.buildTypeName(property, service);
      yield `    const ${snake(property.name)}, ${
        property.isRequired ? typeName : `T.nilable(${typeName})`
      }`;
    }
    yield '  end';
    yield 'end';
  }

  private *buildInterface(int: Interface, service: Service): Iterable<string> {
    yield '# typed: strict';
    yield '';
    yield "require 'typed_struct_helper'";
    yield '';
    yield `module ${pascal(service.title)}::V${service.majorVersion}::${pascal(
      int.name,
    )}Service`;
    yield `  extend T::Sig`;
    yield `  extend T::Helpers`;
    yield '';
    yield '  interface!';
    for (const method of int.methods) {
      yield* this.buildMethod(method, service);
    }
    yield `end`;
  }

  private *buildMethod(method: Method, service: Service): Iterable<string> {
    yield '';
    yield '  sig do';
    if (method.returnType) {
      if (method.parameters.length) {
        yield* this.buildParamsWithReturnSignature(
          method.parameters,
          method.returnType,
          service,
        );
      } else {
        yield* this.buildReturnSignature(method.returnType, service);
      }
    } else {
      if (method.parameters.length) {
        yield* this.buildParamsVoidSignature(method.parameters, service);
      } else {
        yield* this.buildVoidSignature();
      }
    }
    yield '  end';
    yield `  def ${snake(method.name)}${this.buildMethodParams(method)}`;
    yield '  end';
  }

  private *buildVoidSignature(): Iterable<string> {
    yield `    abstract.void`;
  }

  private *buildReturnSignature(
    returnType: ReturnType,
    service: Service,
  ): Iterable<string> {
    yield `    abstract.returns(${this.buildTypeName(returnType, service)})`;
  }

  private *buildParamsVoidSignature(
    parameters: Parameter[],
    service: Service,
  ): Iterable<string> {
    const sortedParams = [
      ...parameters.filter((p) => p.isRequired),
      ...parameters.filter((p) => !p.isRequired),
    ];

    const params = sortedParams
      .map(
        (p) =>
          `${snake(p.name)}: ${
            p.isRequired
              ? this.buildTypeName(p, service)
              : `T.nilable(${this.buildTypeName(p, service)})`
          }`,
      )
      .join(', ');

    yield `    abstract.params(${params}).`;
    yield `      void`;
  }

  private *buildParamsWithReturnSignature(
    parameters: Parameter[],
    returnType: ReturnType,
    service: Service,
  ): Iterable<string> {
    const sortedParams = [
      ...parameters.filter((p) => p.isRequired),
      ...parameters.filter((p) => !p.isRequired),
    ];

    const params = sortedParams
      .map(
        (p) =>
          `${snake(p.name)}: ${
            p.isRequired
              ? this.buildTypeName(p, service)
              : `T.nilable(${this.buildTypeName(p, service)})`
          }`,
      )
      .join(', ');

    yield `    abstract.params(${params}).`;
    yield `      returns(${this.buildTypeName(returnType, service)})`;
  }

  private buildMethodParams(method: Method): string {
    if (!method.parameters.length) return '';

    const sortedParams = [
      ...method.parameters.filter((p) => p.isRequired),
      ...method.parameters.filter((p) => !p.isRequired),
    ];

    const paramString = sortedParams
      .map((p) =>
        p.isRequired ? `${snake(p.name)}:` : `${snake(p.name)}: nil`,
      )
      .join(', ');

    return `(${paramString})`;
  }

  private buildTypeName(
    type: {
      typeName: string;
      isArray: boolean;
      isLocal: boolean;
    },
    service: Service,
  ): string {
    const arrayify = (n: string) => (type.isArray ? `T::Array[${n}]` : n);

    if (type.isLocal) {
      return arrayify(
        `${pascal(service.title)}::V${service.majorVersion}::${pascal(
          type.typeName,
        )}`,
      );
    }

    switch (type.typeName) {
      case 'string':
        return arrayify('String');
      case 'number':
        return arrayify('Numeric');
      case 'integer':
        return arrayify('Integer');
      case 'boolean':
        return arrayify('T::Boolean');
      default:
        return arrayify('>>>>>> UNKNOWN <<<<<<<');
    }
  }
}
