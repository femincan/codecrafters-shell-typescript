import { delimiter, resolve } from 'node:path';
import {
  accessSync,
  constants as fsConstants,
  existsSync,
  readdirSync,
} from 'node:fs';
import { exec } from 'node:child_process';

// ==================
// Types
// ==================

type CommandName = string;
type CommandFunction = (rest: string) => void;

// ==================
// Globals
// ==================

const PROMPT = '$ ';

const commandsMap = new Map<CommandName, CommandFunction>();

// ==================
// Main Function
// ==================

async function main() {
  printPrompt();

  for await (const input of console) {
    const spaceIndex = input.indexOf(' ');
    let command = '';
    let rest = '';
    if (spaceIndex === -1) {
      command = input;
    } else {
      command = input.slice(0, spaceIndex);
      rest = input.slice(spaceIndex + 1);
    }

    const commandFunction = commandsMap.get(command);

    // If the command isn't built-in try to find exe with this command name and execute it
    if (commandFunction) {
      commandFunction(rest);
    } else {
      const result = await runExe(command, rest);

      if (!result.success) {
        console.log(result.message);
      }
    }

    printPrompt();
  }
}

main();

// ==================
// Command Functions
// ==================

// exit
createCommand('exit', () => {
  process.exit(0);
});

// echo
createCommand('echo', (rest) => {
  let localRest = rest;

  const doubleQuotePairIndexes: number[][] = [];
  for (let i = 0; i < localRest.length; i++) {
    const char = localRest[i];

    if (char !== '"') continue;
    if (localRest[i - 1] === '\\') continue;

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

    if (char !== "'") continue;
    if (localRest[i - 1] === '\\') continue;

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

  localRest = localRest.replaceAll(/\s+|['"]|\\/g, (match, offset) => {
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

// type
createCommand('type', (rest) => {
  if (commandsMap.has(rest)) {
    console.log(`${rest} is a shell builtin`);
    return;
  }

  const exePath = findExe(rest);
  if (exePath) {
    console.log(`${rest} is ${exePath}`);
    return;
  }

  console.log(`${rest}: not found`);
});

// pwd
createCommand('pwd', () => {
  console.log(process.cwd());
});

// cd
createCommand('cd', (rest) => {
  let dir = rest;
  if (rest.startsWith('~') && Bun.env.HOME) {
    dir = dir.replace('~', Bun.env.HOME);
  }

  try {
    process.chdir(dir);
  } catch {
    console.log(`cd: ${rest}: No such file or directory`);
  }
});

// ==================
// Run executable
// ==================

async function runExe(
  command: string,
  rest: string,
): Promise<{ success: true } | { success: false; message: string }> {
  const exePath = findExe(command);

  if (!exePath) {
    return { success: false, message: `${command}: command not found` };
  }

  const subprocess = exec(`${command} ${rest}`);

  if (subprocess.stdout) {
    for await (const chunk of subprocess.stdout) {
      Bun.stdout.write(chunk);
    }
  }

  return { success: true };
}

// ==================
// Utility Functions
// ==================

function printPrompt() {
  Bun.stdout.write(PROMPT);
}

function createCommand(name: CommandName, func: CommandFunction) {
  commandsMap.set(name, func);
}

function findExe(exeName: string) {
  const pathDirs = (Bun.env.PATH || Bun.env.Path || '').split(delimiter);

  for (const dir of pathDirs) {
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir);
    if (files.includes(exeName)) {
      const filePath = resolve(dir, exeName);
      if (isExecutable(filePath)) {
        return filePath;
      }
    }
  }

  return null;
}

function isExecutable(filePath: string) {
  try {
    accessSync(filePath, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}
