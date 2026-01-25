type Pair = [number, number?];

export function processQuotes(str: string) {
  const escapedChars = getEscapedChars(str);
  const allDoubleQuotePairs = getPairs(str, '"', escapedChars);
  const allSingleQuotePairs = getPairs(str, "'", escapedChars);
  const doubleQuotePairs = getPairs(
    str,
    '"',
    escapedChars,
    allSingleQuotePairs,
  );
  const singleQuotePairs = getPairs(
    str,
    "'",
    escapedChars,
    allDoubleQuotePairs,
  );
  const cleanStr = cleanUpSpecialChars(
    str,
    escapedChars,
    doubleQuotePairs,
    singleQuotePairs,
  );

  return cleanStr;
}

function getEscapedChars(str: string) {
  const charsToEscape = new Set(["'", '"', '\\', '$', '`', '\n']);
  const escapedCharIndexes = new Set<number>();

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char !== '\\' || escapedCharIndexes.has(i)) continue;

    if (charsToEscape.has(str[i + 1] || '')) {
      escapedCharIndexes.add(i + 1);
    }
  }

  return escapedCharIndexes;
}

function cleanUpSpecialChars(
  str: string,
  escapedChars: Set<number>,
  doubleQuotePairs: Pair[],
  singleQuotePairs: Pair[],
) {
  return str.replaceAll(/\s+|['"\\]/g, (match, offset) => {
    if (escapedChars.has(offset)) return match;

    if (match === '"' || match === "'") {
      const isPartOfQuotePair = isPartOfPair(
        [...doubleQuotePairs, ...singleQuotePairs],
        offset,
      );

      if (!isPartOfQuotePair) {
        return match;
      }

      return '';
    }

    if (match === '\\') {
      const isBetweenSingleQuotes = isBetweenPair(singleQuotePairs, offset);

      if (isBetweenSingleQuotes) {
        return match;
      }

      return '';
    }

    const isBetweenQuotes = isBetweenPair(
      [...doubleQuotePairs, ...singleQuotePairs],
      offset,
    );

    if (isBetweenQuotes) {
      return match;
    }

    return ' ';
  });
}

function getPairs(
  str: string,
  targetChar: string,
  escapedChars: Set<number>,
  priorPair?: Pair[],
) {
  const pairs: Pair[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (char !== targetChar || escapedChars.has(i)) continue;

    if (priorPair) {
      const isBetweenPriorPair = isBetweenPair(priorPair, i);

      if (isBetweenPriorPair) continue;
    }

    const lastPair = pairs.at(-1);
    if (lastPair && lastPair.length !== 2) {
      lastPair.push(i);
      continue;
    }

    pairs.push([i]);
  }

  return pairs;
}

function isBetweenPair(pairs: Pair[], index: number) {
  return (
    pairs.findIndex(([startIdx, endIdx]) => {
      if (endIdx === undefined) return false;

      return startIdx < index && index < endIdx;
    }) !== -1
  );
}

function isPartOfPair(pairs: Pair[], index: number) {
  return pairs.flat().includes(index);
}
