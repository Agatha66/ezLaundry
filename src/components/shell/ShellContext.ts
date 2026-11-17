import { createContext, useContext } from 'react';

export interface ShellContextValue {
  /** Opens the New Order sheet/dialog (customers only; no-op otherwise). */
  openNewOrder: () => void;
}

export const ShellContext = createContext<ShellContextValue>({ openNewOrder: () => {} });

export const useShell = () => useContext(ShellContext);
