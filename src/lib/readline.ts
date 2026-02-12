import { createInterface } from 'node:readline/promises';
import { createCompleter } from './autocomplete';

export function createReadlineInterface(prompt: string) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: prompt,
  });

  rl.completer = createCompleter(rl);

  return rl;
}
