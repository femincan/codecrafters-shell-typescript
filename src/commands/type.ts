import { registerCommand } from '@/lib/command';
import { getExePath } from '@/lib/exe';
import { stringToStdStream } from '@/lib/output';

export default registerCommand('type', (args, state) => {
  const command = args[0] || '';

  if (state.commands.has(command)) {
    return {
      stdout: stringToStdStream(`${command} is a shell builtin`),
      stderr: stringToStdStream(''),
    };
  }

  const exePath = getExePath(command);
  if (exePath) {
    return {
      stdout: stringToStdStream(`${command} is ${exePath}`),
      stderr: stringToStdStream(''),
    };
  }

  return {
    stdout: stringToStdStream(''),
    stderr: stringToStdStream(`${command}: not found`),
  };
});
