import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import type { Interface } from 'node:readline/promises';
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

export async function readHistoryFile(
  filePath: string,
  history: Interface['history'],
): Promise<{ ok: false; err: string } | { ok: true }> {
  try {
    const stream = createReadStream(filePath);

    const rl = createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      history.unshift(line);
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      err:
        error instanceof Error
          ? error.message
          : `Failed to open history file: ${filePath}`,
    };
  }
}
