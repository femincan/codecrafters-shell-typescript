import { exec } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { delimiter, resolve } from 'node:path';
import { isExecutable } from './utils';

export async function runExe(command: string, rest: string) {
  const exePath = getExePath(command);

  if (!exePath) {
    console.log(`${command}: command not found`);
    return;
  }

  const subprocess = exec(`${command} ${rest}`);

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
