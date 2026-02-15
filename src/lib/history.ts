import { createReadStream, createWriteStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { type StdStream } from './output';

type HistoryEntry = string;
type HistoryArray = HistoryEntry[];

export function createFormattedHistoryStream(
  history: HistoryArray[],
  limit: number,
): StdStream {
  const count = Math.min(history.length, limit);

  return new ReadableStream({
    type: 'direct',
    pull(controller) {
      for (let i = count - 1; i >= 0; i--) {
        controller.write(`${history.length - i} ${history[i]}\n`);
      }

      controller.end();
    },
  });
}

export async function readHistoryFile(
  filePath: string,
  history: HistoryArray,
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

export function writeHistoryToFile(
  filePath: string,
  history: HistoryArray,
): { ok: false; err: string } | { ok: true } {
  try {
    const stream = createWriteStream(filePath, { flags: 'w' });

    for (let i = history.length - 1; i >= 0; i--) {
      stream.write(`${history[i]}\n`);
    }

    stream.end();
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

export function createAppender() {
  let lastIndex = -1;

  return (
    filePath: string,
    history: string[],
  ): { ok: false; err: string } | { ok: true } => {
    try {
      const stream = createWriteStream(filePath, { flags: 'a' });

      for (; lastIndex >= -history.length; lastIndex--) {
        stream.write(`${history.at(lastIndex)}\n`);
      }

      stream.end();
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
  };
}
