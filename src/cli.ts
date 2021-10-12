#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, sep } from 'path';

import yargs = require('yargs/yargs');
import { hideBin } from 'yargs/helpers';
import { allowedTargets, generate } from '.';

const { argv } = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    string: true,
    description:
      'Path to a file that contains a GraphQL schema. Reads from stdin if omitted',
    requiresArg: true,
  })
  .option('output', {
    alias: 'o',
    string: true,
    description: 'Path of the output file. Writes to stdout if omitted.',
    requiresArg: true,
  })
  .option('language', {
    alias: 'l',
    string: true,
    description: `Target output language (${allowedTargets.join(', ')})`,
    requiresArg: true,
  });
// .option('watch', {
//   alias: 'w',
//   boolean: true,
//   description: 'Recreates the output file each time the input file changes.',
//   nargs: 0,
//   implies: ['input', 'output'],
// });

(async () => {
  try {
    const { input, output, title, language } = await argv;

    // if (watch && !input && !output) {
    //   throw new Error(
    //     'Must specify input and output files to run in watch mode.',
    //   );
    // }

    if (!language) {
      throw new Error('Must specify language.');
    }

    let schema: string | undefined;

    if (input) {
      schema = (await readFile(input)).toString('utf8');
    } else if (!process.stdin.isTTY) {
      schema = await readStreamToString(process.stdin);
    } else {
      throw new Error('No input file provided and nothing to read from stdin');
    }

    if (schema) {
      for (const file of generate(schema, language)) {
        const path = file.path.slice(0, file.path.length - 1);
        const filename = file.path[file.path.length - 1];

        const fullpath = [...(output || '').split(sep), ...path];

        await mkdir(join(...fullpath), { recursive: true });
        await writeFile(join(...fullpath, filename), file.contents);
      }
    }
  } catch (ex) {
    console.error('Did not generate server types', ex.message);
    process.exit(1);
  }
})();

async function readStreamToString(stream: NodeJS.ReadStream) {
  const chunks: any[] = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}
