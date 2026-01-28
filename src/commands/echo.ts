import { createCommand } from '@/lib/command';

createCommand('echo', (rest: string) => {
  console.log(rest);
});
