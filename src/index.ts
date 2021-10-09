import * as fs from 'fs/promises';
import { Parser } from './parser';
import { SorbetFactory } from './sorbet-factory';
import { OpenAPI } from './types';
import { TypescriptFactory } from './typescript-factory';

async function readSchema(filepath: string): Promise<OpenAPI.Schema> {
  const buffer = await fs.readFile(filepath);
  return JSON.parse(buffer.toString());
}

readSchema('./specs/example.json').then((schema) => {
  const parser = new Parser(schema, 'pet store');
  const service = parser.parse();

  const files = new TypescriptFactory().build(service);

  for (const file of files) {
    console.log('====================');
    console.log(file.path);
    console.log(file.contents);
  }
});
