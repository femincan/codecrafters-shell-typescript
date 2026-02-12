import 'readline/promises';
import type { Completer } from 'readline/promises';

declare module 'readline' {
  interface Interface {
    history: string[];
    completer: Completer;
  }
}
