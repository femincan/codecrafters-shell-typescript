import { createCommand } from '@/lib/command';
import { stringToStream } from '@/lib/utils';

createCommand('echo', (args) => {
  return { stdout: stringToStream(args.join(' ')) };
});
