import { createCommand } from '@/lib/command';
import { commandHistory, getFormattedCmdHistory } from '@/lib/history';
import { stringToStream } from '@/lib/utils';

createCommand('history', (args) => {
  let n: number = Number(args[0]);

  return {
    stdout: stringToStream(
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
    stderr: stringToStream(''),
  };
});
