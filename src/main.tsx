import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux';
import './index.css';
// Import react-grid-layout CSS
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
// Import custom widget fixes
// First load the base styles
import './styles/superFixWidgets.css';
import './styles/dashboardFixedWidth.css';
import './styles/buttonFixes.css';
// Then load our override for react-resizable
import './styles/react-resizable-fix.css';
// Load direct fixes for resize issues
import './styles/direct-fix.css';
// Load debug script
import './styles/resize-debug.js';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);