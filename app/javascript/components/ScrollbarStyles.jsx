import React, { useEffect } from 'react';

const ScrollbarStyles = () => {
  useEffect(() => {
    // Create and append a style element to ensure scrollbar styles are applied with high priority
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      /* Custom Timeline Scrollbar (Applied via JS for higher priority) */
      ::-webkit-scrollbar {
        width: 8px !important;
      }

      ::-webkit-scrollbar-track {
        background-color: #f1f1f1 !important;
        background-image: linear-gradient(
          to bottom,
          transparent 0px,
          transparent 98px,
          #aaa 98px, 
          #aaa 102px,
          transparent 102px
        ) !important;
        background-repeat: repeat-y !important;
        background-position: center !important;
        background-size: 2px auto !important;
      }

      ::-webkit-scrollbar-thumb {
        background: #888 !important;
        border-radius: 4px !important;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #555 !important;
      }

      /* Firefox */
      * {
        scrollbar-width: thin !important;
        scrollbar-color: #888 #f1f1f1 !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ScrollbarStyles;