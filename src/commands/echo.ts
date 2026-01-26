import { createCommand } from '@/lib/command';
import { processQuotes } from '@/lib/quote';

createCommand('echo', (rest) => {
  console.log(processQuotes(rest));
});
