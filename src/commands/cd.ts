import { createCommand } from '@/lib/command';

createCommand('cd', (rest) => {
  let dir = rest;
  if (rest.startsWith('~') && Bun.env.HOME) {
    dir = dir.replace('~', Bun.env.HOME);
  }

  try {
    process.chdir(dir);
  } catch {
    console.log(`cd: ${rest}: No such file or directory`);
  }
});
