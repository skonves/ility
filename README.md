[![master](https://github.com/skonves/ility/workflows/build/badge.svg?branch=main&event=push)](https://github.com/skonves/ility/actions?query=workflow%3Abuild+branch%3Amain+event%3Apush)
[![master](https://img.shields.io/npm/v/ility)](https://www.npmjs.com/package/ility)

# ility

Multilingual code generation from OpenAPI

## CLI Usage

The generator is available using the `ility` command:

```
ility -i path/to/your/schema.json -l typescript
```

### Input file

Use `-i`, `--input` to supply the input file path:

```
ility --input path/to/your/schema.json
```

Or pipe contents in via stdio:

```
cat path/to/your/schema.json | ility
```

### Output file

Use `-o`, `--output` to supply the output folder:

```
ility --output path/to/your/output/folder
```

### Title

Use `-t`, `--title` to supply the service title:

```
ility --title "widget service"
```

If the title is not supplied, then the file name of the input is used instead. (Piping from stdio requires a title to be supplied.)

### Language

Use `-t`, `--title` to supply the target language:

```
ility --lauguage typescript
```

Available laguages are currently `typescript` and `ruby-sorbet`

## Programatic Usage

The generator is available by importing the `generate` function.

```js
import { readFileSync } from 'fs';
import { generate } from 'ility';

const schema = readFileSync('path/to/your/schema.json').toString('utf8');
const title = 'widget service';
const language = 'ruby-sorbet';

const files = generate(schema, title, language);
```

## How to:

### Run this project

1.  Build the code: `npm run build`
1.  Run it! `npm start`

Note that the `lint` script is run prior to `build`. Auto-fixable linting or formatting errors may be fixed by running `lint:fix`.

### Create and run tests

1.  Add tests by creating files with the `.tests.ts` suffix
1.  Run the tests: `npm t`
1.  Test coverage can be viewed at `/coverage/lcov-report/index.html`

### Publish a new version to NPM

Publishing is automated via a [workflow](https://github.com/skonves/ility/actions?query=workflow%3Apublish). To run this workflow:

1. Checkout `main` and pull latest changes.
1. Run `npm version [major|minor|patch]` to create a new version commit and tag
1. Run `git push origin main --follow-tags` to push the tag (and version commit) and start the workflow
1. Wait for [the workflow](https://github.com/skonves/ility/actions?query=workflow%3Apublish) to detect the tag and publish the package.

---

Generated with [generator-ts-console](https://www.npmjs.com/package/generator-ts-console)
