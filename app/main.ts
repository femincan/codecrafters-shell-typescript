import { createInterface } from 'node:readline/promises';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

  console.log(`${command}: command not found`);
}
