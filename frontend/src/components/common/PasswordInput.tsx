import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  leftIcon?: React.ReactNode | null;
  containerClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      hasError = false,
      leftIcon = <Lock className="w-4 h-4 text-[#747B87]" />,
      containerClassName = '',
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={`relative flex items-center ${containerClassName}`}>
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-[#747B87]">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          className={`w-full ${
            leftIcon ? 'pl-10' : 'pl-4'
          } pr-11 py-3 bg-[#111418] text-[#F5F7FA] placeholder:text-[#747B87] border ${
            hasError
              ? 'border-rose-500/70 bg-rose-950/20 focus:border-rose-500'
              : 'border-[#252A31] focus:border-[#6366F1]'
          } rounded-xl text-sm focus:outline-none focus:ring-1 ${
            hasError ? 'focus:ring-rose-500/40' : 'focus:ring-[#6366F1]/50'
          } transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          {...props}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={0}
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-[#747B87] hover:text-[#F5F7FA] rounded-lg transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:text-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {showPassword ? (
            <EyeOff className="w-[18px] h-[18px]" aria-hidden="true" />
          ) : (
            <Eye className="w-[18px] h-[18px]" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
