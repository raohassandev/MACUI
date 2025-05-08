import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './redux/store/store';
import { ThemeProvider } from './components/ui/theme/ThemeProvider';
import { LayoutProvider } from './contexts/LayoutContext';
import { ComponentDemoPage } from './pages/ComponentDemoPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <LayoutProvider defaultLayout="client">
          <Router>
            <MainLayout>
              <Routes>
                {/* Dashboard Routes */}
                <Route path="/dashboard/:id" element={<DashboardPage />} />
                <Route path="/dashboard" element={<Navigate to="/dashboard/new" />} />
                
                {/* Component Demo Page */}
                <Route path="/components" element={<ComponentDemoPage />} />
                
                {/* Default Route */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </MainLayout>
          </Router>
        </LayoutProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;