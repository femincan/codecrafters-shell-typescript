import {
  accessSync,
  existsSync,
  constants as fsConstants,
  readdirSync,
} from 'node:fs';
import { delimiter, resolve } from 'node:path';
import type { CommandOutput } from './command';
import { stringToStdStream } from './output';
import type { ShellState } from './shell';

export type ExeMap = Map<string, string>;

export async function runExe(
  command: string,
  args: string[],
  state: ShellState,
): Promise<CommandOutput> {
  const exePath = state.exeMap.get(command);
  if (!exePath) {
    return {
      stdout: stringToStdStream(''),
      stderr: stringToStdStream(`${command}: command not found`),
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

export function createExeMap(exeMap: ExeMap) {
  const pathDirs = getPathDirs();
  for (const dir of pathDirs) {
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir);
    for (const fileName of files) {
      const filePath = resolve(dir, fileName);
      if (!isExecutable(filePath)) continue;

      exeMap.set(fileName, filePath);
    }
  }
}

function getPathDirs() {
  return (Bun.env.PATH || Bun.env.Path || '').split(delimiter);
}

function isExecutable(filePath: string) {
  try {
    accessSync(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}
