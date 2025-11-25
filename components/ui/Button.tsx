import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "font-black uppercase tracking-widest py-4 px-6 rounded-2xl transition-all transform active:translate-y-1 active:border-b-0 focus:outline-none border-b-[6px] text-sm flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-green-500 text-white border-green-700 hover:bg-green-400 shadow-green-100 dark:shadow-none",
    secondary: "bg-blue-400 text-white border-blue-600 hover:bg-blue-300 shadow-blue-100 dark:shadow-none",
    danger: "bg-red-500 text-white border-red-700 hover:bg-red-400 shadow-red-100 dark:shadow-none",
    outline: "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-b-[6px]",
    ghost: "bg-transparent text-gray-400 dark:text-gray-500 border-transparent shadow-none hover:bg-gray-100 dark:hover:bg-gray-800 border-0 active:translate-y-0 active:border-0",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};