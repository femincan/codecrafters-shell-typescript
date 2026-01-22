import { exec } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { delimiter, resolve } from 'node:path';
import { isExecutable } from './utils';

export async function runExe(
  command: string,
  rest: string,
): Promise<{ success: true } | { success: false; message: string }> {
  const exePath = findExe(command);

  if (!exePath) {
    return { success: false, message: `${command}: command not found` };
  }

  const subprocess = exec(`${command} ${rest}`);

  if (subprocess.stdout) {
    for await (const chunk of subprocess.stdout) {
      Bun.stdout.write(chunk);
    }
  }

  return { success: true };
}

export function findExe(exeName: string) {
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
