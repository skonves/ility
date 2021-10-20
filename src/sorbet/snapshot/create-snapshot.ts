import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ValidatorFactory } from '../validator-factory';
import { InterfaceFactory } from '../interface-factory';

const service = JSON.parse(
  readFileSync(
    join(process.cwd(), 'src', 'oas2', 'snapshot', 'snapshot.json'),
  ).toString('utf8'),
);

const snapshotFiles = [
  ...new InterfaceFactory().build(service),
  ...new ValidatorFactory().build(service),
];

for (const file of snapshotFiles) {
  const path = file.path.slice(0, file.path.length - 1);
  const filename = file.path[file.path.length - 1];

  const fullpath = [process.cwd(), 'src', 'sorbet', 'snapshot', ...path];

  mkdirSync(join(...fullpath), { recursive: true });
  writeFileSync(join(...fullpath, filename), file.contents);
}
