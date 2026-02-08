import { registerCommand } from '@/lib/command';
import { commandHistory, getFormattedCmdHistory } from '@/lib/history';
import { stringToStdStream } from '@/lib/output';

export default registerCommand('history', (args) => {
  let n: number = Number(args[0]);

  return {
    stdout: stringToStdStream(
      getFormattedCmdHistory(
        commandHistory
          .slice(-n)
          .toReversed()
          .map((hItem, i) => ({
            index: commandHistory.length - i,
            value: hItem,
          }))
          .toReversed(),
      ),
    ),
    stderr: stringToStdStream(''),
  };
});
