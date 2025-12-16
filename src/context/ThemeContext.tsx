// POManager/src/context/ThemeContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

// Define the shape of our context
type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

// Create the context with default values
export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

// Custom hook to use the theme easily
export const useThemeContext = () => useContext(ThemeContext);

// The Provider component
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  // Default to system preference
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};