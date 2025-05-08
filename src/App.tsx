import { Provider } from 'react-redux';
import { store } from './redux';
import { ThemeProvider } from './components/ui/theme/ThemeProvider';
import { LayoutProvider } from './contexts/LayoutContext';
import { ComponentDemoPage } from './pages/ComponentDemoPage';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LayoutProvider defaultLayout="client">
          <MainLayout>
            <ComponentDemoPage />
          </MainLayout>
        </LayoutProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;