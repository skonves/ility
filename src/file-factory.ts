import { Service } from './parser';

export interface FileFactory {
  get target(): string;
  build(service: Service): File[];
}

export type File = {
  path: string[];
  contents: string;
};
