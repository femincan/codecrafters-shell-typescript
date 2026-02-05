import type { StdOutput, StdStream } from './types';

export function stringToStream(str: string): StdStream {
  return new Response(new TextEncoder().encode(str)).body!;
}

export function valueToString(value: StdOutput) {
  return new TextDecoder().decode(value);
}

export function getLongestCommonPrefix(strings: string[]) {
  if (!strings.length) return '';

  const firstStr = strings[0]!;

  let i = 0;
  while (true) {
    const char = firstStr[i];
    if (!char) return firstStr.slice(0, i);

    for (const str of strings) {
      if (str[i] !== char) {
        return firstStr.slice(0, i);
      }
    }

    i++;
  }
}
