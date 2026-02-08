import { executeCommand } from './lib/executor';
import { parseInput } from './lib/input';
import { handleOutput } from './lib/output';
import { ShellState } from './lib/shell';

export class Shell {
  private prompt = '$ ';
  readonly state: ShellState;

  constructor(prompt?: string) {
    if (prompt) {
      this.prompt = prompt;
    }

    this.state = new ShellState(this.prompt);
  }

  async start() {
    await this.state.initialize();

    while (true) {
      const input = await this.state.rl.question(this.prompt);
      const parsedInput = parseInput(input);
      const output = await executeCommand(parsedInput, this.state);
      await handleOutput(output, parsedInput);
    }
  }
}
