const GROUP_ORDER = ['Selection', 'Go to', 'Requests', 'Actions', 'Appearance', 'Console'];

export function rankCommands<T extends { score: number; group: string; order: number }>(results: T[], searching: boolean): T[] {
  const groupOrder = (group: string): number => {
    const index = GROUP_ORDER.indexOf(group);
    return index < 0 ? GROUP_ORDER.length : index;
  };
  return [...results].sort((a, b) =>
    (searching ? b.score - a.score : 0) || groupOrder(a.group) - groupOrder(b.group) || a.order - b.order,
  );
}
