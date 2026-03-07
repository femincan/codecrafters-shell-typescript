export type RedirectData = {
  type: 'stdout' | 'stderr';
  file: string;
  mode: 'write' | 'append';
};
export type CommandNode = {
  command: string;
  args: string[];
  redirect?: RedirectData;
};
export type ParseInputResult = CommandNode[];

const charsToEscapeInDoubleQuotes = new Set(['"', '\\', '$', '`']);
const redirectMap = new Map<string, Pick<RedirectData, 'type' | 'mode'>>([
  ['>', { type: 'stdout', mode: 'write' }],
  ['1>', { type: 'stdout', mode: 'write' }],
  ['>>', { type: 'stdout', mode: 'append' }],
  ['1>>', { type: 'stdout', mode: 'append' }],
  ['2>', { type: 'stderr', mode: 'write' }],
  ['2>>', { type: 'stderr', mode: 'append' }],
]);

export function parseInput(input: string): ParseInputResult {
  const parsedArgs = parseArgs(input.trim());
  const parsedInput: CommandNode[] = [];

  const currentProcess = [];
  for (const arg of parsedArgs) {
    if (arg === '|') {
      if (currentProcess.length) {
        parsedInput.push(parseCommand(currentProcess));
        currentProcess.length = 0;
      }

      continue;
    }

    currentProcess.push(arg);
  }

  if (currentProcess.length) {
    parsedInput.push(parseCommand(currentProcess));
  }

  return parsedInput;
}

function parseArgs(argsStr: string): string[] {
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

function parseCommand(currentCommand: string[]): CommandNode {
  const command = currentCommand[0]!;
  const redirectData = redirectMap.get(currentCommand.at(-2) ?? '');

  if (redirectData && currentCommand.length >= 3) {
    return {
      command,
      args: currentCommand.slice(1, -2),
      redirect: {
        ...redirectData,
        file: currentCommand.at(-1)!,
      },
    };
  }

  return {
    command,
    args: currentCommand.slice(1),
  };
}
