// Enhanced scrollbar implementation with direct DOM manipulation
document.addEventListener('DOMContentLoaded', () => {
  console.log('Enhanced scrollbar script loaded - applying custom scrollbar styles');

  // Create a style element for scrollbar styles
  const styleElement = document.createElement('style');
  styleElement.id = 'custom-scrollbar-styles-js';
  styleElement.type = 'text/css';
  
  // Define even more specific scrollbar styles with !important for maximum priority
  styleElement.textContent = `
    /* Global scrollbar styles with maximum specificity */
    html body *::-webkit-scrollbar,
    *::-webkit-scrollbar,
    ::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
      display: block !important;
    }

    html body *::-webkit-scrollbar-track,
    *::-webkit-scrollbar-track,
    ::-webkit-scrollbar-track {
      background: rgba(241, 241, 241, 0.8) !important;
      border-radius: 4px !important;
      margin: 2px !important;
    }

    html body *::-webkit-scrollbar-thumb,
    *::-webkit-scrollbar-thumb,
    ::-webkit-scrollbar-thumb {
      background: rgba(136, 136, 136, 0.8) !important;
      border-radius: 4px !important;
      border: 1px solid rgba(136, 136, 136, 0.8) !important;
    }

    html body *::-webkit-scrollbar-thumb:hover,
    *::-webkit-scrollbar-thumb:hover,
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(85, 85, 85, 0.9) !important;
    }

    /* Timeline markers on the track */
    html body *::-webkit-scrollbar-track,
    *::-webkit-scrollbar-track,
    ::-webkit-scrollbar-track {
      background-image: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 48px,
        #888 48px,
        #888 52px,
        transparent 52px
      ) !important;
      background-position: center !important;
      background-size: 2px auto !important;
      background-repeat: repeat-y !important;
    }

    /* Special class for direct application */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
      display: block !important;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(241, 241, 241, 0.8) !important;
      border-radius: 4px !important;
      margin: 2px !important;
      background-image: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 48px,
        #888 48px,
        #888 52px,
        transparent 52px
      ) !important;
      background-position: center !important;
      background-size: 2px auto !important;
      background-repeat: repeat-y !important;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(136, 136, 136, 0.8) !important;
      border-radius: 4px !important;
      border: 1px solid rgba(136, 136, 136, 0.8) !important;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(85, 85, 85, 0.9) !important;
    }

    /* Firefox scrollbar */
    html, body, * {
      scrollbar-width: thin !important;
      scrollbar-color: #888 #f1f1f1 !important;
    }
    
    /* Force scrollbars to be visible on main elements */
    html, body {
      overflow-y: scroll !important;
    }
    
    main {
      overflow-y: auto !important;
      height: 100vh !important;
    }
  `;
  
  // Remove any existing scrollbar styles with the same ID
  const existingStyle = document.getElementById('custom-scrollbar-styles-js');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Insert our style element at the END of head for highest priority
  document.head.appendChild(styleElement);
  
  // Direct application to common elements
  const applyScrollbarStyles = () => {
    // Add the custom-scrollbar class to key elements
    document.documentElement.classList.add('custom-scrollbar');
    document.body.classList.add('custom-scrollbar');
    
    // Target elements that are likely to have scrollbars
    const scrollTargets = [
      ...document.querySelectorAll('div[style*="overflow"]'),
      ...document.querySelectorAll('[class*="overflow"]'),
      ...document.querySelectorAll('pre'),
      ...document.querySelectorAll('main'),
      ...document.querySelectorAll('article'),
      ...document.querySelectorAll('.markdown-content')
    ];
    
    scrollTargets.forEach(element => {
      // Add our custom class
      element.classList.add('custom-scrollbar');
      
      // Apply direct styles for maximum compatibility
      element.style.setProperty('scrollbar-width', 'thin', 'important');
      element.style.setProperty('scrollbar-color', '#888 #f1f1f1', 'important');
    });
    
    console.log(`Applied scrollbar styles to ${scrollTargets.length} elements`);
  };
  
  // Apply immediately and after a slight delay for dynamic content
  applyScrollbarStyles();
  setTimeout(applyScrollbarStyles, 500);
  
  // Create a MutationObserver to watch for DOM changes
  const observer = new MutationObserver(mutations => {
    // Reapply styles when the DOM changes
    applyScrollbarStyles();
  });
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  console.log('Enhanced scrollbar styles successfully initialized');
});