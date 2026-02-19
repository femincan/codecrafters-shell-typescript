import { createReadStream, createWriteStream } from 'node:fs';
import { type Interface, createInterface } from 'node:readline/promises';
import { type StdStream } from './output';

export type LastAppendedIndexMap = Map<string, number>;
type Result = { ok: true } | { ok: false; err: string };

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

export async function readHistoryFileOnStartUp(
  history: Interface['history'],
  lastAppendedIndexMap: LastAppendedIndexMap,
) {
  const filePath = Bun.env.HISTFILE;
  if (!filePath) return;

  const result = await readHistoryFile(filePath, history);
  if (!result.ok) return;

  lastAppendedIndexMap.set(filePath, -(history.length + 1));

  return history;
}

export async function appendHistoryToFileOnExit(
  history: Interface['history'],
  lastAppendedIndexMap: LastAppendedIndexMap,
) {
  const filePath = Bun.env.HISTFILE;
  if (!filePath) return;

  await appendHistoryToFile(filePath, history, lastAppendedIndexMap);
}

export async function readHistoryFile(
  filePath: string,
  history: Interface['history'],
): Promise<Result> {
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

export async function writeHistoryToFile(
  filePath: string,
  history: Interface['history'],
): Promise<Result> {
  try {
    const stream = createWriteStream(filePath, { flags: 'w' });

    for (let i = history.length - 1; i >= 0; i--) {
      stream.write(`${history[i]}\n`);
    }
    stream.end();

    return await new Promise((resolve) =>
      stream.on('finish', () => resolve({ ok: true })),
    );
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

export async function appendHistoryToFile(
  filePath: string,
  history: Interface['history'],
  lastAppendedIndexMap: LastAppendedIndexMap,
): Promise<Result> {
  let lastIndex = lastAppendedIndexMap.get(filePath) ?? -1;

  try {
    const stream = createWriteStream(filePath, { flags: 'a' });

    while (lastIndex >= -history.length) {
      stream.write(`${history.at(lastIndex--)}\n`);
    }
    lastAppendedIndexMap.set(filePath, lastIndex);
    stream.end();

    return await new Promise((resolve) =>
      stream.on('finish', () => resolve({ ok: true })),
    );
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
