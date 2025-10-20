// Accessibility utility functions for TIES Together platform

// Screen reader announcements
export const announceToScreenReader = (message) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management
export const trapFocus = (element) => {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      element.querySelector('[data-close]')?.click();
    }
  };
  
  element.addEventListener('keydown', handleTabKey);
  firstElement?.focus();
  
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
};

// Skip link functionality
export const createSkipLink = () => {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 1000;
    border-radius: 4px;
    transition: top 0.3s;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  return skipLink;
};

// Color contrast checker
export const checkColorContrast = (foreground, background) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  
  if (!fg || !bg) return null;
  
  const l1 = getLuminance(fg);
  const l2 = getLuminance(bg);
  
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio: ratio.toFixed(2),
    aa: ratio >= 4.5,
    aaa: ratio >= 7,
    aaLarge: ratio >= 3
  };
};

// Keyboard navigation helpers
export const addKeyboardNavigation = (element, options = {}) => {
  const {
    onEnter = () => {},
    onSpace = () => {},
    onArrowUp = () => {},
    onArrowDown = () => {},
    onArrowLeft = () => {},
    onArrowRight = () => {},
    onEscape = () => {}
  } = options;
  
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        onEnter(e);
        break;
      case ' ':
        e.preventDefault();
        onSpace(e);
        break;
      case 'ArrowUp':
        e.preventDefault();
        onArrowUp(e);
        break;
      case 'ArrowDown':
        e.preventDefault();
        onArrowDown(e);
        break;
      case 'ArrowLeft':
        onArrowLeft(e);
        break;
      case 'ArrowRight':
        onArrowRight(e);
        break;
      case 'Escape':
        onEscape(e);
        break;
    }
  };
  
  element.addEventListener('keydown', handleKeyDown);
  
  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
};

// ARIA live region manager
export class LiveRegionManager {
  constructor() {
    this.regions = new Map();
    this.createRegions();
  }
  
  createRegions() {
    // Polite region for non-urgent updates
    const politeRegion = document.createElement('div');
    politeRegion.setAttribute('aria-live', 'polite');
    politeRegion.setAttribute('aria-atomic', 'true');
    politeRegion.className = 'sr-only';
    politeRegion.id = 'live-region-polite';
    document.body.appendChild(politeRegion);
    this.regions.set('polite', politeRegion);
    
    // Assertive region for urgent updates
    const assertiveRegion = document.createElement('div');
    assertiveRegion.setAttribute('aria-live', 'assertive');
    assertiveRegion.setAttribute('aria-atomic', 'true');
    assertiveRegion.className = 'sr-only';
    assertiveRegion.id = 'live-region-assertive';
    document.body.appendChild(assertiveRegion);
    this.regions.set('assertive', assertiveRegion);
  }
  
  announce(message, priority = 'polite') {
    const region = this.regions.get(priority);
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }
}

// High contrast mode detection
export const detectHighContrastMode = () => {
  // Create a test element to detect high contrast mode
  const testElement = document.createElement('div');
  testElement.style.cssText = `
    position: absolute;
    top: -9999px;
    width: 1px;
    height: 1px;
    background-color: rgb(31, 31, 31);
    border: 1px solid rgb(255, 255, 255);
  `;
  
  document.body.appendChild(testElement);
  
  const computedStyle = window.getComputedStyle(testElement);
  const isHighContrast = computedStyle.backgroundColor === computedStyle.borderColor;
  
  document.body.removeChild(testElement);
  
  return isHighContrast;
};

// Reduced motion detection
export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Focus visible polyfill
export const initFocusVisible = () => {
  let hadKeyboardEvent = true;
  
  const keyboardThrottleTimeout = 100;
  let keyboardThrottleTimeoutID = 0;
  
  const pointerInitialPress = (e) => {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }
    hadKeyboardEvent = false;
  };
  
  const onKeyDown = (e) => {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }
    hadKeyboardEvent = true;
  };
  
  const onPointerDown = () => {
    hadKeyboardEvent = false;
  };
  
  const onFocus = (e) => {
    if (hadKeyboardEvent || e.target.matches(':focus-visible')) {
      e.target.classList.add('focus-visible');
    }
  };
  
  const onBlur = (e) => {
    e.target.classList.remove('focus-visible');
  };
  
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('mousedown', onPointerDown, true);
  document.addEventListener('pointerdown', pointerInitialPress, true);
  document.addEventListener('touchstart', onPointerDown, true);
  document.addEventListener('focus', onFocus, true);
  document.addEventListener('blur', onBlur, true);
};

