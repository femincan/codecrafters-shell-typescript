import { createCommand } from '@/lib/command';

createCommand('echo', (args) => {
  console.log(args.join(' '));
});
