export type RedirectType = 'stdout' | 'stderr';

export type ParseInputResult = {
  command: string;
  args: string[];
  redirect?: ParsedRedirectData & {
    targetFile: string;
  };
};

export function parseInput(input: string): ParseInputResult {
  const parsedArgs = parseArgs(input.trim());
  const command = parsedArgs.shift() ?? '';
  const redirectData = parseRedirect(parsedArgs.at(-2) ?? '');

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

type ParsedRedirectData = { type: RedirectType; override: boolean };

const redirectMap = new Map<string, ParsedRedirectData>([
  ['>', { type: 'stdout', override: true }],
  ['1>', { type: 'stdout', override: true }],
  ['>>', { type: 'stdout', override: false }],
  ['1>>', { type: 'stdout', override: false }],
  ['2>', { type: 'stderr', override: true }],
  ['2>>', { type: 'stderr', override: false }],
]);

function parseRedirect(redirectStr: string): ParsedRedirectData | null {
  return redirectMap.get(redirectStr) ?? null;
}
