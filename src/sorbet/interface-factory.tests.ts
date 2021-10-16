import { readFileSync } from 'fs';
import { join } from 'path';
import { InterfaceFactory } from './interface-factory';

describe('parser', () => {
  it('recreates a valid snapshot', () => {
    // ARRANGE
    const service = JSON.parse(
      readFileSync(join('src', 'oas2', 'snapshot', 'snapshot.json')).toString(),
    );

    // ACT
    const files = new InterfaceFactory().build(service);

    // ASSERT
    for (const file of files) {
      const path = join('src', 'sorbet', 'snapshot', ...file.path);
      const snapshot = readFileSync(path).toString();
      expect(file.contents).toStrictEqual(snapshot);
    }
  });
});
