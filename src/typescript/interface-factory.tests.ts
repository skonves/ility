import { readFileSync } from 'fs';
import { join } from 'path';
import { InterfaceFactory } from './interface-factory';
import { defaultFactories, ValidatorFactory } from './validator-factory';

describe('parser', () => {
  it('recreates a valid snapshot', () => {
    // ARRANGE
    const service = JSON.parse(
      readFileSync(join('src', 'oas2', 'snapshot', 'snapshot.json')).toString(),
    );

    // ACT
    const int = new InterfaceFactory().build(service);
    const validator = new ValidatorFactory(defaultFactories).build(service);

    // ASSERT
    for (const file of [...int, ...validator]) {
      const path = join('src', 'typescript', 'snapshot', ...file.path);
      const snapshot = readFileSync(path).toString();
      expect(file.contents).toStrictEqual(snapshot);
    }
  });
});
