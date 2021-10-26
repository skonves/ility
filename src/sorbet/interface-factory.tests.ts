import { readFileSync } from 'fs';
import { join } from 'path';
import { InterfaceFactory } from './interface-factory';

const pkg = require('../../package.json');
const withVersion = `${pkg.name}@${pkg.version}`;
const withoutVersion = `${pkg.name}@{{version}}`;

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
      const snapshot = readFileSync(path)
        .toString()
        .replace(withoutVersion, withVersion);
      expect(file.contents).toStrictEqual(snapshot);
    }
  });
});
