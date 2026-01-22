import { commandsMap, createCommand } from '@/lib/command';
import { findExe } from '@/lib/exe';

createCommand('type', (rest) => {
  if (commandsMap.has(rest)) {
    console.log(`${rest} is a shell builtin`);
    return;
  }

  const exePath = findExe(rest);
  if (exePath) {
    console.log(`${rest} is ${exePath}`);
    return;
  }

  console.log(`${rest}: not found`);
});
