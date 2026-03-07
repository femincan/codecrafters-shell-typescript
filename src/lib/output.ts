import { createWriteStream, type WriteStream } from 'node:fs';
import type { ReadableStreamDefaultReader } from 'node:stream/web';
import type { CommandOutput } from './command';
import type { CommandNode, ParseInputResult, RedirectData } from './input';

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

const textEncoder = new TextEncoder();
export function stringToStdStream(str: string): StdStream {
  return new Response(textEncoder.encode(str)).body!;
}

const textDecoder = new TextDecoder();
export function stdOutputToString(output: StdOutput) {
  return textDecoder.decode(output);
}

async function redirectOutput(
  output: CommandOutput,
  redirect: NonNullable<CommandNode['redirect']>,
) {
  const reader = output[redirect.type].getReader();
  const writeStream = createWriteStream(redirect.file, {
    flags: redirect.mode satisfies 'w' | 'a', // `satisfies` is here to make sure modes are compatible with flags if the type for modes is changed later
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

async function printStdStream(stream: StdStream, type: RedirectData['type']) {
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
