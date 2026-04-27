/**
 * useScrollRestore.js — Scroll to top on route change
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useScrollRestore() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
}
