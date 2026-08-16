export type HistoryFilterItem = {
  title: string;
  prompt: string;
  theme: string;
  imageUrl: string;
  isFavorite: boolean;
};

export function getHistoryThemes(items: HistoryFilterItem[]): string[] {
  return Array.from(new Set(items.map((item) => item.theme).filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

export function filterHistoryItems<T extends HistoryFilterItem>(
  items: T[],
  query: string,
  theme: string,
  favoritesOnly: boolean,
): T[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return items.filter((item) => {
    const matchesQuery = !normalizedQuery || [item.title, item.prompt, item.theme, item.imageUrl].some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    const matchesTheme = theme === "all" || item.theme === theme;
    const matchesFavorite = !favoritesOnly || item.isFavorite;
    return matchesQuery && matchesTheme && matchesFavorite;
  });
}
