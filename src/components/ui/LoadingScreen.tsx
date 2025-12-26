import { AppLogo } from "./AppLogo";
import { useEffect, useState } from "react";

export const LoadingScreen = () => {
  const [show, setShow] = useState(true);

  // Optional: Auto-hide after some time or controlled by parent
  // For now, this component assumes it's rendered when loading is needed.

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500">
      <div className="relative">
        {/* Pulsing Effect */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75 duration-1000" />
        
        {/* Logo with Bounce/Spin */}
        <div className="relative z-10 animate-bounce">
          <AppLogo className="h-24 w-24 text-primary" />
        </div>
      </div>
      
      {/* Loading Text */}
      <div className="mt-8 flex items-center gap-2">
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
        Loading Library...
      </p>
    </div>
  );
};
