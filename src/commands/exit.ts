import { registerCommand } from '@/lib/command';
import { writeHistoryToFileOnExit } from '@/lib/history';

export default registerCommand('exit', async (args, state) => {
  state.rl.close();
  await writeHistoryToFileOnExit(state.rl.history);
  process.exit(Number(args[0]) || 0);
});
