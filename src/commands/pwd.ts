import { registerCommand } from '@/lib/command';
import { stringToStdStream } from '@/lib/output';

export default registerCommand('pwd', () => {
  return {
    stdout: stringToStdStream(process.cwd()),
    stderr: stringToStdStream(''),
  };
});
