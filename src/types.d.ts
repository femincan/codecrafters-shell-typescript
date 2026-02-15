import 'readline/promises';
import type { Completer } from 'readline/promises';
import type { HistoryArray } from './src/lib/history';

declare module 'readline' {
  interface Interface {
    history: HistoryArray;
    completer: Completer;
  }
}
