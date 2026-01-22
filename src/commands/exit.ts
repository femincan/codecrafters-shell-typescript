import { createCommand } from '@/lib/command';

createCommand('exit', () => {
  process.exit(0);
});
