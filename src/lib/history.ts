import { createReadStream, createWriteStream } from 'node:fs';
import { type Interface, createInterface } from 'node:readline/promises';
import { type StdStream } from './output';
import type { ShellState } from './shell';

export type LastAppendedIndexMap = Map<string, number>;

export function createFormattedHistoryStream(
  history: Interface['history'],
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
  history: Interface['history'],
): Promise<{ ok: false; err: string } | { ok: true }> {
  let rl;
  try {
    const stream = createReadStream(filePath);

    rl = createInterface({
      input: stream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      history.unshift(line);
    }

    return { ok: true };
  } catch (error) {
    let errorMessage;
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        errorMessage = 'History file not found.';
      } else {
        errorMessage = error.message;
      }
    } else {
      errorMessage = `Failed to open history file: ${filePath}`;
    }

    return {
      ok: false,
      err: errorMessage,
    };
  } finally {
    if (rl) {
      rl.close();
    }
  }
}

export function writeHistoryToFile(
  filePath: string,
  history: Interface['history'],
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

export function appendHistoryToFile(
  filePath: string,
  state: ShellState,
): { ok: false; err: string } | { ok: true } {
  let lastIndex = state.lastAppendedIndexByFilePath.get(filePath) ?? -1;

  try {
    const stream = createWriteStream(filePath, { flags: 'a' });

    while (lastIndex >= -state.rl.history.length) {
      stream.write(`${state.rl.history.at(lastIndex--)}\n`);
    }

    state.lastAppendedIndexByFilePath.set(filePath, lastIndex);
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
