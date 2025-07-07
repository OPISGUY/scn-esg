import React from 'react';
import { HelpCircle, X } from 'lucide-react';
import { useHelp } from '../contexts/HelpContext';

const HelpButton: React.FC = () => {
  const { isHelpMode, toggleHelpMode } = useHelp();

  return (
    <button
      onClick={toggleHelpMode}
      className={`fixed bottom-6 right-6 z-40 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-105 ${
        isHelpMode
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
      title={isHelpMode ? 'Exit Help Mode' : 'Enter Help Mode'}
    >
      {isHelpMode ? (
        <X className="h-6 w-6" />
      ) : (
        <HelpCircle className="h-6 w-6" />
      )}
      
      {/* Help mode indicator */}
      {isHelpMode && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm whitespace-nowrap">
          Help Mode Active
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-blue-600" />
        </div>
      )}
    </button>
  );
};

export default HelpButton;
