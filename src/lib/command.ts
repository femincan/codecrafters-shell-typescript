import { readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

type CommandName = string;
type CommandFunction = (args: string[]) => void;

export const commandsMap = new Map<CommandName, CommandFunction>();

export function createCommand(name: CommandName, func: CommandFunction) {
  commandsMap.set(name, func);
}

export async function loadCommands() {
  const commandsDirPath = resolve(import.meta.dir, '..', 'commands');

  if (!statSync(commandsDirPath).isDirectory()) {
    return;
  }

  const commandFiles = readdirSync(commandsDirPath);

  for (const file of commandFiles) {
    await import(resolve(commandsDirPath, file));
  }
}
