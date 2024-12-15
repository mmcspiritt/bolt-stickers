// Utility functions for performance optimization

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>): void {
    if (!inThrottle) {
      lastResult = func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export const rafThrottle = <T extends (...args: any[]) => any>(
  callback: T
): ((...args: Parameters<T>) => void) => {
  let requestId: number | null = null;

  return (...args: Parameters<T>) => {
    if (requestId) return;

    requestId = requestAnimationFrame(() => {
      callback(...args);
      requestId = null;
    });
  };
};