import { File, FileFactory, Service } from './types';

export class ComposedFileFactory implements FileFactory {
  constructor(readonly target: string, ...factories: FileFactory[]) {
    this.factories = factories;
  }

  private readonly factories: FileFactory[];

  build(service: Service): File[] {
    return this.factories
      .filter((f) => f.target === this.target)
      .map((f) => f.build(service))
      .reduce((a, b) => a.concat(b), []);
  }
}
