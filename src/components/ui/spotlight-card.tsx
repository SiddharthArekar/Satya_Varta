import React, { useEffect, useRef, ReactNode, useCallback, useState } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  height?: string | number;
  customSize?: boolean; // When true, ignores size prop and uses width/height or className
  onClick?: () => void;
  enableGlow?: boolean; // New prop to control glow effect
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 }
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96'
};

const GlowCard: React.FC<GlowCardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'blue',
  size = 'md',
  width,
  height,
  customSize = false,
  onClick,
  enableGlow = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Throttled pointer move handler for better performance
  const syncPointer = useCallback((e: PointerEvent) => {
    if (!cardRef.current || !enableGlow || !isHovered || !isVisible) return;
    
    const { clientX: x, clientY: y } = e;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Only update if pointer is near the card
    const distance = Math.sqrt(
      Math.pow(x - (rect.left + rect.width / 2), 2) + 
      Math.pow(y - (rect.top + rect.height / 2), 2)
    );
    
    if (distance < 400) { // Only update if within 400px of card
      cardRef.current.style.setProperty('--x', x.toFixed(2));
      cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty('--y', y.toFixed(2));
      cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
    }
  }, [enableGlow, isHovered, isVisible]);

  // Use intersection observer to only enable effects for visible cards
  useEffect(() => {
    if (!cardRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(cardRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Only add pointer move listener when card is hovered and visible
  useEffect(() => {
    if (!enableGlow || !isHovered || !isVisible) return;

    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, [syncPointer, enableGlow, isHovered, isVisible]);

  const { base, spread } = glowColorMap[glowColor];

  // Determine sizing
  const getSizeClasses = () => {
    if (customSize) {
      return ''; // Let className or inline styles handle sizing
    }
    return sizeMap[size];
  };

  const getInlineStyles = () => {
    const baseStyles: React.CSSProperties = {
      '--base': base,
      '--spread': spread,
      '--radius': '14',
      '--border': '2', // Reduced border for better performance
      '--backdrop': 'hsl(0 0% 60% / 0.08)', // Reduced opacity for better performance
      '--backup-border': 'var(--backdrop)',
      '--size': '150', // Reduced size for better performance
      '--outer': '1',
      '--border-size': 'calc(var(--border, 2) * 1px)',
      '--spotlight-size': 'calc(var(--size, 150) * 1px)',
      '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
      position: 'relative',
      touchAction: 'none',
    };

    // Only add glow effects if enabled and card is hovered
    if (enableGlow && isHovered && isVisible) {
      baseStyles.backgroundImage = `radial-gradient(
        var(--spotlight-size) var(--spotlight-size) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / 0.08),
        transparent
      )`;
      baseStyles.backgroundColor = 'var(--backdrop, transparent)';
      baseStyles.backgroundSize = 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))';
      baseStyles.backgroundPosition = '50% 50%';
      baseStyles.backgroundAttachment = 'fixed';
      baseStyles.border = 'var(--border-size) solid var(--backup-border)';
    } else {
      // Static styles when glow is disabled
      baseStyles.backgroundColor = 'hsl(0 0% 60% / 0.05)';
      baseStyles.border = '1px solid hsl(0 0% 60% / 0.1)';
    }

    // Add width and height if provided
    if (width !== undefined) {
      baseStyles.width = typeof width === 'number' ? `${width}px` : width;
    }
    if (height !== undefined) {
      baseStyles.height = typeof height === 'number' ? `${height}px` : height;
    }

    return baseStyles;
  };

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)),
        transparent 100%
      );
      filter: brightness(2);
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / var(--border-light-opacity, 1)),
        transparent 100%
      );
    }
    
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
      border: none;
    }
    
    [data-glow] > [data-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      {enableGlow && isHovered && isVisible && (
        <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      )}
      <div
        ref={cardRef}
        data-glow={enableGlow && isHovered && isVisible}
        style={getInlineStyles()}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          ${getSizeClasses()}
          ${!customSize ? 'aspect-[3/4]' : ''}
          rounded-2xl 
          relative 
          grid 
          grid-rows-[1fr_auto] 
          shadow-[0_1rem_2rem_-1rem_black] 
          p-4 
          gap-4 
          backdrop-blur-[5px]
          transition-all duration-300 ease-out
          ${className}
        `}
      >
        {enableGlow && isHovered && isVisible && <div ref={innerRef} data-glow></div>}
        {children}
      </div>
    </>
  );
};

export { GlowCard }
