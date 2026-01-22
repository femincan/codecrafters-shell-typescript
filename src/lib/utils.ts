import { accessSync, constants as fsConstants } from 'node:fs';

export function isExecutable(filePath: string) {
  try {
    accessSync(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

const defaultPrompt = '$ ';
export function printPrompt(prompt = defaultPrompt) {
  Bun.stdout.write(prompt);
}
