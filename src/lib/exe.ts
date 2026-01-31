import {
  accessSync,
  existsSync,
  constants as fsConstants,
  readdirSync,
} from 'node:fs';
import { delimiter, resolve } from 'node:path';
import type { CommandOutput } from './types';
import { stringToStream } from './utils';

export async function runExe(
  command: string,
  args: string[],
): Promise<CommandOutput> {
  const exePath = getExePath(command);

  if (!exePath) {
    return {
      stdout: stringToStream(''),
      stderr: stringToStream(`${command}: command not found`),
    };
  }

  const subprocess = Bun.spawn([command, ...args], {
    stderr: 'pipe',
  });

  return {
    stdout: subprocess.stdout,
    stderr: subprocess.stderr,
  };
}

export function getExePath(exeName: string) {
  const pathDirs = (Bun.env.PATH || Bun.env.Path || '').split(delimiter);

  for (const dir of pathDirs) {
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir);
    if (files.includes(exeName)) {
      const filePath = resolve(dir, exeName);
      if (isExecutable(filePath)) {
        return filePath;
      }
    }
  }

  return null;
}

function isExecutable(filePath: string) {
  try {
    accessSync(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}
