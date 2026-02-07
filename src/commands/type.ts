import { commandsMap, registerCommand } from '@/lib/command';
import { getExePath } from '@/lib/exe';
import { stringToStream } from '@/lib/utils';

export default registerCommand('type', (args) => {
  const command = args[0] || '';

  if (commandsMap.has(command)) {
    return {
      stdout: stringToStream(`${command} is a shell builtin`),
      stderr: stringToStream(''),
    };
  }

  const exePath = getExePath(command);
  if (exePath) {
    return {
      stdout: stringToStream(`${command} is ${exePath}`),
      stderr: stringToStream(''),
    };
  }

  return {
    stdout: stringToStream(''),
    stderr: stringToStream(`${command}: not found`),
  };
});
