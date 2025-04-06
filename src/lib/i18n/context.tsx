import { createContext, useContext } from 'react';
import { translations } from './translations';

interface I18nContextType {
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const t = (path: string) => {
    const keys = path.split('.');
    let value: any = translations;
    
    for (const key of keys) {
      if (value === undefined) return path;
      value = value[key];
    }
    
    return value || path;
  };

  return (
    <I18nContext.Provider value={{ t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
