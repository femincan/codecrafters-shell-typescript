import { registerCommand } from '@/lib/command';
import { appendHistoryToFileOnExit } from '@/lib/history';

export default registerCommand('exit', async (args, state) => {
  state.rl.close();
  await appendHistoryToFileOnExit(state);
  process.exit(Number(args[0]) || 0);
});
