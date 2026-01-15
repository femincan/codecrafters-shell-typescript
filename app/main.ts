import { createInterface } from 'node:readline/promises';

// ==================
// Types
// ==================
type CommandName = string;
type CommandFunction = (rest: string) => void;

// ==================
// Globals
// ==================

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const state = {
  rlOpen: true,
  commandsMap: new Map<CommandName, CommandFunction>(),
};

// ==================
// Main Function
// ==================

async function main() {
  while (state.rlOpen) {
    const input = await rl.question('$ ');

    const spaceIndex = input.indexOf(' ');
    let command = '';
    let rest = '';
    if (spaceIndex === -1) {
      command = input;
    } else {
      command = input.slice(0, spaceIndex);
      rest = input.slice(spaceIndex + 1);
    }

    const commandFunction = state.commandsMap.get(command);

    if (!commandFunction) {
      console.log(`${command}: command not found`);
      continue;
    }

    commandFunction(rest);
  }
}

main();

// ==================
// Command Functions
// ==================

// exit
createCommand('exit', () => {
  rl.close();
  state.rlOpen = false;
});

// echo
createCommand('echo', (rest) => console.log(rest));

// type
createCommand('type', (rest) =>
  console.log(
    `${rest}${
      state.commandsMap.has(rest) ? ' is a shell builtin' : ': not found'
    }`
  )
);

// ==================
// Utility Functions
// ==================

function createCommand(name: CommandName, func: CommandFunction) {
  state.commandsMap.set(name, func);
}
