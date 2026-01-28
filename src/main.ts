import { commandsMap, loadCommands } from './lib/command';
import { runExe } from './lib/exe';
import { parseInput } from './lib/input';

export default async function main() {
  await loadCommands();
  printPrompt();

  for await (const input of console) {
    const { command, args } = parseInput(input);

    const commandFunction = commandsMap.get(command);

    if (commandFunction) {
      commandFunction(args.join(' '));
    } else {
      await runExe(command, args);
    }

    printPrompt();
  }
}

function printPrompt() {
  Bun.stdout.write('$ ');
}
