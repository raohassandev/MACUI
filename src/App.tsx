import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './redux/store/store';
import { ThemeProvider } from './components/ui/theme/ThemeProvider';
import { LayoutProvider } from './contexts/LayoutContext';
import { ComponentDemoPage } from './pages/ComponentDemoPage';
import DashboardPage from './pages/DashboardPage';
import DashboardListPage from './pages/DashboardListPage';
import ThemeSettingsPage from './pages/ThemeSettingsPage';
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
                
                {/* Dashboard List Page */}
                <Route path="/dashboards" element={<DashboardListPage />} />
                
                {/* Theme Settings Page */}
                <Route path="/theme-settings" element={<ThemeSettingsPage />} />
                
                {/* Component Demo Page */}
                <Route path="/components" element={<ComponentDemoPage />} />
                
                {/* Default Route */}
                <Route path="/" element={<DashboardListPage />} />
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