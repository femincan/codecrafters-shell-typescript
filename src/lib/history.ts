export function getFormattedCmdHistory(
  history: { index: number; value: string }[],
) {
  let formattedHistory = '';

  for (const hObj of history) {
    formattedHistory += `${hObj.index} ${hObj.value}\n`;
  }

  return formattedHistory;
}
