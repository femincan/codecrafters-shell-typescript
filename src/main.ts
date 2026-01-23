import { commandsMap } from './lib/command';
import { runExe } from './lib/exe';
import { printPrompt } from './lib/utils';

export default async function main() {
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
