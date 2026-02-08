import { registerCommand } from '@/lib/command';
import { stringToStdStream } from '@/lib/output';

export default registerCommand('echo', (args) => {
  return {
    stdout: stringToStdStream(args.join(' ')),
    stderr: stringToStdStream(''),
  };
});
