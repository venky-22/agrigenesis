
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary',
  size = 'md',
  icon,
  loading = false
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { x, y, id }]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);

    onClick?.();
  };

  const baseClasses = 'relative overflow-hidden font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md text-emerald-300 hover:shadow-2xl hover:bg-emerald-500/30 disabled:opacity-50',
    secondary: 'bg-white/5 backdrop-blur-md text-slate-100 hover:bg-white/10 hover:shadow-xl disabled:opacity-50',
    outline: 'border-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 backdrop-blur-md disabled:opacity-50'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {/* Ripple effect */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Content */}
      {loading ? (
        <i className="fas fa-spinner fa-spin"></i>
      ) : icon ? (
        <i className={`fas ${icon}`}></i>
      ) : null}
      {children}
    </motion.button>
  );
};

export default AnimatedButton;
