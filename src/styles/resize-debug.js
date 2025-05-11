// This script provides essential resize handle fixes for horizontal resizing
// It runs in the browser and ensures resize handles are properly rendered
// Optimized to minimize console output while maintaining functionality

// Run this when window loads
window.addEventListener('DOMContentLoaded', () => {
  // Function to fix resize handles
  function fixResizeHandles() {
    // Select all grid items
    const gridItems = document.querySelectorAll('.react-grid-item');
    
    gridItems.forEach(item => {
      // Make sure this item has all the necessary resize handles
      const directions = ['se', 'e', 's', 'w', 'ne', 'sw'];
      
      directions.forEach(dir => {
        const handleClass = `.react-resizable-handle-${dir}`;
        let handle = item.querySelector(handleClass);
        
        if (!handle) {
          // Create missing handle
          handle = document.createElement('div');
          handle.className = `react-resizable-handle react-resizable-handle-${dir}`;
          item.appendChild(handle);
        }
        
        // Make sure handle is visible and accessible
        handle.style.display = 'block';
        handle.style.opacity = '0.8';
        handle.style.zIndex = '10';
      });
    });
  }
  
  // Run initially with slight delay to ensure components are mounted
  setTimeout(fixResizeHandles, 500);
  
  // Monitor DOM changes to detect new widgets
  const observer = new MutationObserver((mutations) => {
    let shouldFix = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        shouldFix = true;
        break;
      }
    }
    if (shouldFix) {
      fixResizeHandles();
    }
  });
  
  // Start observing the body for changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true,
    // Use a throttled approach by only watching major DOM changes
    attributes: false,
    characterData: false
  });
  
  // Also run after window resize, but with debounce to prevent excessive calls
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(fixResizeHandles, 250);
  });
});