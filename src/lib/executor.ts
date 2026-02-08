import { runExe } from './exe';
import type { ParseInputResult } from './input';
import type { ShellState } from './shell';

export async function executeCommand(
  { command, args }: ParseInputResult,
  state: ShellState,
) {
  const commandFunction = state.commands.get(command);

  if (commandFunction) {
    return commandFunction(args, state);
  } else {
    return await runExe(command, args);
  }
}
