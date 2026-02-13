import { createReadStream, existsSync } from 'node:fs';
import { createInterface, Interface } from 'node:readline';
import { type StdStream } from './output';

export function createFormattedHistoryStream(
  history: string[],
  limit: number,
): StdStream {
  const encoder = new TextEncoder();
  const count = Math.min(history.length, limit);

  return new ReadableStream({
    type: 'direct',
    pull(controller) {
      for (let i = count - 1; i >= 0; i--) {
        controller.write(
          encoder.encode(`${history.length - i} ${history[i]}\n`),
        );
      }

      controller.end();
    },
  });
}

export function createHistoryFileReader(
  filePath: string,
): { ok: false; err: string } | { ok: true; reader: Interface } {
  if (!existsSync(filePath)) {
    return {
      ok: false,
      err: `Given history file does not exist: "${filePath}"`,
    };
  }

  const stream = createReadStream(filePath);

  const rl = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  return { ok: true, reader: rl };
}
