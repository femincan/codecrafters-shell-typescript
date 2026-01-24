import { createCommand } from '@/lib/command';
import { processQuotes } from '@/lib/quote';

createCommand('echo', (rest) => {
  return processQuotes(rest);
});
