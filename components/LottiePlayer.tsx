
import React, { useEffect, useRef, useState, memo } from 'react';

interface LottiePlayerProps {
  url: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  animationData?: any;
  isSticker?: boolean; 
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({ 
  url, 
  loop = true, 
  autoplay = true, 
  className = "", 
  animationData,
  isSticker = true 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const animRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadLottie = async () => {
      setIsLoading(true);
      setHasError(false);

      if (!url && !animationData) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        const lottie = (await import('lottie-web')).default;
        
        if (containerRef.current && isMounted) {
          if (animRef.current) animRef.current.destroy();

          animRef.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay,
            path: animationData ? undefined : url,
            animationData: animationData,
            rendererSettings: {
              preserveAspectRatio: 'xMidYMid slice',
              className: 'lottie-svg-element'
            }
          });

          animRef.current.addEventListener('data_failed', () => {
            if (isMounted) setHasError(true);
          });

          animRef.current.addEventListener('error', () => {
            if (isMounted) setHasError(true);
          });

          animRef.current.addEventListener('DOMLoaded', () => {
            if (isMounted) {
              setHasError(false);
              setIsLoading(false);
            }
          });

          // Timeout de seguridad para la carga
          setTimeout(() => {
            if (isMounted && isLoading) {
              // Si después de 5 segundos sigue cargando, asumimos problema de red lento
              // pero no forzamos error a menos que falle explícitamente
            }
          }, 5000);
        }
      } catch (error) {
        console.warn("Lottie loading failed:", error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };

    loadLottie();
    
    return () => {
      isMounted = false;
      if (animRef.current) animRef.current.destroy();
    };
  }, [url, animationData, loop, autoplay]);

  // Si hay error, mostramos un sticker de emoji amigable como respaldo
  if (hasError) {
    const fallbackEmoji = url.includes('confetti') ? '🎉' : 
                         url.includes('star') ? '⭐' : 
                         url.includes('mascot') ? '🐶' : 
                         url.includes('clouds') ? '☁️' : '✨';
    
    return (
      <div 
        className={`${className} flex items-center justify-center`}
        style={{ minHeight: '100px' }}
      >
        <div className="bg-white/80 p-8 rounded-full shadow-2xl border-4 border-yellow-200 animate-bounce text-7xl flex items-center justify-center lottie-sticker">
          {fallbackEmoji}
        </div>
      </div>
    );
  }

  const drawingClasses = `lottie-2d-drawing ${isSticker ? 'lottie-sticker' : ''}`;

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
      <div 
        ref={containerRef} 
        className={`${className} ${drawingClasses} outline-none flex items-center justify-center w-full h-full`} 
      />
    </div>
  );
};

export default memo(LottiePlayer);
