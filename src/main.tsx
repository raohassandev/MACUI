import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './redux';
import './index.css';
// Import react-grid-layout CSS
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
// Import simple fix for resize
import './styles/fix-resize.css';
// Import sidebar styles
import './styles/engineer-sidebar.css';
// Import dropdown fix
import './styles/dropdown-fix.css';
// Import no margin fix
import './styles/no-margin.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);