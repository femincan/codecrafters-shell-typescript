import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { StdStream } from './output';
import type { ShellState } from './shell';

type CommandName = string;
export type CommandOutput = {
  stdout: StdStream;
  stderr: StdStream;
};
type CommandFunction = (args: string[], state: ShellState) => CommandOutput;
export type CommandsMap = Map<CommandName, CommandFunction>;

export function registerCommand(name: CommandName, func: CommandFunction) {
  return (commandsMap: CommandsMap) => commandsMap.set(name, func);
}

export async function registerCommands(commandsMap: CommandsMap) {
  const commandsDirPath = resolve(import.meta.dir, '..', 'commands');

  if (!existsSync(commandsDirPath)) {
    throw new Error('The "commands" directory does not exist.');
  }

  if (!statSync(commandsDirPath).isDirectory()) {
    throw new Error('"commands" exists but is not a directory.');
  }

  const commandFiles = readdirSync(commandsDirPath).filter((file) =>
    file.endsWith('.ts'),
  );

  for (const file of commandFiles) {
    const mod = await import(resolve(commandsDirPath, file));

    if (typeof mod.default !== 'function') {
      throw new Error(
        `Invalid command file "${file}": expected a default-exported registerCommand function.`,
      );
    }

    mod.default(commandsMap);
  }
}
