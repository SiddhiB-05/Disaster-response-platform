import React from 'react';

export default function Marquee({
  children,
  speed = 35,
  className = '',
  pauseOnHover = true,
}) {
  return (
    <div
      className={`relative overflow-hidden w-full select-none ${className}`}
      tabIndex={0}
      role="region"
      aria-label="Live updates ticker"
    >
      <div
        className="flex w-max items-center marquee-track"
        style={{
          '--duration': `${speed}s`,
        }}
      >
        <div className="flex items-center shrink-0 animate-marquee-continuous">
          {children}
        </div>
        <div
          className="flex items-center shrink-0 animate-marquee-continuous"
          aria-hidden="true"
        >
          {children}
        </div>
      </div>

      <style>{`
        @keyframes marquee-continuous {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-100%, 0, 0);
          }
        }

        .animate-marquee-continuous {
          animation: marquee-continuous var(--duration) linear infinite;
        }

        .marquee-track:hover .animate-marquee-continuous,
        .marquee-track:focus-within .animate-marquee-continuous {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-continuous {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
