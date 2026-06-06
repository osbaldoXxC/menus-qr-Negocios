interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const variants = {
  primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30',
  secondary: 'bg-green-600 hover:bg-green-700 text-white',
  outline: 'border-2 border-orange-500 text-orange-500 hover:bg-orange-50'
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg'
};

export function Button({ children, variant = 'primary', size = 'md', onClick, type = 'button', className = '' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${variants[variant]} ${sizes[size]} font-semibold rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}