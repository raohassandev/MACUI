// This script provides essential resize handle fixes for fine-grained pixel-level resizing
// It runs in the browser and ensures resize handles are properly rendered
// Optimized to support high-precision widget positioning and resizing

// Add a global debug flag
window.GRAFANA_DEBUG = true;

// Run this when window loads
window.addEventListener('DOMContentLoaded', () => {
  console.log('[RESIZE-DEBUG] Script loaded and initializing');
  
  // Track active resize operations
  let activeResizeItem = null;
  let resizeStartTime = null;
  let resizeMetrics = {
    startDimensions: null,
    currentDimensions: null,
    events: 0,
    totalDelta: { width: 0, height: 0 }
  };
  
  // Functions to enhance resize handles
  function fixResizeHandles() {
    console.log('[RESIZE-DEBUG] Fixing resize handles');
    
    // Select all grid items
    const gridItems = document.querySelectorAll('.react-grid-item');
    console.log(`[RESIZE-DEBUG] Found ${gridItems.length} grid items`);
    
    gridItems.forEach(item => {
      // Add resize handle enhancement
      enhanceGridItem(item);
    });
    
    // Add debug outline if needed
    if (window.GRAFANA_DEBUG) {
      document.querySelector('.react-grid-layout')?.classList.add('debug-layout');
    }
  }
  
  function enhanceGridItem(item) {
    // Make sure this item has all necessary resize handles
    const directions = ['se', 'e', 's', 'w', 'ne', 'sw', 'n', 'nw'];
    
    directions.forEach(dir => {
      const handleClass = `.react-resizable-handle-${dir}`;
      let handle = item.querySelector(handleClass);
      
      if (!handle) {
        // Create missing handle
        handle = document.createElement('div');
        handle.className = `react-resizable-handle react-resizable-handle-${dir}`;
        item.appendChild(handle);
        
        // Add data attribute for direction
        handle.setAttribute('data-resize-direction', dir);
        
        if (window.GRAFANA_DEBUG) {
          console.log(`[RESIZE-DEBUG] Created missing handle: ${dir} for item ${item.getAttribute('data-grid-key')}`);
        }
      }
      
      // Make sure handle is visible and accessible
      handle.style.display = 'block';
      handle.style.opacity = '0.8';
      handle.style.zIndex = '10';
      
      // Add handle data attributes with position info for debugging
      handle.setAttribute('data-direction', dir);
    });
    
    // Add enhanced DOM tracking if not already done
    if (!item.hasAttribute('data-resize-enhanced')) {
      item.setAttribute('data-resize-enhanced', 'true');
      
      // Monitor for resize class changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const hasResizeClass = item.classList.contains('grafana-resizing');
            
            if (hasResizeClass && activeResizeItem !== item) {
              // Resize started
              activeResizeItem = item;
              resizeStartTime = performance.now();
              
              // Reset metrics
              resizeMetrics = {
                startDimensions: {
                  width: item.offsetWidth,
                  height: item.offsetHeight,
                  x: parseInt(item.style.left || '0'),
                  y: parseInt(item.style.top || '0')
                },
                currentDimensions: null,
                events: 0,
                totalDelta: { width: 0, height: 0 }
              };
              
              console.log('[RESIZE-START]', {
                widget: item.getAttribute('data-grid-key'),
                dimensions: resizeMetrics.startDimensions
              });
              
            } else if (!hasResizeClass && activeResizeItem === item) {
              // Resize stopped
              const duration = performance.now() - resizeStartTime;
              console.log('[RESIZE-STOP]', {
                widget: item.getAttribute('data-grid-key'),
                duration: `${duration.toFixed(2)}ms`,
                events: resizeMetrics.events,
                finalDimensions: {
                  width: item.offsetWidth,
                  height: item.offsetHeight
                },
                totalDelta: resizeMetrics.totalDelta
              });
              
              activeResizeItem = null;
            }
          }
        });
      });
      
      observer.observe(item, { attributes: true });
    }
  }
  
  // Monitor all resize operations
  document.addEventListener('mousemove', (e) => {
    if (activeResizeItem) {
      resizeMetrics.events++;
      
      // Get current dimensions
      resizeMetrics.currentDimensions = {
        width: activeResizeItem.offsetWidth,
        height: activeResizeItem.offsetHeight,
        x: parseInt(activeResizeItem.style.left || '0'),
        y: parseInt(activeResizeItem.style.top || '0')
      };
      
      // Calculate delta since start
      resizeMetrics.totalDelta.width = 
        resizeMetrics.currentDimensions.width - resizeMetrics.startDimensions.width;
      resizeMetrics.totalDelta.height = 
        resizeMetrics.currentDimensions.height - resizeMetrics.startDimensions.height;
      
      // Periodically log resize status (limit to avoid console flood)
      if (resizeMetrics.events % 20 === 0) {
        console.log('[RESIZE-PROGRESS]', {
          widget: activeResizeItem.getAttribute('data-grid-key'),
          dimensions: resizeMetrics.currentDimensions,
          delta: resizeMetrics.totalDelta,
          mousePosition: { x: e.clientX, y: e.clientY }
        });
      }
    }
  });
  
  // Add utility styles for debugging
  function addDebugStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .debug-resize-handle .react-resizable-handle {
        opacity: 1 !important;
        background-color: red !important;
        width: 15px !important;
        height: 15px !important;
      }
      
      /* Show resize dimensions during resize */
      .react-grid-item.grafana-resizing::after {
        content: attr(data-current-width) "x" attr(data-current-height);
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.5);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 9999;
        pointer-events: none;
      }
    `;
    
    document.head.appendChild(style);
  }
  
  // Run initially with slight delay to ensure components are mounted
  setTimeout(() => {
    fixResizeHandles();
    if (window.GRAFANA_DEBUG) {
      addDebugStyles();
    }
  }, 500);
  
  // Create a debug button in the corner if debug is enabled
  if (window.GRAFANA_DEBUG) {
    const button = document.createElement('button');
    button.textContent = 'Debug Resize';
    button.style.position = 'fixed';
    button.style.top = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '5px';
    button.style.background = '#3b82f6';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    
    button.addEventListener('click', () => {
      document.body.classList.toggle('debug-resize-handle');
      const isDebug = document.body.classList.contains('debug-resize-handle');
      console.log(`[RESIZE-DEBUG] ${isDebug ? 'Enabled' : 'Disabled'} resize handle debug mode`);
      button.textContent = isDebug ? 'Disable Debug' : 'Debug Resize';
    });
    
    document.body.appendChild(button);
  }
  
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