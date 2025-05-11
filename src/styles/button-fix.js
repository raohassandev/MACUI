// Script to ensure Engineer/Client buttons are properly positioned
window.addEventListener('DOMContentLoaded', () => {
  // Function to fix engineer/client buttons
  function fixEngineerClientButtons() {
    // Find buttons by their appearance and content
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach(button => {
      const text = button.textContent || '';
      if (text.includes('Engineer')) {
        button.classList.add('engineer-mode-button');
      } else if (text.includes('Client')) {
        button.classList.add('client-mode-button');
      } else if (text.includes('View Mode') || text.includes('Edit')) {
        button.classList.add('view-mode-button');
      }
    });
  }
  
  // Run after a delay to ensure DOM is fully loaded
  setTimeout(fixEngineerClientButtons, 500);
  
  // Also run when the route changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        setTimeout(fixEngineerClientButtons, 100);
        break;
      }
    }
  });
  
  // Start observing the body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});