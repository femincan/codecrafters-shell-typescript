type RedirectType = 'stdout' | 'stderr';

export function parseInput(input: string) {
  const parsedArgs = parseArgs(input.trim());
  const command = parsedArgs.shift() ?? '';
  const redirectData = getRedirectTypeWithMode(parsedArgs.at(-2) ?? '');

  if (redirectData && parsedArgs.length >= 2) {
    return {
      command,
      args: parsedArgs.slice(0, -2),
      redirect: {
        ...redirectData,
        targetFile: parsedArgs.at(-1)!,
      },
    };
  }

  return {
    command,
    args: parsedArgs,
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

function getRedirectTypeWithMode(redirectStr: string): {
  type: RedirectType;
  override: boolean;
} | null {
  if (['1>', '>'].includes(redirectStr)) {
    return { type: 'stdout', override: true };
  }

  if (['1>>', '>>'].includes(redirectStr)) {
    return { type: 'stdout', override: false };
  }

  if (['2>'].includes(redirectStr)) {
    return { type: 'stderr', override: true };
  }

  if (['2>>'].includes(redirectStr)) {
    return { type: 'stderr', override: false };
  }

  return null;
}
