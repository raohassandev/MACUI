// This script helps add additional debugging and fixes to the resize functionality
// It runs in the browser and provides support for horizontal resizing

// Run this when window loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('Resize debug script loaded');
  
  // Function to fix resize handles
  function fixResizeHandles() {
    // Select all grid items
    const gridItems = document.querySelectorAll('.react-grid-item');
    console.log('Found grid items:', gridItems.length);
    
    gridItems.forEach(item => {
      // Get the widget dimensions from data attribute
      const debugData = item.querySelector('.widget-wrapper')?.getAttribute('data-debug');
      if (debugData) {
        try {
          const data = JSON.parse(debugData);
          console.log('Widget data:', data);
          
          // Make sure this item has all the necessary resize handles
          const directions = ['se', 'e', 's', 'w', 'ne', 'sw'];
          
          directions.forEach(dir => {
            const handleClass = `.react-resizable-handle-${dir}`;
            let handle = item.querySelector(handleClass);
            
            if (!handle) {
              console.log(`Adding missing ${dir} handle to widget ${data.id}`);
              handle = document.createElement('div');
              handle.className = `react-resizable-handle react-resizable-handle-${dir}`;
              item.appendChild(handle);
              
              // Add click listener for debugging
              handle.addEventListener('mousedown', () => {
                console.log(`Resize handle ${dir} clicked on widget ${data.id}`);
              });
            }
            
            // Make sure handle is visible and accessible
            handle.style.display = 'block';
            handle.style.opacity = '0.8';
            handle.style.zIndex = '10';
          });
        } catch (e) {
          console.error('Error parsing widget data:', e);
        }
      }
    });
  }
  
  // Run initially and on every window resize
  fixResizeHandles();
  
  // Monitor DOM changes to detect new widgets
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        fixResizeHandles();
        break;
      }
    }
  });
  
  // Start observing the body for all changes
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Also run on window resize
  window.addEventListener('resize', fixResizeHandles);
  
  // Add debugging for resize events
  document.body.addEventListener('mousedown', (e) => {
    const target = e.target;
    if (target.classList.contains('react-resizable-handle')) {
      console.log('Resize handle mousedown:', target);
    }
  }, true);
  
  document.body.addEventListener('mousemove', (e) => {
    // Only log every 50 pixels moved to avoid console flooding
    if (e.movementX > 50 || e.movementY > 50) {
      const targetUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      if (targetUnderCursor && targetUnderCursor.closest('.react-grid-item')) {
        console.log('Mouse position during resize:', { x: e.clientX, y: e.clientY });
      }
    }
  }, true);
});