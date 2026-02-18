import type { Interface as ReadlineInterface } from 'node:readline/promises';
import { createCommandsTrie } from './autocomplete';
import { registerCommands, type CommandsMap } from './command';
import { createExeMap, type ExeMap } from './exe';
import type { LastAppendedIndexMap } from './history';
import { createReadlineInterface } from './readline';

export class ShellState {
  readonly commands: CommandsMap = new Map();
  readonly exeMap: ExeMap = new Map();
  readonly lastAppendedIndexByFilePath: LastAppendedIndexMap = new Map();
  readonly rl: ReadlineInterface;

  constructor(prompt: string) {
    this.rl = createReadlineInterface(prompt);
  }

  async initialize() {
    await registerCommands(this.commands);
    createExeMap(this.exeMap);
    createCommandsTrie(this.commands, this.exeMap);
  }
}
