'use client';

import { useState, useRef, useEffect } from 'react';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
}

export default function InfoTooltip({ 
  content, 
  position = 'top',
  maxWidth = '400px'
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3'
  };

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(!isVisible);
  };

  const handleMouseEnter = () => {
    // Only activate hover on non-touch devices
    if (!('ontouchstart' in window)) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!('ontouchstart' in window)) {
      setIsVisible(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onTouchStart={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center justify-center w-5 h-5 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 sm:w-4 sm:h-4 ml-1.5 text-gray-400 hover:text-[#49997E] active:text-[#49997E] transition-all duration-200 cursor-help hover:scale-110 active:scale-95 touch-manipulation"
        aria-label="More information"
        aria-expanded={isVisible}
      >
        <svg 
          className="w-4 h-4" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`fixed sm:absolute z-[100] ${positionClasses[position]} 
            left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0
            max-w-[90vw] sm:max-w-none
            animate-in fade-in duration-200`}
          style={{ maxWidth: `min(${maxWidth}, 90vw)` }}
          role="tooltip"
        >
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white text-caption rounded-lg py-2 px-3.5 shadow-2xl border border-gray-700/50 backdrop-blur-sm">
            <div className="relative leading-snug">
              {content}
            </div>
            {/* Decorative corner accent */}
            <div className="absolute top-0 right-0 w-10 h-10 bg-gradient-to-br from-[#49997E]/20 to-transparent rounded-lg pointer-events-none"></div>
            {/* Arrow - hidden on mobile for fixed positioning */}
            <div 
              className={`hidden sm:block absolute w-2.5 h-2.5 bg-gray-900 transform rotate-45 border ${
                position === 'top' 
                  ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b border-gray-700/50' 
                  : position === 'bottom' 
                  ? 'top-[-5px] left-1/2 -translate-x-1/2 border-l border-t border-gray-700/50'
                  : position === 'left' 
                  ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r border-t border-gray-700/50'
                  : 'left-[-5px] top-1/2 -translate-y-1/2 border-l border-b border-gray-700/50'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
