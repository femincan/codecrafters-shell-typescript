export type StdOutput = Uint8Array<ArrayBuffer>;
export type StdStream = ReadableStream<StdOutput>;

export type CommandOutput = Partial<{
  stdout: StdStream;
  stderr: StdStream;
}>;
