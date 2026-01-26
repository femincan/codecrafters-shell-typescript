import { commandsMap, loadCommands } from './lib/command';
import { runExe } from './lib/exe';

export default async function main() {
  await loadCommands();
  printPrompt();

  for await (const input of console) {
    const spaceIndex = input.indexOf(' ');
    let command = '';
    let rest = '';
    if (spaceIndex === -1) {
      command = input;
    } else {
      command = input.slice(0, spaceIndex);
      rest = input.slice(spaceIndex + 1);
    }

    const commandFunction = commandsMap.get(command);

    if (commandFunction) {
      commandFunction(rest);
    } else {
      await runExe(command, rest);
    }

    printPrompt();
  }
}

function printPrompt() {
  Bun.stdout.write('$ ');
}
