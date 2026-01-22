import { createCommand } from '@/lib/command';

createCommand('pwd', () => {
  console.log(process.cwd());
});
