import { open } from 'node:fs/promises';
import { commandsMap, loadCommands } from './lib/command';
import { runExe } from './lib/exe';
import { parseInput } from './lib/input';
import type { CommandOutput, StdStream } from './lib/types';
import { chunkToString } from './lib/utils';

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

  let fileDescriptor;
  if (redirect.override) {
    fileDescriptor = await open(redirect.targetFile, 'w');
  } else {
    fileDescriptor = await open(redirect.targetFile, 'a');
  }

  const writeStream = fileDescriptor.createWriteStream();
  for await (const chunk of redirectStream) {
    writeStream.write(chunk);
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
  let lastChunk = null;
  for await (const chunk of stream) {
    const chunkStr = chunkToString(chunk);

    if (chunkStr.length) {
      await Bun[type].write(chunkStr);
      lastChunk = chunkStr;
    }
  }

  if (lastChunk && !lastChunk.endsWith('\n')) {
    await Bun[type].write('\n');
  }
}
