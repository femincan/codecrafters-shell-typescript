import {
  accessSync,
  existsSync,
  constants as fsConstants,
  readdirSync,
} from 'node:fs';
import { delimiter, resolve } from 'node:path';

export async function runExe(command: string, args: string[]) {
  const exePath = getExePath(command);

  if (!exePath) {
    console.log(`${command}: command not found`);
    return;
  }

  const subprocess = Bun.spawn([command, ...args], {});

  if (subprocess.stdout) {
    for await (const chunk of subprocess.stdout) {
      Bun.stdout.write(chunk);
    }
  }
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
