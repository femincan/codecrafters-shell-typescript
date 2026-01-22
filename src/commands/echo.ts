import { createCommand } from '@/lib/command';

createCommand('echo', (rest) => {
  let localRest = rest;

  const charsToEscape = new Set(["'", '"', '\\', '$', '`', '\n']);
  const escapedCharIndexes = new Set<number>();
  for (let i = 0; i < localRest.length; i++) {
    const char = localRest[i];

    if (char !== '\\' || escapedCharIndexes.has(i)) continue;

    if (charsToEscape.has(localRest[i + 1] || '')) {
      escapedCharIndexes.add(i + 1);
    }
  }

  const doubleQuotePairIndexes: number[][] = [];
  for (let i = 0; i < localRest.length; i++) {
    const char = localRest[i];

    if (char !== '"' || escapedCharIndexes.has(i)) continue;

    const lastPair = doubleQuotePairIndexes.at(-1);
    if (lastPair && lastPair.length !== 2) {
      lastPair.push(i);
      continue;
    }

    doubleQuotePairIndexes.push([i]);
  }

  const singleQuotePairIndexes: number[][] = [];
  for (let i = 0; i < localRest.length; i++) {
    const char = localRest[i];

    if (char !== "'" || escapedCharIndexes.has(i)) continue;

    const isBetweenDoubleQuotes = doubleQuotePairIndexes.some(
      ([startIdx, endIdx]) => {
        if (startIdx === undefined || endIdx === undefined) return false;

        return startIdx < i && i < endIdx;
      },
    );

    if (isBetweenDoubleQuotes) continue;

    const lastPair = singleQuotePairIndexes.at(-1);
    if (lastPair && lastPair.length !== 2) {
      lastPair.push(i);
      continue;
    }

    singleQuotePairIndexes.push([i]);
  }

  localRest = localRest.replaceAll(/\s+|['"\\]/g, (match, offset) => {
    if (escapedCharIndexes.has(offset)) return match;

    if (["'", '"'].includes(match)) {
      const isPartOfQuotePair = [
        ...doubleQuotePairIndexes,
        ...singleQuotePairIndexes,
      ]
        .flat()
        .includes(offset);

      if (isPartOfQuotePair) {
        return '';
      }

      return match;
    } else if (match === '\\') {
      const isBetweenSingleQuotes = singleQuotePairIndexes.some(
        ([startIdx, endIdx]) => {
          if (startIdx === undefined || endIdx === undefined) return false;

          return startIdx < offset && offset < endIdx;
        },
      );

      if (isBetweenSingleQuotes) {
        return match;
      }

      return '';
    } else {
      const isBetweenQuotes = [
        ...doubleQuotePairIndexes,
        ...singleQuotePairIndexes,
      ].some(([startIdx, endIdx]) => {
        if (startIdx === undefined || endIdx === undefined) return false;

        return startIdx < offset && offset < endIdx;
      });

      if (isBetweenQuotes) {
        return match;
      }

      return ' ';
    }
  });

  console.log(localRest);
});
