import { useEffect } from 'react';
import { useToast } from '@/context/AppContext';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col gap-3" aria-live="polite">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-[#059669]',
    error: 'bg-[#dc2626]',
    warning: 'bg-[#d97706]',
    info: 'bg-brand',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`${bgColors[toast.type] || bgColors.info} text-white py-3 px-5 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] animate-[fadeInUp_0.3s_ease-out] text-[14px] font-medium`}
      role="alert"
    >
      <span className="text-[16px] font-bold">{icons[toast.type] || icons.info}</span>
      <span className="flex-1">{toast.message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white text-[18px] font-bold border-none bg-transparent cursor-pointer">
        ×
      </button>
    </div>
  );
}
