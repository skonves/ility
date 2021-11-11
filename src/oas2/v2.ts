import { Parser as ParserV2 } from '../types-v2';
import { OpenAPI } from './types';

const cache = new Map<BufferEncoding, WeakMap<Buffer, OpenAPI.Schema>>();

function set(
  input: Buffer,
  encoding: BufferEncoding = 'utf8',
  schema: OpenAPI.Schema,
): OpenAPI.Schema {
  if (cache.has(encoding)) {
    cache.set(encoding, new WeakMap());
  }

  cache.get(encoding)!.set(input, schema);

  return schema;
}

function get(input: Buffer, encoding: BufferEncoding = 'utf8'): OpenAPI.Schema {
  const hit = cache.get(encoding)?.get(input);
  if (hit) return hit;

  const schema = JSON.parse(input.toString(encoding));
  set(input, encoding, schema);
  return schema;
}

export const parser: ParserV2 = (input, parse, options) => {
  const errors = (options?.validators || []).reduce(
    (acc, validator) => [...acc, ...validator(input, options?.encoding)],
    [],
  );

  if (errors.length) return errors;

  const service = parse(input, options?.encoding);

  for (const servicePlugin of options?.servicePlugins || []) {
    const { id, payload } = servicePlugin(input, service, {
      encoding: options?.encoding,
    });
    service.plugins ||= {};
    service.plugins[id] = payload;
  }

  for (const int of service.interfaces) {
    for (const interfacePlugin of options?.interfacePlugins || []) {
      const { id, payload } = interfacePlugin(input, int, {
        encoding: options?.encoding,
        service,
      });
      int.plugins ||= {};
      int.plugins[id] = payload;
    }

    for (const method of int.methods) {
      for (const methodPlugin of options?.methodPlugins || []) {
        const { id, payload } = methodPlugin(input, method, {
          encoding: options?.encoding,
          service,
          int,
        });
        method.plugins ||= {};
        method.plugins[id] = payload;
      }

      if (method.returnType) {
        for (const returnType of options?.returnTypePlugins || []) {
          const { id, payload } = returnType(input, method.returnType, {
            encoding: options?.encoding,
            service,
            int,
            method,
          });
          method.returnType.plugins ||= {};
          method.returnType.plugins[id] = payload;
        }
      }

      for (const parameter of method.parameters) {
        for (const parameterPlugin of options?.parameterPlugins || []) {
          const { id, payload } = parameterPlugin(input, parameter, {
            encoding: options?.encoding,
            service,
            int,
            method,
          });
          parameter.plugins ||= {};
          parameter.plugins[id] = payload;
        }
      }
    }
  }

  for (const type of service.types) {
    for (const typePlugin of options?.typePlugins || []) {
      const { id, payload } = typePlugin(input, type, {
        encoding: options?.encoding,
        service,
      });
      type.plugins ||= {};
      type.plugins[id] = payload;
    }

    for (const property of type.properties) {
      for (const propertyPlugin of options?.propertyPlugins || []) {
        const { id, payload } = propertyPlugin(input, property, {
          encoding: options?.encoding,
          service,
          type,
        });
        property.plugins ||= {};
        property.plugins[id] = payload;
      }
    }
  }

  for (const e of service.enums) {
    for (const enumPlugin of options?.enumPlugins || []) {
      const { id, payload } = enumPlugin(input, e, {
        encoding: options?.encoding,
      });
      e.plugins ||= {};
      e.plugins[id] = payload;
    }
  }

  return service;
};
