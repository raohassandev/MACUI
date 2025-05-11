/**
 * Dashboard API Service
 * 
 * This service handles all dashboard-related API calls
 */

import { Dashboard } from '../../types/dashboard';

// Mock API base URL - replace with actual API URL in production
const API_BASE_URL = '/api';

/**
 * Get all dashboards
 * @returns Promise<Dashboard[]>
 */
export const fetchDashboards = async (): Promise<Dashboard[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboards`);
    if (!response.ok) {
      throw new Error(`Failed to fetch dashboards: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    // Return mock data for development
    return mockDashboards;
  }
};

/**
 * Get a dashboard by ID
 * @param id Dashboard ID
 * @returns Promise<Dashboard>
 */
export const fetchDashboardById = async (id: string): Promise<Dashboard> => {
  try {
    // Skip actual API call in development to avoid HTML errors
    // Uncomment below when API is ready
    // const response = await fetch(`${API_BASE_URL}/dashboards/${id}`);
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
    // }
    // return await response.json();

    // Always use mock data for now to avoid HTML errors
    const mockDashboard = mockDashboards.find(d => d.id === id);
    if (!mockDashboard) {
      throw new Error(`Dashboard with id ${id} not found`);
    }
    return mockDashboard;
  } catch (error) {
    console.error(`Error fetching dashboard ${id}:`, error);
    // Return mock data for development
    return mockDashboards.find(d => d.id === id) || mockDashboards[0];
  }
};

/**
 * Create a new dashboard
 * @param dashboard Dashboard data
 * @returns Promise<Dashboard>
 */
export const createDashboard = async (dashboard: Omit<Dashboard, 'id'>): Promise<Dashboard> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dashboard),
    });
    if (!response.ok) {
      throw new Error(`Failed to create dashboard: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating dashboard:', error);
    // Return mock created dashboard
    const mockDashboard: Dashboard = {
      ...dashboard,
      id: `dashboard-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Add to mock dashboards (for development)
    mockDashboards.push(mockDashboard);
    return mockDashboard;
  }
};

/**
 * Update a dashboard
 * @param id Dashboard ID
 * @param dashboard Updated dashboard data
 * @returns Promise<Dashboard>
 */
export const updateDashboard = async (id: string, dashboard: Dashboard): Promise<Dashboard> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dashboard),
    });
    if (!response.ok) {
      throw new Error(`Failed to update dashboard: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error updating dashboard ${id}:`, error);
    // Update mock dashboard
    const index = mockDashboards.findIndex(d => d.id === id);
    if (index >= 0) {
      mockDashboards[index] = {
        ...dashboard,
        updatedAt: new Date().toISOString(),
      };
      return mockDashboards[index];
    }
    return dashboard;
  }
};

/**
 * Delete a dashboard
 * @param id Dashboard ID
 * @returns Promise<void>
 */
export const deleteDashboard = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete dashboard: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Error deleting dashboard ${id}:`, error);
    // Remove from mock dashboards
    const index = mockDashboards.findIndex(d => d.id === id);
    if (index >= 0) {
      mockDashboards.splice(index, 1);
    }
  }
};

// Mock data for development
export const mockDashboards: Dashboard[] = [
  {
    id: 'dashboard-1',
    name: 'Production Line Overview',
    description: 'Monitor key metrics for the main production line',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-02-20T14:45:00Z',
    isPublic: true,
    widgets: [
      {
        id: 'widget-1',
        type: 'chart',
        title: 'Temperature Trend',
        tagId: 'temp-sensor-1',
        refreshRate: 5000,
        x: 0,
        y: 0,
        w: 6,
        h: 4,
        chartType: 'line',
        timeRange: 3600000, // 1 hour
        showLegend: true,
        yAxisMin: 0,
        yAxisMax: 100,
        autoScale: true,
      },
      {
        id: 'widget-2',
        type: 'gauge',
        title: 'Pressure',
        tagId: 'pressure-sensor-1',
        x: 6,
        y: 0,
        w: 3,
        h: 4,
        gaugeType: 'radial',
        minValue: 0,
        maxValue: 100,
        thresholds: [
          { value: 25, color: '#22c55e' }, // Green
          { value: 75, color: '#f59e0b' }, // Yellow
          { value: 90, color: '#ef4444' }, // Red
        ],
        showValue: true,
        showUnit: true,
      },
      {
        id: 'widget-3',
        type: 'numeric',
        title: 'Production Count',
        tagId: 'production-counter-1',
        x: 9,
        y: 0,
        w: 3,
        h: 2,
        displayFormat: '0,0',
        showUnit: true,
        trendIndicator: true,
      },
      {
        id: 'widget-4',
        type: 'status',
        title: 'Machine Status',
        tagId: 'machine-status-1',
        x: 9,
        y: 2,
        w: 3,
        h: 2,
        shape: 'circle',
        statusMap: {
          '0': { label: 'Offline', color: '#6b7280' },
          '1': { label: 'Idle', color: '#3b82f6' },
          '2': { label: 'Running', color: '#22c55e' },
          '3': { label: 'Warning', color: '#f59e0b' },
          '4': { label: 'Error', color: '#ef4444' },
        },
        showLabel: true,
      },
    ],
    tags: [
      {
        id: 'temp-sensor-1',
        name: 'Temperature Sensor 1',
        description: 'Main production line temperature sensor',
        valueType: 'number',
        unit: '°C',
        minValue: 0,
        maxValue: 100,
        refreshRate: 5000,
        status: 'active',
        lastValue: 72.5,
        lastUpdated: '2023-03-01T12:34:56Z',
      },
      {
        id: 'pressure-sensor-1',
        name: 'Pressure Sensor 1',
        description: 'Main production line pressure sensor',
        valueType: 'number',
        unit: 'PSI',
        minValue: 0,
        maxValue: 100,
        refreshRate: 5000,
        status: 'active',
        lastValue: 65.2,
        lastUpdated: '2023-03-01T12:34:50Z',
      },
      {
        id: 'production-counter-1',
        name: 'Production Counter',
        description: 'Daily production count',
        valueType: 'number',
        unit: 'units',
        refreshRate: 10000,
        status: 'active',
        lastValue: 1458,
        lastUpdated: '2023-03-01T12:34:40Z',
      },
      {
        id: 'machine-status-1',
        name: 'Machine Status',
        description: 'Current machine status',
        valueType: 'number',
        refreshRate: 5000,
        status: 'active',
        lastValue: 2, // Running
        lastUpdated: '2023-03-01T12:34:30Z',
      },
    ],
  },
  {
    id: 'dashboard-2',
    name: 'Energy Monitoring',
    description: 'Monitor energy consumption across the facility',
    createdAt: '2023-02-10T08:15:00Z',
    updatedAt: '2023-02-25T11:20:00Z',
    isPublic: false,
    widgets: [
      {
        id: 'widget-5',
        type: 'chart',
        title: 'Power Consumption',
        tagId: 'power-meter-1',
        refreshRate: 10000,
        x: 0,
        y: 0,
        w: 8,
        h: 4,
        chartType: 'area',
        timeRange: 86400000, // 24 hours
        showLegend: true,
        autoScale: true,
      },
      {
        id: 'widget-6',
        type: 'numeric',
        title: 'Current Power Draw',
        tagId: 'power-meter-1',
        x: 8,
        y: 0,
        w: 4,
        h: 2,
        displayFormat: '0.0 kW',
        showUnit: false,
        trendIndicator: true,
        thresholds: [
          { value: 50, color: '#22c55e' }, // Green
          { value: 75, color: '#f59e0b' }, // Yellow
          { value: 90, color: '#ef4444' }, // Red
        ],
      },
      {
        id: 'widget-7',
        type: 'gauge',
        title: 'Energy Efficiency',
        tagId: 'efficiency-calc-1',
        x: 8,
        y: 2,
        w: 4,
        h: 2,
        gaugeType: 'linear',
        minValue: 0,
        maxValue: 100,
        thresholds: [
          { value: 60, color: '#ef4444' }, // Red
          { value: 80, color: '#f59e0b' }, // Yellow
          { value: 90, color: '#22c55e' }, // Green
        ],
        showValue: true,
        showUnit: true,
      },
    ],
    tags: [
      {
        id: 'power-meter-1',
        name: 'Main Power Meter',
        description: 'Main facility power consumption meter',
        valueType: 'number',
        unit: 'kW',
        minValue: 0,
        maxValue: 500,
        refreshRate: 10000,
        status: 'active',
        lastValue: 287.3,
        lastUpdated: '2023-03-01T12:34:20Z',
      },
      {
        id: 'efficiency-calc-1',
        name: 'Energy Efficiency',
        description: 'Calculated energy efficiency percentage',
        valueType: 'number',
        unit: '%',
        minValue: 0,
        maxValue: 100,
        refreshRate: 30000,
        status: 'active',
        lastValue: 82.7,
        lastUpdated: '2023-03-01T12:34:00Z',
      },
    ],
  },
];