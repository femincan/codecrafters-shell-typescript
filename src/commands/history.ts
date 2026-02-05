import { createCommand } from '@/lib/command';
import { stringToStream } from '@/lib/utils';

createCommand('history', () => {
  return { stdout: stringToStream(''), stderr: stringToStream('') };
});
