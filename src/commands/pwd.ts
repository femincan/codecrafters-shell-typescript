import { createCommand } from '@/lib/command';
import { stringToStream } from '@/lib/utils';

createCommand('pwd', () => {
  return { stdout: stringToStream(process.cwd()), stderr: stringToStream('') };
});
