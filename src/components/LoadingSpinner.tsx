import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '', 
  label 
}) => {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-2',
    lg: 'w-16 h-16 border-3',
    xl: 'w-24 h-24 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div className="relative">
        <div className={`${sizeMap[size]} rounded-full border-white/5 border-t-brand-purple border-r-brand-orange animate-spin shadow-lg shadow-brand-purple/20`}></div>
        <div className={`absolute inset-0 ${sizeMap[size]} rounded-full border-transparent border-b-brand-purple/30 animate-pulse`}></div>
      </div>
      {label && (
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">
          {label}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
