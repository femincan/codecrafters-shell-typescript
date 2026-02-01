import { open } from 'node:fs/promises';
import { commandsMap, loadCommands } from './lib/command';
import { runExe } from './lib/exe';
import { parseInput } from './lib/input';
import type { CommandOutput, StdStream } from './lib/types';
import { valueToString } from './lib/utils';

export default async function main() {
  await loadCommands();
  await printPrompt();

  for await (const input of console) {
    const { command, args, redirect } = parseInput(input);

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

    await printPrompt();
  }
}

async function printPrompt() {
  await Bun.stdout.write('$ ');
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

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    writeStream.write(value);
  }

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

async function printStdStream(stream: StdStream, type: 'stdout' | 'stderr') {
  const reader = stream.getReader();
  let lastValue = null;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    const valueStr = valueToString(value);
    if (valueStr.length) {
      await Bun[type].write(valueStr);
      lastValue = valueStr;
    }
  }

  if (lastValue && !lastValue.endsWith('\n')) {
    await Bun[type].write('\n');
  }
}
