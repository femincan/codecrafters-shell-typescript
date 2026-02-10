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
      let order = 1;
      for (let i = count; i > 0; i--) {
        controller.write(encoder.encode(`${order} ${history[i - 1]}\n`));
        order += 1;
      }

      controller.end();
    },
  });
}
