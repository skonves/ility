import { Parser, Service } from './parser';
import { OpenAPI } from './types';

describe('parser', () => {
  it('creates a null service', () => {
    // ARRANGE
    const schema = build();
    const title = 'test';
    const parser = new Parser(schema, title);

    // ACT
    const result = parser.parse();

    // ASSERT
    expect(result).toEqual({
      title,
      majorVersion: 1,
      interfaces: [],
      types: [],
      enums: [],
    });
  });

  it('handles a method without parameters or a return type', () => {
    // ARRANGE
    const schema = build({
      paths: {
        '/things': {
          get: {
            summary: 'Method without params or return type',
            operationId: 'getThings',
            responses: {
              default: {
                description: 'success',
              },
            },
          },
        },
      },
    });
    const title = 'test';
    const parser = new Parser(schema, title);

    // ACT
    const result = parser.parse();

    // ASSERT
    expect(result).toEqual<Service>({
      title,
      majorVersion: 1,
      interfaces: [
        {
          name: 'thing',
          methods: [
            {
              description: 'Method without params or return type',
              name: 'getThings',
              parameters: [],
              returnType: undefined,
            },
          ],
        },
      ],
      types: [],
      enums: [],
    });
  });

  it('handles a method with anonymously typed body param', () => {
    // ARRANGE
    const schema = build({
      paths: {
        '/things': {
          post: {
            summary: 'Method with anonymously typed body param',
            operationId: 'postThing',
            parameters: [
              {
                in: 'body',
                name: 'body',
                schema: {
                  type: 'object',
                  description: 'Description of anonymous type',
                  required: ['id'],
                  properties: {
                    id: {
                      type: 'string',
                    },
                  },
                },
              },
            ],
            responses: {
              default: {
                description: 'success',
              },
            },
          },
        },
      },
    });
    const title = 'test';
    const parser = new Parser(schema, title);

    // ACT
    const result = parser.parse();

    // ASSERT
    expect(result).toEqual<Service>({
      title,
      majorVersion: 1,
      interfaces: [
        {
          name: 'thing',
          methods: [
            {
              description: 'Method with anonymously typed body param',
              name: 'postThing',
              parameters: [
                {
                  description: undefined,
                  isArray: false,
                  isLocal: true,
                  isRequired: false,
                  name: 'body',
                  typeName: 'postThingBody',
                },
              ],
              returnType: undefined,
            },
          ],
        },
      ],
      types: [
        {
          name: 'postThingBody',
          description: 'Description of anonymous type',
          properties: [
            {
              name: 'id',
              description: undefined,
              typeName: 'string',
              isArray: false,
              isRequired: true,
              isLocal: false,
            },
          ],
        },
      ],
      enums: [],
    });
  });

  it('handles a method with defined body object param', () => {
    // ARRANGE
    const schema = build({
      paths: {
        '/things': {
          post: {
            summary: 'Method with defined body object param',
            operationId: 'postThing',
            parameters: [
              {
                in: 'body',
                name: 'body',
                schema: { $ref: '#/definitions/thing' },
              },
            ],
            responses: {
              default: {
                description: 'success',
              },
            },
          },
        },
      },
      definitions: {
        thing: {
          type: 'object',
          description: 'Description of defined type',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
          },
        },
      },
    });
    const title = 'test';
    const parser = new Parser(schema, title);

    // ACT
    const result = parser.parse();

    // ASSERT
    expect(result).toEqual<Service>({
      title,
      majorVersion: 1,
      interfaces: [
        {
          name: 'thing',
          methods: [
            {
              description: 'Method with defined body object param',
              name: 'postThing',
              parameters: [
                {
                  isArray: false,
                  description: undefined,
                  isLocal: true,
                  isRequired: false,
                  name: 'body',
                  typeName: 'thing',
                },
              ],
              returnType: undefined,
            },
          ],
        },
      ],
      types: [
        {
          name: 'thing',
          description: 'Description of defined type',
          properties: [
            {
              name: 'id',
              description: undefined,
              typeName: 'string',
              isArray: false,
              isRequired: true,
              isLocal: false,
            },
          ],
        },
      ],
      enums: [],
    });
  });

  it('handles a method with a pre-defined scalar parameter', () => {
    // ARRANGE
    const schema = build({
      parameters: {
        id: {
          in: 'path',
          name: 'id',
          type: 'string',
          required: true,
        },
      },
      paths: {
        '/things/{:id}': {
          post: {
            summary: 'Method with a pre-defined scalar parameter',
            operationId: 'getThingById',
            parameters: [{ $ref: '#/parameters/id' }],
            responses: {
              default: {
                description: 'success',
              },
            },
          },
        },
      },
    });
    const title = 'test';
    const parser = new Parser(schema, title);

    // ACT
    const result = parser.parse();

    // ASSERT
    expect(result).toEqual<Service>({
      title,
      majorVersion: 1,
      interfaces: [
        {
          name: 'thing',
          methods: [
            {
              description: 'Method with a pre-defined scalar parameter',
              name: 'getThingById',
              parameters: [
                {
                  isArray: false,
                  description: undefined,
                  isLocal: false,
                  isRequired: true,
                  name: 'id',
                  typeName: 'string',
                },
              ],
              returnType: undefined,
            },
          ],
        },
      ],
      types: [],
      enums: [],
    });
  });

  it('handles a method with a anonymous scalar parameters', () => {
    // ARRANGE
    const schema = build({
      parameters: {
        id: {
          in: 'path',
          name: 'id',
          type: 'string',
          required: true,
        },
      },
      paths: {
        '/things/{:id}': {
          post: {
            summary: 'Method with a anonymous scalar parameters',
            operationId: 'getThingById',
            parameters: [
              {
                in: 'path',
                name: 'id',
                type: 'string',
                required: true,
              },
              {
                in: 'query',
                name: 'num',
                type: 'number',
                required: true,
              },
              {
                in: 'query',
                name: 'int',
                type: 'integer',
                required: true,
              },
              {
                in: 'query',
                name: 'strs',
                type: 'array',
                items: { type: 'string' },
                required: true,
              },
            ],
            responses: {
              default: {
                description: 'success',
              },
            },
          },
        },
      },
    });
    const title = 'test';
    const parser = new Parser(schema, title);

    // ACT
    const result = parser.parse();

    // ASSERT
    expect(result).toEqual<Service>({
      title,
      majorVersion: 1,
      interfaces: [
        {
          name: 'thing',
          methods: [
            {
              description: 'Method with a anonymous scalar parameters',
              name: 'getThingById',
              parameters: [
                {
                  isArray: false,
                  description: undefined,
                  isLocal: false,
                  isRequired: true,
                  name: 'id',
                  typeName: 'string',
                },
                {
                  isArray: false,
                  description: undefined,
                  isLocal: false,
                  isRequired: true,
                  name: 'num',
                  typeName: 'number',
                },
                {
                  isArray: false,
                  description: undefined,
                  isLocal: false,
                  isRequired: true,
                  name: 'int',
                  typeName: 'integer',
                },
                {
                  isArray: true,
                  description: undefined,
                  isLocal: false,
                  isRequired: true,
                  name: 'strs',
                  typeName: 'string',
                },
              ],
              returnType: undefined,
            },
          ],
        },
      ],
      types: [],
      enums: [],
    });
  });

  it('handles a method with defined object param that contains an anonymous child object', () => {
    // ARRANGE
    const schema = build({
      paths: {
        '/things': {
          post: {
            summary:
              'method with defined object param that contains an anonymous child object',
            operationId: 'postThing',
            parameters: [
              {
                in: 'body',
                name: 'body',
                schema: { $ref: '#/definitions/thing' },
              },
            ],
            responses: {
              default: {
                description: 'success',
              },
            },
          },
        },
      },
      definitions: {
        thing: {
          type: 'object',
          description: 'Description of defined type',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
            },
            child: {
              type: 'object',
              properties: {
                foo: { type: 'string' },
                bar: { type: 'string' },
              },
            },
          },
        },
      },
    });
    const title = 'test';
    const parser = new Parser(schema, title);

    // ACT
    const result = parser.parse();

    // ASSERT
    expect(result).toEqual<Service>({
      title,
      majorVersion: 1,
      interfaces: [
        {
          name: 'thing',
          methods: [
            {
              description:
                'method with defined object param that contains an anonymous child object',
              name: 'postThing',
              parameters: [
                {
                  isArray: false,
                  description: undefined,
                  isLocal: true,
                  isRequired: false,
                  name: 'body',
                  typeName: 'thing',
                },
              ],
              returnType: undefined,
            },
          ],
        },
      ],
      types: [
        {
          name: 'thing',
          description: 'Description of defined type',
          properties: [
            {
              name: 'id',
              description: undefined,
              typeName: 'string',
              isArray: false,
              isRequired: true,
              isLocal: false,
            },
            {
              name: 'child',
              description: undefined,
              typeName: 'thingChild',
              isArray: false,
              isRequired: false,
              isLocal: true,
            },
          ],
        },
        {
          name: 'thingChild',
          description: undefined,
          properties: [
            {
              name: 'foo',
              description: undefined,
              typeName: 'string',
              isArray: false,
              isRequired: false,
              isLocal: false,
            },
            {
              name: 'bar',
              description: undefined,
              typeName: 'string',
              isArray: false,
              isRequired: false,
              isLocal: false,
            },
          ],
        },
      ],
      enums: [],
    });
  });
});

function build(test?: Partial<OpenAPI.Schema>): OpenAPI.Schema {
  return {
    swagger: '2.0',
    info: {
      title: 'Test schema',
      version: '1.2.3',
    },
    paths: {},
    ...test,
  };
}
