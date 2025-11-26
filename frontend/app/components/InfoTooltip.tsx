'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
}

export default function InfoTooltip({ 
  content, 
  position = 'top',
  maxWidth = '300px'
}: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: -9999,
    left: -9999,
    visibility: 'hidden',
    zIndex: 99999,
  });
  const [arrowStyle, setArrowStyle] = useState<React.CSSProperties>({});
  const [effectivePos, setEffectivePos] = useState(position);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current || !tooltipRef.current) return;
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 10;
    const margin = 16;

    let top = 0;
    let left = 0;
    let newEffectivePosition = position;

    // Check available space
    const spaceAbove = buttonRect.top;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    const tooltipHeight = tooltipRect.height || 60; // fallback estimate

    // Flip logic - prefer showing where there's more space
    if (position === 'top' && spaceAbove < tooltipHeight + gap + margin) {
      newEffectivePosition = 'bottom';
    } else if (position === 'bottom' && spaceBelow < tooltipHeight + gap + margin) {
      newEffectivePosition = 'top';
    }

    // Calculate position based on effective position
    if (newEffectivePosition === 'top') {
      top = buttonRect.top - tooltipHeight - gap;
      left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;
    } else if (newEffectivePosition === 'bottom') {
      top = buttonRect.bottom + gap;
      left = buttonRect.left + buttonRect.width / 2 - tooltipRect.width / 2;
    } else if (newEffectivePosition === 'left') {
      top = buttonRect.top + buttonRect.height / 2 - tooltipRect.height / 2;
      left = buttonRect.left - tooltipRect.width - gap;
    } else if (newEffectivePosition === 'right') {
      top = buttonRect.top + buttonRect.height / 2 - tooltipRect.height / 2;
      left = buttonRect.right + gap;
    }

    // Horizontal clamping
    const originalLeft = left;
    if (left < margin) {
      left = margin;
    } else if (left + tooltipRect.width > viewportWidth - margin) {
      left = viewportWidth - margin - tooltipRect.width;
    }

    // Vertical clamping
    if (top < margin) {
      top = margin;
    } else if (top + tooltipRect.height > viewportHeight - margin) {
      top = viewportHeight - margin - tooltipRect.height;
    }

    // Arrow offset calculation
    const arrowShift = originalLeft - left;

    setEffectivePos(newEffectivePosition);
    
    setTooltipStyle({
      position: 'fixed',
      top,
      left,
      maxWidth: `min(${maxWidth}, calc(100vw - 32px))`,
      zIndex: 99999,
      visibility: 'visible',
      opacity: 1,
    });

    // Arrow positioning
    let arrowPos: React.CSSProperties = {};
    if (newEffectivePosition === 'top') {
      arrowPos = {
        bottom: -5,
        left: '50%',
        transform: `translateX(-50%) translateX(${arrowShift}px) rotate(45deg)`,
      };
    } else if (newEffectivePosition === 'bottom') {
      arrowPos = {
        top: -5,
        left: '50%',
        transform: `translateX(-50%) translateX(${arrowShift}px) rotate(45deg)`,
      };
    } else if (newEffectivePosition === 'left') {
      arrowPos = {
        right: -5,
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
      };
    } else if (newEffectivePosition === 'right') {
      arrowPos = {
        left: -5,
        top: '50%',
        transform: 'translateY(-50%) rotate(45deg)',
      };
    }
    setArrowStyle(arrowPos);
  }, [position, maxWidth]);

  // Position calculation with RAF for smooth updates
  useEffect(() => {
    if (!isVisible || !mounted) return;

    // Use double RAF to ensure DOM is painted
    let rafId: number;
    const scheduleUpdate = () => {
      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          calculatePosition();
        });
      });
    };

    scheduleUpdate();

    // Also update on scroll/resize
    const handleUpdate = () => scheduleUpdate();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isVisible, mounted, calculatePosition]);

  // Click outside handler
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current && 
        !buttonRef.current.contains(target) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(target)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible]);

  const handleToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(prev => !prev);
  };

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setIsVisible(false);
    }
  };

  // Arrow border classes based on position
  const getArrowBorderClass = () => {
    switch (effectivePos) {
      case 'top': return 'border-r border-b border-gray-700/50';
      case 'bottom': return 'border-l border-t border-gray-700/50';
      case 'left': return 'border-t border-r border-gray-700/50';
      case 'right': return 'border-b border-l border-gray-700/50';
      default: return '';
    }
  };

  return (
    <span className="inline-flex items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex items-center justify-center w-5 h-5 ml-1 text-gray-400 hover:text-[#49997E] transition-colors duration-200 cursor-help"
        aria-label="More information"
        aria-expanded={isVisible}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      
      {mounted && isVisible && createPortal(
        <div 
          ref={tooltipRef}
          role="tooltip"
          className="bg-gray-900 text-white text-xs sm:text-sm leading-relaxed rounded-lg py-2.5 px-3.5 shadow-2xl border border-gray-700/50 w-max transition-opacity duration-150"
          style={tooltipStyle}
        >
          {content}
          <div 
            className={`absolute w-2.5 h-2.5 bg-gray-900 ${getArrowBorderClass()}`}
            style={arrowStyle}
          />
        </div>,
        document.body
      )}
    </span>
  );
}
