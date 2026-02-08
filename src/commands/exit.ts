import { registerCommand } from '@/lib/command';

export default registerCommand('exit', (args, state) => {
  state.rl.close();
  process.exit(Number(args[0]) || 0);
});
