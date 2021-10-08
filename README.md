[![master](https://github.com/{ORG_NAME}/{REPO_NAME}/workflows/build/badge.svg?branch=master&event=push)](https://github.com/{ORG_NAME}/{REPO_NAME}/actions?query=workflow%3Abuild+branch%3Amaster+event%3Apush)

# ility

Base project for creating a console application in Typescript

## How to:

### Run this project

1.  Build the code: `npm run build`
1.  Run it! `npm start`

Note that the `lint` script is run prior to `build`. Auto-fixable linting or formatting errors may be fixed by running `lint:fix`.

### Create and run tests

1.  Add tests by creating files with the `.tests.ts` suffix
1.  Run the tests: `npm t`
1.  Test coverage can be viewed at `/coverage/lcov-report/index.html`

---

Generated with [generator-ts-console](https://www.npmjs.com/package/generator-ts-console)
