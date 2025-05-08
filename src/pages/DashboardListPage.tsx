import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { fetchAllDashboards } from '../redux/slices/dashboardSlice';
import { Dashboard } from '../types/dashboard';
import { fetchDashboards } from '../services/api/dashboard';

const DashboardListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch dashboards on mount
  useEffect(() => {
    const loadDashboards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get dashboards from API
        const dashboardsData = await fetchDashboards();
        setDashboards(dashboardsData);
        
        // Also update the Redux store
        dispatch(fetchAllDashboards());
      } catch (err) {
        console.error('Error loading dashboards:', err);
        setError('Failed to load dashboards. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboards();
  }, [dispatch]);

  // Handle dashboard selection
  const handleDashboardClick = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}`);
  };

  // Create a new dashboard
  const handleCreateDashboard = () => {
    navigate('/dashboard/new');
  };

  // Filter dashboards based on search term and category
  const filteredDashboards = dashboards.filter(dashboard => {
    const matchesSearch = dashboard.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (dashboard.description && dashboard.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || 
      (dashboard.tags && dashboard.tags.some(tag => tag.name === selectedCategory));
    
    return matchesSearch && matchesCategory;
  });

  // Extract all unique categories from dashboard tags
  const categories = Array.from(new Set(
    dashboards.flatMap(dashboard => 
      dashboard.tags ? dashboard.tags.map(tag => tag.name) : []
    )
  ));

  // Generate a thumbnail SVG for a dashboard preview
  const generateDashboardThumbnail = (dashboard: Dashboard) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 12 8" className="rounded-lg bg-gray-100 dark:bg-gray-800">
        {dashboard.widgets.map((widget, index) => {
          const color = colors[index % colors.length];
          return (
            <rect 
              key={widget.id}
              x={widget.x} 
              y={widget.y} 
              width={widget.w} 
              height={widget.h} 
              fill={color}
              fillOpacity="0.6"
              rx="0.25"
              ry="0.25"
            />
          );
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <h2 className="font-bold mb-2">Error Loading Dashboards</h2>
          <p>{error}</p>
          <button 
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Industrial IoT Dashboards
        </h1>
        <button 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          onClick={handleCreateDashboard}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Create New Dashboard
        </button>
      </div>

      {/* Search and filter controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search dashboards..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute right-3 top-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div>
          <select
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800"
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredDashboards.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mt-4 text-gray-900 dark:text-gray-100">No Dashboards Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchTerm || selectedCategory 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Create your first dashboard to get started.'}
          </p>
          {!(searchTerm || selectedCategory) && (
            <button 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleCreateDashboard}
            >
              Create Dashboard
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDashboards.map(dashboard => (
            <div 
              key={dashboard.id}
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleDashboardClick(dashboard.id)}
            >
              <div className="h-40 overflow-hidden bg-gray-100 dark:bg-gray-900">
                {generateDashboardThumbnail(dashboard)}
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {dashboard.name}
                </h3>
                
                {dashboard.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {dashboard.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Last updated: {new Date(dashboard.updatedAt || '').toLocaleDateString()}
                  </div>
                  
                  {dashboard.isPublic && (
                    <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                      Public
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardListPage;