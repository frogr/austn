import React from 'react';

/**
 * ResponsiveImage component that provides:
 * - WebP support with fallback to original format
 * - Lazy loading
 * - Correct aspect ratio preservation
 * - Explicit width/height to prevent layout shifts
 * 
 * @param {Object} props
 * @param {string} props.src - Original image source URL
 * @param {string} props.alt - Image alt text for accessibility
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height 
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.objectFit - CSS object-fit property (cover, contain, etc.)
 */
const ResponsiveImage = ({ 
  src, 
  alt = '', 
  width, 
  height, 
  className = '', 
  objectFit = 'cover',
  ...rest
}) => {
  // Generate WebP source if original is not already WebP
  // For external images, we need to rely on the original format
  const isExternalImage = src.startsWith('http');
  const isAlreadyWebP = src.endsWith('.webp');
  
  // Only create webp path for internal images that aren't already webp
  const webpSrc = (!isExternalImage && !isAlreadyWebP) 
    ? src.replace(/\.(jpg|jpeg|png)$/, '.webp') 
    : null;
  
  // Set inline style for object-fit
  const imgStyle = {
    objectFit,
  };

  return (
    <picture>
      {webpSrc && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading="lazy"
        decoding="async"
        style={imgStyle}
        {...rest}
      />
    </picture>
  );
};

export default ResponsiveImage;