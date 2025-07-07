import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle } from 'lucide-react';
import { useHelp } from '../contexts/HelpContext';

interface HelpTooltipProps {
  id: string;
  content: string;
  children: React.ReactElement;
}

const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  id, 
  content, 
  children
}) => {
  const { isHelpMode, showTooltip, hideTooltip } = useHelp();
  const elementRef = useRef<HTMLElement>(null);

  const handleMouseEnter = () => {
    if (isHelpMode && elementRef.current) {
      showTooltip(id, content, elementRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (isHelpMode) {
      hideTooltip();
    }
  };

  const clonedChild = React.cloneElement(children, {
    ref: elementRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    className: `${children.props.className || ''} ${
      isHelpMode ? 'help-highlight cursor-help relative' : ''
    }`,
  });

  return (
    <>
      {clonedChild}
      {isHelpMode && (
        <div className="absolute top-0 right-0 p-1">
          <HelpCircle className="h-4 w-4 text-blue-500 animate-pulse" />
        </div>
      )}
    </>
  );
};

// Global tooltip portal
export const HelpTooltipPortal: React.FC = () => {
  const { currentTooltip, hideTooltip } = useHelp();

  if (!currentTooltip) return null;

  return createPortal(
    <div
      className="fixed z-50 max-w-xs p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg border border-gray-700"
      style={{
        left: currentTooltip.position.x,
        top: currentTooltip.position.y - 10,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p>{currentTooltip.content}</p>
        </div>
        <button
          onClick={hideTooltip}
          className="ml-2 text-gray-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div
        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
      />
    </div>,
    document.body
  );
};

export default HelpTooltip;
