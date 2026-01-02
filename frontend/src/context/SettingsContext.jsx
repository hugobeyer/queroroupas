import React, { createContext, useContext } from 'react';
import { useSettings } from '../hooks/useSettings';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const { settings, loading } = useSettings();

  // Apply CSS variables when settings change
  React.useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--color-primary', settings.color_primary);
      document.documentElement.style.setProperty('--color-secondary', settings.color_secondary);
      document.documentElement.style.setProperty('--color-background', settings.color_background);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return context;
};
