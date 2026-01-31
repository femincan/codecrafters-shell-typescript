export type StdOutput = Uint8Array<ArrayBuffer>;
export type StdStream = ReadableStream<StdOutput>;

export type CommandOutput = {
  stdout: StdStream;
  stderr: StdStream;
};
