import { useEffect, useCallback } from 'react';

/**
 * Reusable Modal component
 * @param {{ isOpen, onClose, title, children, maxWidth }} props
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = '420px' }) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-white rounded-xl p-8 w-full mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)]" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
