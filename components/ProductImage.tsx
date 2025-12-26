import React, { useState } from 'react';

interface ProductImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    mainSrc?: string;
    fallbackSrc?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ mainSrc, fallbackSrc, alt, className, ...props }) => {
    const defaultPlaceholder = "https://placehold.co/600x400?text=No+Image";
    const [src, setSrc] = useState(mainSrc || fallbackSrc || defaultPlaceholder);
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            // If current was main, try fallback, else placeholder
            if (src === mainSrc && fallbackSrc) {
                setSrc(fallbackSrc);
            } else {
                setSrc(defaultPlaceholder);
            }
        }
    };

    // Reset if props change
    React.useEffect(() => {
        setSrc(mainSrc || fallbackSrc || defaultPlaceholder);
        setHasError(false);
    }, [mainSrc, fallbackSrc]);

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={handleError}
            {...props}
        />
    );
};
