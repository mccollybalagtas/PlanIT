import { useState } from 'react';

const sizes = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-20 w-20 text-3xl',
};

export function Logo3D({ size = 'sm', showName = false, className = '' }) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass = sizes[size] || sizes.sm;

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`relative inline-flex shrink-0 items-center justify-center bg-transparent transition-[filter,transform] duration-500 hover:[transform:perspective(500px)_rotateX(8deg)_rotateY(-12deg)_translateY(-2px)] hover:drop-shadow-[0_10px_14px_rgba(124,58,237,0.6)] ${sizeClass}`}
      >
        {!imageFailed && (
          <img
            src="/mc-logo.svg"
            alt="MC logo"
            className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_5px_7px_rgba(76,29,149,0.55)]"
            onError={() => setImageFailed(true)}
          />
        )}
        {imageFailed && (
          <span className="relative font-black italic tracking-[-0.12em] text-transparent [text-shadow:2px_3px_0_#17105d,4px_5px_0_#09052b] bg-gradient-to-br from-indigo-300 via-fuchsia-400 to-violet-700 bg-clip-text">
            MC
          </span>
        )}
      </span>
      {showName && <span className="font-bold tracking-[0.2em] text-white">PLANIT</span>}
    </span>
  );
}
