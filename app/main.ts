import { createInterface } from 'node:readline/promises';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

while (true) {
  const answer = await rl.question('$ ');

  if (answer === 'exit') {
    rl.close();
    break;
  }

  console.log(`${answer}: command not found`);
}
