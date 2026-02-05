import { createCommand } from '@/lib/command';
import { getFormattedCmdHistory } from '@/lib/history';
import { stringToStream } from '@/lib/utils';

createCommand('history', () => {
  return {
    stdout: stringToStream(getFormattedCmdHistory()),
    stderr: stringToStream(''),
  };
});
