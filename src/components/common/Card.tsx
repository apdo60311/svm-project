import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'default' | 'bordered' | 'flat';
  className?: string;
  titleAction?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  variant = 'default',
  className = '',
  titleAction
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900 shadow-sm dark:shadow-gray-900/30',
    bordered: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    flat: 'bg-white dark:bg-gray-900'
  };

  return (
    <motion.div 
      className={`${variantClasses[variant]} card-hover rounded-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {title && (
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          {titleAction && <div>{titleAction}</div>}
        </div>
      )}
      <div className={`px-4 py-4 ${title ? '' : 'pt-5'}`}>{children}</div>
    </motion.div>
  );
};

export default Card;