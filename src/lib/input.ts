export function parseInput(input: string) {
  const parsedArgs = parseArgs(input.trim());

  return {
    command: parsedArgs[0] ?? '',
    args: parsedArgs.slice(1),
  };
}

const charsToEscapeInDoubleQuotes = new Set(['"', '\\', '$', '`']);

function parseArgs(argsStr: string) {
  const args = [];

  let currentArg = '';
  let inSingleQuotes = false,
    inDoubleQuotes = false;

  for (let i = 0; i < argsStr.length; i++) {
    const char = argsStr[i];

    if (char === "'" && !inDoubleQuotes) {
      inSingleQuotes = !inSingleQuotes;
      continue;
    }

    if (char === '"' && !inSingleQuotes) {
      inDoubleQuotes = !inDoubleQuotes;
      continue;
    }

    if (char === ' ' && !inSingleQuotes && !inDoubleQuotes) {
      args.push(currentArg);
      currentArg = '';

      while (argsStr[i + 1] === ' ') i++;
      continue;
    }

    if (char === '\\' && !inSingleQuotes) {
      const nextChar = argsStr[i + 1] ?? '';

      if (!inDoubleQuotes || charsToEscapeInDoubleQuotes.has(nextChar)) {
        currentArg += nextChar;
        i++;
        continue;
      }
    }

    currentArg += char;
  }

  if (currentArg) {
    args.push(currentArg);
  }

  return args;
}
