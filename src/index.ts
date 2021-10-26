import { ComposedFileFactory } from './composed-factory';
import { File } from './types';
import { OAS2Parser } from './oas2/parser';
import { InterfaceFactory as SorbetInterfaceFactory } from './sorbet/interface-factory';
import { InterfaceFactory as TypescriptInterfaceFactory } from './typescript/interface-factory';
import {
  defaultFactories,
  ValidatorFactory as TypescriptValidatorFactory,
} from './typescript/validator-factory';
import { ValidatorFactory as SorbetValidatorFactory } from './sorbet/validator-factory';
import { ExpressRouterFactory as TypescriptExpressRouterFactory } from './typescript/express-router-factory';

const factories = [
  new ComposedFileFactory(
    'typescript',
    new TypescriptInterfaceFactory(),
    new TypescriptValidatorFactory(defaultFactories),
    new TypescriptExpressRouterFactory(),
  ),
  new ComposedFileFactory(
    'ruby-sorbet',
    new SorbetInterfaceFactory(),
    new SorbetValidatorFactory(),
  ),
];

export const allowedTargets = factories.map((f) => f.target);

export function generate(schema: string, target: string): File[] {
  const factory = factories.find((f) => f.target === target);
  if (!factory) return [];

  const obj = JSON.parse(schema);

  const service = new OAS2Parser(obj).parse();

  return factory.build(service);
}
