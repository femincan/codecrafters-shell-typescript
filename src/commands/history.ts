import { registerCommand } from '@/lib/command';
import { createFormattedHistoryStream, readHistoryFile } from '@/lib/history';
import { stringToStdStream } from '@/lib/output';

export default registerCommand('history', async (args, state) => {
  let stdout = stringToStdStream(''),
    stderr = stringToStdStream('');

  switch (args[0]) {
    case '-r':
      const historyFilePath = args[1];
      if (!historyFilePath) {
        stderr = stringToStdStream(
          'Missing target history file. Usage: -i <history_file>',
        );

        break;
      }

      const readResult = await readHistoryFile(
        historyFilePath,
        state.rl.history,
      );
      if (!readResult.ok) {
        stderr = stringToStdStream(readResult.err);
      }
      break;

    default:
      stdout = createFormattedHistoryStream(
        state.rl.history,
        Number(args[0]) || state.rl.history.length,
      );
      break;
  }

  return {
    stdout,
    stderr,
  };
});
