import { useState } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = '', size = 20 }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <span 
        style={{ fontSize: size }} 
        className={`leading-none select-none inline-block ${className}`}
      >
        🌮
      </span>
    );
  }

  return (
    <img
      src="/favicon.svg"
      alt="MexxicanMX"
      width={size}
      height={size}
      className={`inline-block object-contain select-none ${className}`}
      onError={() => setError(true)}
    />
  );
}
