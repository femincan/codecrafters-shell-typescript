import { registerCommand } from '@/lib/command';
import { stringToStream } from '@/lib/utils';

export default registerCommand('pwd', () => {
  return { stdout: stringToStream(process.cwd()), stderr: stringToStream('') };
});
