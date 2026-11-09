
import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string;
  height?: string;
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width = '100%',
  height = '1rem'
}) => {
  const baseClasses = 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-shimmer';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="60%" height="1rem" />
          <SkeletonLoader width="40%" height="0.875rem" />
        </div>
      </div>
      <SkeletonLoader height="4rem" />
      <div className="flex gap-2">
        <SkeletonLoader width="48%" height="2.5rem" />
        <SkeletonLoader width="48%" height="2.5rem" />
      </div>
    </div>
  );
};

export const SkeletonChart: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse">
      <SkeletonLoader width="40%" height="1.5rem" className="mb-4" />
      <SkeletonLoader height="200px" variant="rectangular" />
    </div>
  );
};

export default SkeletonLoader;
