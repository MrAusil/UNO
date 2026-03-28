'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-white/70 font-body">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30',
              'px-4 py-3 text-sm font-body',
              'focus:outline-none focus:border-white/30 focus:bg-white/8',
              'transition-all duration-200',
              icon && 'pl-10',
              error && 'border-red-500/50 focus:border-red-400',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-400 font-body">{error}</p>}
        {hint && !error && (
          <p className="text-xs text-white/40 font-body">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
