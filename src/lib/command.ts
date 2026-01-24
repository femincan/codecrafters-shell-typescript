type CommandName = string;
type CommandFunction = (rest: string) => void;

export const commandsMap = new Map<CommandName, CommandFunction>();

export function createCommand(name: CommandName, func: CommandFunction) {
  commandsMap.set(name, func);
}
