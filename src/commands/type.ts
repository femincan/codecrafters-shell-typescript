import { commandsMap, createCommand } from '@/lib/command';
import { getExePath } from '@/lib/exe';
import { stringToStream } from '@/lib/utils';

createCommand('type', (args) => {
  const command = args[0] || '';

  if (commandsMap.has(command)) {
    return { stdout: stringToStream(`${command} is a shell builtin`) };
  }

  const exePath = getExePath(command);
  if (exePath) {
    return { stdout: stringToStream(`${command} is ${exePath}`) };
  }

  return { stderr: stringToStream(`${command}: not found`) };
});
