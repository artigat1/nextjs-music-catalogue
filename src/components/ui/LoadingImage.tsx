'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface LoadingImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
    containerClassName?: string;
}

export default function LoadingImage({
    src,
    alt,
    className = '',
    containerClassName = '',
    ...props
}: LoadingImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={`relative overflow-hidden ${containerClassName}`}>
            {/* Loading Skeleton/Placeholder */}
            {isLoading && (
                <div className="absolute inset-0 bg-surface/50 animate-pulse flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 bg-surface flex items-center justify-center z-10 text-foreground/50 text-sm p-2 text-center border border-accent/20">
                    <span className="text-xs">Image not available</span>
                </div>
            )}

            <Image
                src={src}
                alt={alt}
                className={`
                    transition-all duration-500 ease-in-out
                    ${isLoading ? 'scale-105 blur-lg opacity-0' : 'scale-100 blur-0 opacity-100'}
                    ${className}
                `}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setIsLoading(false);
                    setError(true);
                }}
                loading="lazy" // Explicitly set lazy loading (default in Next.js)
                {...props}
            />
        </div>
    );
}
