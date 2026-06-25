import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variants = {
  primary: 'bg-[#2997FF] text-white hover:bg-[#40A9FF] shadow-md shadow-[#2997FF]/15 hover:shadow-[0_8px_20px_rgba(41,151,255,0.2)]',
  secondary: 'bg-[#1D1D1F] text-[#F5F5F7] hover:bg-[#2D2D2F] border border-white/[0.08]',
  outline: 'border border-[#2997FF]/40 text-[#2997FF] hover:bg-[#2997FF]/8 hover:border-[#2997FF]/60',
  ghost: 'text-[#A1A1A6] hover:text-[#F5F5F7]'
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-[13px] font-500',
  md: 'px-5 py-2.5 text-[14px] font-500',
  lg: 'px-7 py-3 text-[15px] font-600'
};

export function Button({ children, variant = 'primary', size = 'md', onClick, type = 'button', className = '' }: ButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${variants[variant]} ${sizes[size]} rounded-lg transition-all duration-200 outline-none ${className}`}
      whileHover={variant !== 'ghost' ? { y: -1 } : {}}
      whileTap={{ y: 0 }}
    >
      {children}
    </motion.button>
  );
}