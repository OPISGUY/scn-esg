import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HelpContextType {
  isHelpMode: boolean;
  toggleHelpMode: () => void;
  showTooltip: (id: string, content: string, element: HTMLElement) => void;
  hideTooltip: () => void;
  currentTooltip: {
    id: string;
    content: string;
    position: { x: number; y: number };
  } | null;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

interface HelpProviderProps {
  children: ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [currentTooltip, setCurrentTooltip] = useState<{
    id: string;
    content: string;
    position: { x: number; y: number };
  } | null>(null);

  const toggleHelpMode = () => {
    setIsHelpMode(!isHelpMode);
    if (isHelpMode) {
      setCurrentTooltip(null);
    }
  };

  const showTooltip = (id: string, content: string, element: HTMLElement) => {
    if (!isHelpMode) return;
    
    const rect = element.getBoundingClientRect();
    setCurrentTooltip({
      id,
      content,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      }
    });
  };

  const hideTooltip = () => {
    setCurrentTooltip(null);
  };

  const value = {
    isHelpMode,
    toggleHelpMode,
    showTooltip,
    hideTooltip,
    currentTooltip,
  };

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
};
