import type { StdOutput, StdStream } from './types';

export function stringToStream(str: string): StdStream {
  return new Response(new TextEncoder().encode(str)).body!;
}

export function chunkToString(chunk: StdOutput) {
  return new TextDecoder().decode(chunk);
}
