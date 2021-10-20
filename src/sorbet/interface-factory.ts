import {
  Enum,
  File,
  FileFactory,
  Interface,
  isRequired,
  Method,
  Parameter,
  ReturnType,
  Service,
  Type,
} from '../types';

import { snake, pascal, constant } from 'case';
import {
  buildMethodParams,
  buildModuleNamespace,
  buildNamespacedPath,
  buildSignature,
  buildTypeName,
  preamble,
  prefix,
} from './utils';

export class InterfaceFactory implements FileFactory {
  public readonly target = 'ruby-sorbet';

  build(service: Service): File[] {
    const interfaceFiles: File[] = service.interfaces.map((i) => ({
      path: [...buildNamespacedPath(service), `${snake(i.name)}_service.rb`],
      contents: `${Array.from(this.buildInterface(i, service)).join('\n')}\n`,
    }));

    const typeFiles: File[] = service.types.map((t) => ({
      path: [...buildNamespacedPath(service), `${snake(`${t.name}`)}.rb`],
      contents: `${Array.from(this.buildStruct(t, service)).join('\n')}\n`,
    }));

    const enumFiles: File[] = service.enums.map((e) => ({
      path: [...buildNamespacedPath(service), `${snake(`${e.name}`)}.rb`],
      contents: `${Array.from(this.buildEnum(e, service)).join('\n')}\n`,
    }));

    return [...interfaceFiles, ...typeFiles, ...enumFiles];
  }

  private *buildEnum(e: Enum, service: Service): Iterable<string> {
    yield* preamble();
    yield `module ${buildModuleNamespace(service)}`;
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
    yield* preamble();
    yield `module ${buildModuleNamespace(service)}`;
    yield `  class ${pascal(type.name)} < T::Struct`;
    yield '    extend T::Sig';
    yield '    include TypedStructHelper';
    yield '';
    for (const property of type.properties) {
      const typeName = buildTypeName(property, buildModuleNamespace(service));
      yield `    const ${snake(property.name)}, ${
        isRequired(property) ? typeName : `T.nilable(${typeName})`
      }`;
    }
    yield '  end';
    yield 'end';
  }

  private *buildInterface(int: Interface, service: Service): Iterable<string> {
    yield* preamble();
    yield `module ${buildModuleNamespace(service)}::${pascal(int.name)}Service`;
    yield `  extend T::Sig`;
    yield `  extend T::Helpers`;
    yield '';
    yield '  interface!';
    for (const method of int.methods) {
      yield* this.buildMethod(method, service, 1);
    }
    yield `end`;
  }

  private *buildMethod(
    method: Method,
    service: Service,
    indent: number,
  ): Iterable<string> {
    yield '';
    yield* buildSignature(method, service, 'abstract', indent);
    yield `${prefix(indent)}def ${snake(method.name)}${buildMethodParams(
      method,
    )}`;
    yield `${prefix(indent)}end`;
  }
}
