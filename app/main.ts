import { createInterface } from 'node:readline/promises';

// ==================
// Globals
// ==================

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const state = {
  rlOpen: true,
};

const commandsMap = new Map([
  ['exit', exit],
  ['echo', echo],
  ['type', type],
]);

// ==================
// Main Function
// ==================

async function main() {
  while (state.rlOpen) {
    const input = await rl.question('$ ');

    const spaceIndex = input.indexOf(' ');
    let command = '';
    let argsString = '';
    if (spaceIndex === -1) {
      command = input;
    } else {
      command = input.slice(0, spaceIndex);
      argsString = input.slice(spaceIndex + 1);
    }

    const commandFunction = commandsMap.get(command);

    if (!commandFunction) {
      console.log(`${command}: command not found`);
      continue;
    }

    commandFunction(argsString);
  }
}

main();

// ==================
// Command Functions
// ==================

function exit() {
  rl.close();
  state.rlOpen = false;
}

function echo(argsString: string) {
  console.log(argsString);
}

function type(argsString: string) {
  if (!commandsMap.has(argsString)) {
    console.log(`${argsString}: not found`);
    return;
  }

  console.log(`${argsString} is a shell builtin`);
}
