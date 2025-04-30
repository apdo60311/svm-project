import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const variantClasses = {
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-100 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-100 dark:border-green-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-100 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-100 dark:border-red-800',
  };
  
  const iconMap = {
    info: <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
    success: <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />,
    warning: <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />,
  };

  return (
    <AnimatePresence>
      <motion.div 
        className={`${variantClasses[variant]} border p-4 rounded-md ${className}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex">
          <div className="flex-shrink-0">{iconMap[variant]}</div>
          <div className="ml-3 flex-1">
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            <div className={`text-sm ${title ? 'mt-2' : ''}`}>{children}</div>
          </div>
          {dismissible && (
            <div className="ml-auto pl-3">
              <button
                type="button"
                className="button-hover inline-flex items-center justify-center h-5 w-5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
                onClick={onDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;