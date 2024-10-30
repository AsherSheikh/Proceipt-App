type AppearanceProvider<T> = () => T;

interface StyleSheetData<N extends string, T, S> {
  styles: Record<N, S>;
  themes: Record<N, T>;
  appearanceProvider: AppearanceProvider<N>;
}

export function registerThemes<N extends string, T, R extends N>(
  themes: Record<N, T>,
  appearanceProvider: AppearanceProvider<R>,
) {
  return <S>(
    createStyles: (theme: T, appearanceProvider?: R) => S,
  ): StyleSheetData<N, T, S> => {
    const styles: any = {};
    for (const [name, theme] of Object.entries(themes)) {
      styles[name] = createStyles(theme as T);
    }
    return { styles, themes, appearanceProvider };
  };
}

export function useTheme<T, N extends string, S>(
  data: StyleSheetData<N, T, S>,
  name?: N,
): [S, T, N] {
  const resolvedName = name || data.appearanceProvider();
  const theme = data.themes[resolvedName];
  const styles = data.styles[resolvedName];

  return [styles, theme, resolvedName];
}
