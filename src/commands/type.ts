import { commandsMap, createCommand } from '@/lib/command';
import { getExePath } from '@/lib/exe';

createCommand('type', (args) => {
  const command = args[0] || '';

  if (commandsMap.has(command)) {
    console.log(`${command} is a shell builtin`);
    return;
  }

  const exePath = getExePath(command);
  if (exePath) {
    console.log(`${command} is ${exePath}`);
    return;
  }

  console.log(`${command}: not found`);
});
