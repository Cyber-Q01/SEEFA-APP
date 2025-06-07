import React, { createContext, useContext, ReactNode } from 'react';
import { appTheme } from '../config/theme';

const ThemeContext = createContext({
  theme: appTheme,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ThemeContext.Provider value={{ theme: appTheme }}>
    {children}
  </ThemeContext.Provider>
);

export const useThemeMode = () => useContext(ThemeContext);
