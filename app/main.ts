import { createInterface } from 'node:readline/promises';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

while (true) {
  const command = await rl.question('$ ');

  console.log(`${command}: command not found`);
}
