import { createInterface } from 'node:readline/promises';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const builtinCommands = new Set(['exit', 'echo', 'type']);

while (true) {
  const answer = await rl.question('$ ');

  const [command, ...rest] = answer.split(' ');

  if (command === 'exit') {
    rl.close();
    break;
  }

  if (command === 'echo') {
    console.log(`${rest.join(' ')}`);
    continue;
  }

  if (command === 'type') {
    const arg = rest.join('');
    if (builtinCommands.has(arg)) {
      console.log(`${arg} is a shell builtin`);
    } else {
      console.log(`${arg}: not found`);
    }
    continue;
  }

  console.log(`${command}: command not found`);
}
