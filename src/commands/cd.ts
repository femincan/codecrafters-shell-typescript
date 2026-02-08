import { registerCommand } from '@/lib/command';
import { stringToStdStream } from '@/lib/output';

export default registerCommand('cd', (args) => {
  const targetLoc = args[0] || '';

  let dir = targetLoc;
  if (targetLoc.startsWith('~') && Bun.env.HOME) {
    dir = dir.replace('~', Bun.env.HOME);
  }

  try {
    process.chdir(dir);
  } catch {
    return {
      stdout: stringToStdStream(''),
      stderr: stringToStdStream(`cd: ${targetLoc}: No such file or directory`),
    };
  }

  return { stdout: stringToStdStream(''), stderr: stringToStdStream('') };
});
