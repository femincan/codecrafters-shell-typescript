import { registerCommand } from '@/lib/command';
import { stringToStream } from '@/lib/utils';

export default registerCommand('echo', (args) => {
  return { stdout: stringToStream(args.join(' ')), stderr: stringToStream('') };
});
