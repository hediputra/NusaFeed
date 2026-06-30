import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NextGenImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export default function NextGenImage({
  src,
  alt,
  fallbackSrc,
  className,
  loading = 'lazy',
  ...props
}: NextGenImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Derive low-res source for blur-up effect (ideal for Unsplash images)
  const getLowResUrl = (url: string) => {
    if (url.includes('unsplash.com')) {
      // Modify URL parameters to request a tiny 20px blurred thumbnail
      return url
        .replace(/w=\d+/, 'w=24')
        .replace(/q=\d+/, 'q=10')
        .replace(/fit=crop/, 'fit=crop&blur=5');
    }
    // Return a lightweight inline SVG placeholder if not an Unsplash URL
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="15" viewBox="0 0 24 15"><rect width="100%" height="100%" fill="%23e2e8f0"/></svg>';
  };

  const lowResSrc = getLowResUrl(currentSrc);

  useEffect(() => {
    // Reset load state when source changes
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(src);
  }, [src]);

  // Preload the high-res image in the background
  useEffect(() => {
    const img = new Image();
    img.src = currentSrc;
    img.onload = () => {
      setIsLoaded(true);
    };
    img.onerror = () => {
      if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
        setHasError(true);
        setCurrentSrc(fallbackSrc);
      } else {
        setIsLoaded(true); // Stop loading indicator even on failure
      }
    };
  }, [currentSrc, fallbackSrc, hasError]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Low-res background / placeholder image (blurred-up) */}
      {!isLoaded && (
        <img
          src={lowResSrc}
          alt={alt}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105 transition-opacity duration-500"
          style={{ opacity: isLoaded ? 0 : 1 }}
        />
      )}

      {/* Shimmer loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
             style={{ backgroundSize: '200% 100%' }} />
      )}

      {/* High-res image */}
      <motion.img
        src={currentSrc}
        alt={alt}
        loading={loading}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full h-full object-cover"
        {...props}
      />
    </div>
  );
}
