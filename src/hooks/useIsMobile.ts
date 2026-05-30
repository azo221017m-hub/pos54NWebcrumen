import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

const checkIsMobile = (): boolean =>
  /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  window.innerWidth <= MOBILE_BREAKPOINT;

/**
 * Returns true when the current device/viewport is considered mobile.
 * Updates reactively when the window is resized.
 */
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() => checkIsMobile());

  useEffect(() => {
    const handleResize = () => setIsMobile(checkIsMobile());
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

export default useIsMobile;
