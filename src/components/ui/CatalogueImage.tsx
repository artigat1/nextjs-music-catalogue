'use client';

import Image, { ImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getBlob, ref } from 'firebase/storage';
import { storage } from '@/firebase/config';
import { isFirebaseStorageUrl } from '@/firebase/storage';

function StorageImage({ src, ...props }: ImageProps & { src: string }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const eager = props.loading === 'eager' || props.preload === true;

    useEffect(() => {
        let active = true;
        let objectUrl: string | undefined;
        const download = () => {
            getBlob(ref(storage, src)).then((blob) => {
                if (!active) return;
                objectUrl = URL.createObjectURL(blob);
                setImageUrl(objectUrl);
            }).catch(() => {
                if (active) setImageUrl('data:,');
            });
        };
        let observer: IntersectionObserver | undefined;
        if (!eager && imageRef.current && typeof IntersectionObserver !== 'undefined') {
            observer = new IntersectionObserver((entries) => {
                if (entries.some(entry => entry.isIntersecting)) {
                    observer?.disconnect();
                    download();
                }
            }, { rootMargin: '200px' });
            observer.observe(imageRef.current);
        } else {
            download();
        }
        return () => {
            active = false;
            observer?.disconnect();
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [src, eager]);

    return <Image
        {...props}
        ref={imageRef}
        src={imageUrl ?? 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
        alt={props.alt}
        onLoad={imageUrl ? props.onLoad : undefined}
        onError={imageUrl ? props.onError : undefined}
        unoptimized
    />;
}

export default function CatalogueImage({ src, ...props }: ImageProps) {
    if (typeof src === 'string' && isFirebaseStorageUrl(src)) {
        return <StorageImage key={src} {...props} src={src} />;
    }
    return <Image {...props} src={src} alt={props.alt} unoptimized />;
}
