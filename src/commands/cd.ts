import { createCommand } from '@/lib/command';

createCommand('cd', (args) => {
  const targetLoc = args[0] || '';

  let dir = targetLoc;
  if (targetLoc.startsWith('~') && Bun.env.HOME) {
    dir = dir.replace('~', Bun.env.HOME);
  }

  try {
    process.chdir(dir);
  } catch {
    console.log(`cd: ${targetLoc}: No such file or directory`);
  }
});
