import React from "react";

export const AppLogo = ({ className = "h-8 w-8" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full text-primary animate-pulse-subtle"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        
        {/* Book Cover / Outline */}
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" className="stroke-current" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" className="stroke-current" />
        
        {/* Animated Pages */}
        <g className="origin-left">
           <path 
             d="M6 4h12" 
             className="stroke-current opacity-70 animate-[flip_3s_ease-in-out_infinite]" 
             style={{ transformOrigin: "6px 4px" }}
           />
           <path 
             d="M6 8h12" 
             className="stroke-current opacity-70 animate-[flip_3s_ease-in-out_infinite_0.2s]" 
             style={{ transformOrigin: "6px 8px" }}
           />
           <path 
             d="M6 12h8" 
             className="stroke-current opacity-70 animate-[flip_3s_ease-in-out_infinite_0.4s]" 
             style={{ transformOrigin: "6px 12px" }}
           />
        </g>

        {/* Dynamic M for Manga */}
        <path d="M12 16l2 3 2-3" className="stroke-current fill-none" />
      </svg>
      <style>{`
        @keyframes flip {
          0%, 100% { transform: scaleX(1); opacity: 0.7; }
          50% { transform: scaleX(0.1); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};
