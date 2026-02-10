import { createWriteStream, type WriteStream } from 'node:fs';
import type { ReadableStreamDefaultReader } from 'node:stream/web';
import type { CommandOutput } from './command';
import type { parseInput, ParseInputResult, RedirectType } from './input';

export type StdStream = ReadableStream<StdOutput>;
export type StdOutput = Uint8Array<ArrayBuffer>;

export async function handleOutput(
  output: CommandOutput,
  { redirect }: ParseInputResult,
) {
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

export function stringToStdStream(str: string): StdStream {
  return new Response(new TextEncoder().encode(str)).body!;
}

export function stdOutputToString(output: StdOutput) {
  return new TextDecoder().decode(output);
}

async function redirectOutput(
  output: CommandOutput,
  redirect: NonNullable<ReturnType<typeof parseInput>['redirect']>,
) {
  const reader = output[redirect.type].getReader();
  const writeStream = createWriteStream(redirect.targetFile, {
    flags: redirect.override ? 'w' : 'a',
  });

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

    const valueStr = stdOutputToString(value);
    if (valueStr.length) {
      await writer.write(valueStr);
      lastValue = valueStr;
    }
  }

  if (lastValue && !lastValue.endsWith('\n')) {
    await writer.write('\n');
  }
}
