import { createCommand } from '@/lib/command';
import { stringToStream } from '@/lib/utils';

createCommand('cd', (args) => {
  const targetLoc = args[0] || '';

  let dir = targetLoc;
  if (targetLoc.startsWith('~') && Bun.env.HOME) {
    dir = dir.replace('~', Bun.env.HOME);
  }

  try {
    process.chdir(dir);
  } catch {
    return {
      stdout: stringToStream(''),
      stderr: stringToStream(`cd: ${targetLoc}: No such file or directory`),
    };
  }

  return { stdout: stringToStream(''), stderr: stringToStream('') };
});
