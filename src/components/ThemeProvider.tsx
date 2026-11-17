import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useLocation } from 'react-router-dom';

const LIGHT_ONLY_ROUTES = ['/', '/login', '/register'];

/** App-wide theme. Public pages (landing, login, register) are always light. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const forced = LIGHT_ONLY_ROUTES.includes(pathname) ? 'light' : undefined;

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme={forced}
      storageKey="ezl-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from 'next-themes';
