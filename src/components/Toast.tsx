'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styles = {
  success: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    progress: 'bg-emerald-400',
  },
  error: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/30',
    icon: 'text-red-400',
    progress: 'bg-red-400',
  },
  info: {
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    progress: 'bg-blue-400',
  },
};

export default function Toast({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type];
  const style = styles[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4`}
        >
          <div
            className={`${style.bg} backdrop-blur-xl border ${style.border} p-4 rounded-2xl flex items-start gap-3 shadow-2xl relative overflow-hidden`}
          >
            <Icon className={`w-6 h-6 ${style.icon} flex-shrink-0 mt-0.5`} />
            <div className="flex-grow min-w-0">
              <p className="font-bold text-white text-sm">{title}</p>
              {message && (
                <p className="text-xs text-gray-300 mt-0.5">{message}</p>
              )}
            </div>
            <button
              onClick={() => {
                setVisible(false);
                setTimeout(() => onClose?.(), 300);
              }}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>

            {/* Auto-dismiss progress bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className={`absolute bottom-0 left-0 right-0 h-0.5 ${style.progress} origin-left`}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
