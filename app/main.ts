import { createInterface, type Interface } from 'node:readline/promises';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const commandsObj = {
  exit: exitShell,
};

while (true) {
  const answer = await rl.question('$ ');

  if (Object.hasOwn(commandsObj, answer)) {
    const commandFunction = commandsObj[answer as keyof typeof commandsObj];
    commandFunction();
    continue;
  }

  console.log(`${answer}: command not found`);
}

function exitShell() {
  rl.close();
}
