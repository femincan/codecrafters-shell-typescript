import type { WriteStream } from 'node:fs';
import { open } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import type { ReadableStreamDefaultReader } from 'node:stream/web';
import { createCommandsTrie, createCompleter } from './lib/autocomplete';
import { commandsMap, registerCommands } from './lib/command';
import { runExe } from './lib/exe';
import { commandHistory } from './lib/history';
import { parseInput, type RedirectType } from './lib/input';
import type { CommandOutput, StdOutput, StdStream } from './lib/types';
import { valueToString } from './lib/utils';

const PROMPT = '$ ';

export default async function main() {
  await registerCommands();
  createCommandsTrie();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: PROMPT,
    completer: (line) => {
      const completerFunc = createCompleter(rl);
      return completerFunc(line);
    },
  });

  while (true) {
    const input = await rl.question(PROMPT);
    const { command, args, redirect } = parseInput(input);

    commandHistory.push(input);

    const commandFunction = commandsMap.get(command);

    let output;
    if (commandFunction) {
      output = commandFunction(args);
    } else {
      output = await runExe(command, args);
    }

    if (redirect) {
      await redirectOutput(output, redirect);

      if (redirect.type === 'stdout' && output.stderr) {
        await printStdStream(output.stderr, 'stderr');
      }

      if (redirect.type === 'stderr' && output.stdout) {
        await printStdStream(output.stdout, 'stdout');
      }
    } else {
      await printOutput(output);
    }
  }
}

async function redirectOutput(
  output: CommandOutput,
  redirect: NonNullable<ReturnType<typeof parseInput>['redirect']>,
) {
  const redirectStream = output[redirect.type];

  const fileDescriptor = await open(
    redirect.targetFile,
    redirect.override ? 'w' : 'a',
  );

  const writeStream = fileDescriptor.createWriteStream();
  const reader = redirectStream.getReader();

  await writeStreamOutput(reader, writeStream);

  writeStream.end();
}

async function printOutput({ stdout, stderr }: CommandOutput) {
  if (stdout) {
    await printStdStream(stdout, 'stdout');
  }

  if (stderr) {
    await printStdStream(stderr, 'stderr');
  }
}

async function printStdStream(stream: StdStream, type: RedirectType) {
  const reader = stream.getReader();

  await writeStreamOutput(reader, Bun[type]);
}

async function writeStreamOutput(
  reader: ReadableStreamDefaultReader<StdOutput>,
  writer: Bun.BunFile | WriteStream,
) {
  let lastValue = null;
  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const valueStr = valueToString(value);
    if (valueStr.length) {
      await writer.write(valueStr);
      lastValue = valueStr;
    }
  }

  if (lastValue && !lastValue.endsWith('\n')) {
    await writer.write('\n');
  }
}
