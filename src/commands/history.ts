import { registerCommand } from '@/lib/command';
import { createFormattedHistoryStream } from '@/lib/history';
import { stringToStdStream } from '@/lib/output';

export default registerCommand('history', (args, state) => {
  return {
    stdout: createFormattedHistoryStream(
      state.rl.history,
      Number(args[0]) || state.rl.history.length,
    ),
    stderr: stringToStdStream(''),
  };
});
