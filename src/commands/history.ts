import { registerCommand } from '@/lib/command';
import {
  createFormattedHistoryStream,
  createHistoryFileReader,
} from '@/lib/history';
import { stringToStdStream } from '@/lib/output';

export default registerCommand('history', async (args, state) => {
  let stdout = stringToStdStream(''),
    stderr = stringToStdStream('');

  switch (args[0]) {
    case '-r':
      const historyFilePath = args[1];
      if (!historyFilePath) {
        stderr = stringToStdStream(
          'The target history file should be provided after the "-i" argument',
        );

        break;
      }

      const readResult = createHistoryFileReader(historyFilePath);
      if (!readResult.ok) {
        stderr = stringToStdStream(readResult.err);
        break;
      }

      for await (const line of readResult.reader) {
        state.rl.history.unshift(line);
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
