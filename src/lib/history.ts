import type { StdStream } from './output';

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
