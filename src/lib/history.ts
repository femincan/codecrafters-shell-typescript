export const commandHistory: string[] = [];

export function getFormattedCmdHistory() {
  let formattedHistory = '';

  for (let i = 0; i < commandHistory.length; i++) {
    formattedHistory += `${i + 1} ${commandHistory[i]}\n`;
  }

  return formattedHistory;
}
