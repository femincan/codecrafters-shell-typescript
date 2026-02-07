import { registerCommand } from '@/lib/command';

export default registerCommand('exit', () => {
  process.exit(0);
});
