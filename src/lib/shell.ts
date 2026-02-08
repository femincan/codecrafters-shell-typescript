import type { Interface as ReadlineInterface } from 'node:readline/promises';
import { createCommandsTrie } from './autocomplete';
import { registerCommands, type CommandsMap } from './command';
import { createReadlineInterface } from './readline';

export class ShellState {
  readonly commands: CommandsMap = new Map();
  readonly rl: ReadlineInterface;

  constructor(prompt: string) {
    this.rl = createReadlineInterface(prompt);
  }

  async initialize() {
    await registerCommands(this.commands);
    createCommandsTrie(this.commands);
  }
}
