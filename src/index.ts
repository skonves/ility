import { File } from './file-factory';
import { Parser } from './parser';
import { SorbetFactory } from './sorbet-factory';
import { TypescriptFactory } from './typescript-factory';

const factories = [new TypescriptFactory(), new SorbetFactory()];

export const allowedTargets = factories.map((f) => f.target);

export function generate(schema: string, target: string): File[] {
  const factory = factories.find((f) => f.target === target);
  if (!factory) return [];

  const obj = JSON.parse(schema);

  const service = new Parser(obj).parse();

  return factory.build(service);
}
