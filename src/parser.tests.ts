import { readFileSync } from 'fs';
import { join } from 'path';

import { Parser, ReturnType } from './parser';

describe('parser', () => {
  it('recreates a valid snapshot', () => {
    // ARRANGE
    const snapshot = JSON.parse(
      readFileSync(join('src', 'snapshot', 'snapshot.json')).toString(),
    );
    const schema = JSON.parse(
      readFileSync(join('src', 'snapshot', 'example.oas2.json')).toString(),
    );

    // ACT
    const result = JSON.parse(JSON.stringify(new Parser(schema).parse()));

    // ASSERT
    expect(result).toStrictEqual(snapshot);
  });

  it('creates a type for every local typeName', () => {
    // ARRANGE
    const schema = JSON.parse(
      readFileSync(join('src', 'snapshot', 'example.oas2.json')).toString(),
    );

    // ACT
    const result = new Parser(schema).parse();

    // ASSERT
    const fromMethodParameters = new Set(
      result.interfaces
        .map((i) => i.methods)
        .reduce((a, b) => a.concat(b), [])
        .map((i) => i.parameters)
        .reduce((a, b) => a.concat(b), [])
        .filter((p) => p.isLocal)
        .map((p) => p.typeName),
    );

    const fromMethodReturnTypes = new Set(
      result.interfaces
        .map((i) => i.methods)
        .reduce((a, b) => a.concat(b), [])
        .map((i) => i.returnType)
        .filter((t): t is ReturnType => !!t)
        .filter((p) => p.isLocal)
        .map((p) => p.typeName),
    );

    const fromTypes = new Set(
      result.types
        .map((t) => t.properties)
        .reduce((a, b) => a.concat(b), [])
        .filter((p) => p.isLocal)
        .map((p) => p.typeName),
    );

    const typeNames = new Set(result.types.map((t) => t.name));

    for (const localTypeName of [
      ...fromMethodParameters,
      ...fromMethodReturnTypes,
      ...fromTypes,
    ]) {
      expect(typeNames.has(localTypeName)).toEqual(true);
    }
  });

  it('creates types with unique names', () => {
    // ARRANGE
    const schema = JSON.parse(
      readFileSync(join('src', 'snapshot', 'example.oas2.json')).toString(),
    );

    // ACT
    const result = new Parser(schema).parse();

    // ASSERT
    const typeNames = result.types.map((t) => t.name);

    expect(typeNames.length).toEqual(new Set(typeNames).size);
  });
});
