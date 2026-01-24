const defaultPrompt = '$ ';
export function printPrompt(prompt = defaultPrompt) {
  Bun.stdout.write(prompt);
}
