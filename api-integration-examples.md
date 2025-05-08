# API Integration Examples for Dashboard Components

This document provides detailed examples of how to integrate specific API endpoints with various dashboard components.

## Authentication Integration

### Login Component

```typescript
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      // Redirect to dashboard after successful login
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 bg-background text-text rounded-lg shadow-md">
      <h2 className="text-lg font-bold mb-4">Login</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-2 rounded"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

## Device Status Component

### Device Status Card

This component displays the online/offline status of a device.

```typescript
import { useState, useEffect } from 'react';
import { deviceApi } from '../../services/apiService';

interface DeviceStatusCardProps {
  deviceId: string;
  refreshInterval?: number; // in milliseconds
}

export const DeviceStatusCard = ({ deviceId, refreshInterval = 30000 }: DeviceStatusCardProps) => {
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchDeviceData = async () => {
    try {
      const data = await deviceApi.getDeviceById(deviceId);
      setDevice(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch device:', err);
      setError('Failed to load device data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDeviceData();
    
    // Set up polling interval
    const intervalId = setInterval(fetchDeviceData, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [deviceId, refreshInterval]);
  
  if (loading) {
    return (
      <div className="p-4 bg-background text-text rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-primary/20 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-primary/20 rounded w-1/2"></div>
      </div>
    );
  }
  
  if (error || !device) {
    return (
      <div className="p-4 bg-background text-text rounded-lg shadow-md border border-red-300">
        <div className="text-red-500">Error: {error || 'Device not found'}</div>
      </div>
    );
  }
  
  const isOnline = device.enabled && (new Date().getTime() - new Date(device.lastSeen).getTime() < 300000); // 5 minutes
  
  return (
    <div className="p-4 bg-background text-text rounded-lg shadow-md">
      <h3 className="text-md font-bold mb-2">{device.name}</h3>
      <div className="flex items-center">
        <div 
          className={`w-3 h-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
        ></div>
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {device.make} {device.model}
      </div>
      <div className="mt-1 text-xs text-gray-400">
        Last seen: {new Date(device.lastSeen).toLocaleString()}
      </div>
    </div>
  );
};
```

## Device Data Component

### Current Readings Gauge

This component displays a gauge with current device readings.

```typescript
import { useState, useEffect } from 'react';
import { deviceApi } from '../../services/apiService';
import { Gauge } from 'react-gauge-component';

interface ReadingsGaugeProps {
  deviceId: string;
  dataPointName: string;
  min?: number;
  max?: number;
  refreshInterval?: number; // in milliseconds
  unit?: string;
  title?: string;
}

export const ReadingsGauge = ({
  deviceId,
  dataPointName,
  min = 0,
  max = 100,
  refreshInterval = 10000,
  unit = '',
  title = 'Current Reading'
}: ReadingsGaugeProps) => {
  const [value, setValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const fetchReading = async () => {
    try {
      const data = await deviceApi.getCurrentDeviceData(deviceId);
      const reading = data.readings.find((r: any) => r.name === dataPointName);
      
      if (reading) {
        setValue(Number(reading.value));
        setError('');
      } else {
        setError(`Data point "${dataPointName}" not found`);
      }
    } catch (err) {
      console.error('Failed to fetch reading:', err);
      setError('Failed to load device data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReading();
    
    // Set up polling interval
    const intervalId = setInterval(fetchReading, refreshInterval);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [deviceId, dataPointName, refreshInterval]);
  
  // Calculate color based on value range
  const getColor = (val: number) => {
    const percentage = ((val - min) / (max - min)) * 100;
    
    if (percentage < 25) return '#00FF00'; // Green
    if (percentage < 50) return '#AAFF00'; // Yellow-Green
    if (percentage < 75) return '#FFFF00'; // Yellow
    if (percentage < 90) return '#FFAA00'; // Orange
    return '#FF0000'; // Red
  };
  
  if (loading) {
    return (
      <div className="p-4 bg-background text-text rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-primary/20 rounded w-3/4 mb-2"></div>
        <div className="h-32 bg-primary/20 rounded-full"></div>
      </div>
    );
  }
  
  if (error || value === null) {
    return (
      <div className="p-4 bg-background text-text rounded-lg shadow-md border border-red-300">
        <div className="text-red-500">Error: {error || 'No data available'}</div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-background text-text rounded-lg shadow-md">
      <h3 className="text-md font-bold mb-2">{title}</h3>
      <Gauge 
        value={value}
        minValue={min}
        maxValue={max}
        valueFormatter={(val) => `${val}${unit}`}
        arc={{
          subArcs: [
            { limit: max, color: getColor(value) }
          ]
        }}
      />
      <div className="mt-2 text-center">
        <span className="text-lg font-bold">{value.toFixed(1)}{unit}</span>
        <div className="text-xs text-gray-400">{dataPointName}</div>
      </div>
    </div>
  );
};
```

## Historical Data Component

### Historical Data Chart

This component displays historical data in a line chart.

```typescript
import { useState, useEffect } from 'react';
import { deviceApi } from '../../services/apiService';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HistoricalDataChartProps {
  deviceId: string;
  dataPointName: string;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  limit?: number;
  title?: string;
  unit?: string;
}

export const HistoricalDataChart = ({
  deviceId,
  dataPointName,
  startDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
  endDate = new Date().toISOString(),
  limit = 100,
  title = 'Historical Data',
  unit = ''
}: HistoricalDataChartProps) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const data = await deviceApi.getDeviceHistoricalData(deviceId, {
          startDate,
          endDate,
          parameter: dataPointName,
          limit: limit.toString()
        });
        
        if (data && data.readings && data.readings.length > 0) {
          // Extract timestamps and values
          const labels = data.readings.map((reading: any) => 
            new Date(reading.timestamp).toLocaleTimeString()
          );
          
          const values = data.readings.map((reading: any) => reading.value);
          
          setChartData({
            labels,
            datasets: [
              {
                label: `${dataPointName} (${unit})`,
                data: values,
                borderColor: '#646cff',
                backgroundColor: 'rgba(100, 108, 255, 0.5)',
                tension: 0.2
              }
            ]
          });
          
          setError('');
        } else {
          setError('No historical data available');
        }
      } catch (err) {
        console.error('Failed to fetch historical data:', err);
        setError('Failed to load historical data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoricalData();
  }, [deviceId, dataPointName, startDate, endDate, limit, unit]);
  
  if (loading) {
    return (
      <div className="p-4 bg-background text-text rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-primary/20 rounded w-3/4 mb-2"></div>
        <div className="h-64 bg-primary/20 rounded"></div>
      </div>
    );
  }
  
  if (error || !chartData) {
    return (
      <div className="p-4 bg-background text-text rounded-lg shadow-md border border-red-300">
        <div className="text-red-500">Error: {error || 'No data available'}</div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-background text-text rounded-lg shadow-md">
      <h3 className="text-md font-bold mb-2">{title}</h3>
      <div className="h-64">
        <Line 
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              tooltip: {
                mode: 'index' as const,
                intersect: false,
              },
            },
            scales: {
              y: {
                title: {
                  display: true,
                  text: unit
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Time'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};
```

## Device Control Component

### Device Control Panel

This component provides controls for a device, using its profile.

```typescript
import { useState, useEffect } from 'react';
import { deviceApi, profileApi } from '../../services/apiService';

interface DeviceControlPanelProps {
  deviceId: string;
}

export const DeviceControlPanel = ({ deviceId }: DeviceControlPanelProps) => {
  const [device, setDevice] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [polling, setPolling] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<number>(10000);
  
  // Fetch device and available profiles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch device info
        const deviceData = await deviceApi.getDeviceById(deviceId, true);
        setDevice(deviceData);
        
        // Fetch profiles
        const profilesData = await profileApi.getAllProfiles();
        
        // Filter profiles that can be applied to this device
        const compatibleProfiles = profilesData.filter((profile: any) => 
          profile.assignedDevices.some((dev: any) => 
            dev._id === deviceId || dev === deviceId
          )
        );
        
        setProfiles(compatibleProfiles);
        
        // Check if device has active polling
        // This would require backend support to check polling status
        // For now, we'll just assume it's not polling
        
        setError('');
      } catch (err) {
        console.error('Failed to fetch device info:', err);
        setError('Failed to load device information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [deviceId]);
  
  // Apply selected profile
  const handleApplyProfile = async () => {
    if (!selectedProfileId) return;
    
    try {
      setApplying(true);
      setSuccess('');
      setError('');
      
      const result = await profileApi.applyProfile(selectedProfileId);
      
      setSuccess(`Profile applied successfully: ${result.message || 'OK'}`);
      
      // Refresh device data
      const deviceData = await deviceApi.getDeviceById(deviceId, true);
      setDevice(deviceData);
    } catch (err) {
      console.error('Failed to apply profile:', err);
      setError('Failed to apply profile to device');
    } finally {
      setApplying(false);
    }
  };
  
  // Start device polling
  const handleStartPolling = async () => {
    try {
      setError('');
      setSuccess('');
      
      await deviceApi.startDevicePolling(deviceId, pollingInterval);
      
      setPolling(true);
      setSuccess('Device polling started successfully');
    } catch (err) {
      console.error('Failed to start polling:', err);
      setError('Failed to start device polling');
    }
  };
  
  // Stop device polling
  const handleStopPolling = async () => {
    try {
      setError('');
      setSuccess('');
      
      await deviceApi.stopDevicePolling(deviceId);
      
      setPolling(false);
      setSuccess('Device polling stopped successfully');
    } catch (err) {
      console.error('Failed to stop polling:', err);
      setError('Failed to stop device polling');
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 bg-background text-text rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-primary/20 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-primary/20 rounded w-1/2 mb-2"></div>
        <div className="h-8 bg-primary/20 rounded w-full"></div>
      </div>
    );
  }
  
  if (error && !device) {
    return (
      <div className="p-4 bg-background text-text rounded-lg shadow-md border border-red-300">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-background text-text rounded-lg shadow-md">
      <h3 className="text-md font-bold mb-2">Device Control: {device?.name}</h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">Apply Profile</h4>
        <div className="flex gap-2">
          <select
            className="flex-1 px-3 py-2 border rounded"
            value={selectedProfileId || ''}
            onChange={(e) => setSelectedProfileId(e.target.value || null)}
          >
            <option value="">Select a profile</option>
            {profiles.map((profile) => (
              <option key={profile._id} value={profile._id}>
                {profile.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleApplyProfile}
            disabled={!selectedProfileId || applying}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
          >
            {applying ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">Data Polling</h4>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <label>Polling interval (ms):</label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={pollingInterval}
              onChange={(e) => setPollingInterval(Number(e.target.value))}
              className="px-3 py-2 border rounded w-32"
              disabled={polling}
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleStartPolling}
              disabled={polling}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              Start Polling
            </button>
            
            <button
              onClick={handleStopPolling}
              disabled={!polling}
              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
            >
              Stop Polling
            </button>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-2">
        Device Driver: {device?.deviceDriver?.name || 'N/A'}
      </div>
    </div>
  );
};
```

## Device List Component

### Device List with Filtering

This component displays a list of devices with filtering options.

```typescript
import { useState, useEffect } from 'react';
import { deviceApi } from '../../services/apiService';

interface DeviceListProps {
  onSelectDevice?: (deviceId: string) => void;
  initialFilters?: Record<string, string>;
  showFilters?: boolean;
  limit?: number;
}

export const DeviceList = ({
  onSelectDevice,
  initialFilters = {},
  showFilters = true,
  limit = 10
}: DeviceListProps) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<any>({
    total: 0,
    page: 1,
    pages: 1,
    limit
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    type: initialFilters.type || '',
    search: initialFilters.search || '',
    page: initialFilters.page || '1'
  });
  
  // Apply filters and fetch devices
  const fetchDevices = async () => {
    try {
      setLoading(true);
      
      // Prepare query parameters
      const params: Record<string, string> = {
        limit: limit.toString(),
        page: filters.page
      };
      
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.search) params.search = filters.search;
      
      const data = await deviceApi.getAllDevices(params);
      
      setDevices(data.devices);
      setPagination(data.pagination);
      setError('');
    } catch (err) {
      console.error('Failed to fetch devices:', err);
      setError('Failed to load devices');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch devices when filters change
  useEffect(() => {
    fetchDevices();
  }, [filters, limit]);
  
  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      // Reset to page 1 when changing filters
      ...(name !== 'page' ? { page: '1' } : {})
    }));
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    handleFilterChange('page', newPage.toString());
  };
  
  // Determine if a device is online
  const isDeviceOnline = (device: any) => {
    return device.enabled && 
           device.lastSeen && 
           (new Date().getTime() - new Date(device.lastSeen).getTime() < 300000); // 5 minutes
  };
  
  return (
    <div className="p-4 bg-background text-text rounded-lg shadow-md">
      <h3 className="text-md font-bold mb-4">Devices</h3>
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {showFilters && (
        <div className="mb-4 p-3 bg-background border rounded">
          <div className="text-sm font-semibold mb-2">Filters</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="text-xs block mb-1">Status</label>
              <select
                className="w-full px-2 py-1 border rounded text-sm"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs block mb-1">Type</label>
              <select
                className="w-full px-2 py-1 border rounded text-sm"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">All</option>
                <option value="sensor">Sensor</option>
                <option value="controller">Controller</option>
                <option value="gateway">Gateway</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs block mb-1">Search</label>
              <input
                type="text"
                className="w-full px-2 py-1 border rounded text-sm"
                placeholder="Search by name, location..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 border rounded">
              <div className="h-4 bg-primary/20 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-primary/20 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {devices.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              No devices found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <div 
                  key={device._id}
                  className={`
                    p-3 border rounded flex items-center justify-between transition-colors
                    ${onSelectDevice ? 'cursor-pointer hover:bg-primary/10' : ''}
                  `}
                  onClick={() => onSelectDevice && onSelectDevice(device._id)}
                >
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-xs text-gray-500">
                      {device.make} {device.model} | {device.location || 'No location'}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div 
                      className={`
                        w-2.5 h-2.5 rounded-full mr-2
                        ${isDeviceOnline(device) ? 'bg-green-500' : 'bg-red-500'}
                      `}
                    ></div>
                    <span className="text-xs">
                      {isDeviceOnline(device) ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <button
                onClick={() => handlePageChange(Number(filters.page) - 1)}
                disabled={filters.page === '1'}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="text-sm">
                Page {filters.page} of {pagination.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(Number(filters.page) + 1)}
                disabled={Number(filters.page) >= pagination.pages}
                className="px-2 py-1 text-sm border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
```

## Modal System Implementation

### Configuration Modal Component

This reusable modal component allows configuring dashboard components.

```typescript
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
  title: string;
  initialConfig: any;
  children: React.ReactNode;
}

export const ConfigurationModal = ({
  isOpen,
  onClose,
  onSave,
  title,
  initialConfig,
  children
}: ConfigurationModalProps) => {
  // Mount modal in a portal
  const modalRoot = document.getElementById('modal-root');
  
  if (!modalRoot) {
    console.error('Modal root element not found');
    return null;
  }
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div 
        className="bg-background text-text rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-lg font-bold">{title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>,
    modalRoot
  );
};
```

### Modal Usage Example in a Component

```typescript
import { useState } from 'react';
import { ConfigurationModal } from '../Modals/ConfigurationModal';
import { deviceApi } from '../../services/apiService';

export const DeviceDataComponent = ({ id, config, onConfigure, isEditing }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [componentConfig, setComponentConfig] = useState(config || {
    deviceId: '',
    dataPointName: '',
    refreshInterval: 30000,
    title: 'Device Data'
  });
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [dataPoints, setDataPoints] = useState([]);
  
  // Fetch devices when modal opens
  const handleOpenModal = async () => {
    try {
      const response = await deviceApi.getAllDevices();
      setDevices(response.devices);
      
      if (componentConfig.deviceId) {
        await fetchDeviceDataPoints(componentConfig.deviceId);
      }
      
      setModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };
  
  // Fetch device data points
  const fetchDeviceDataPoints = async (deviceId) => {
    try {
      const device = await deviceApi.getDeviceById(deviceId, true);
      setSelectedDevice(device);
      setDataPoints(device.dataPoints || []);
    } catch (error) {
      console.error('Failed to fetch device data points:', error);
    }
  };
  
  // Handle device selection
  const handleDeviceChange = async (e) => {
    const deviceId = e.target.value;
    setComponentConfig(prev => ({ ...prev, deviceId, dataPointName: '' }));
    
    if (deviceId) {
      await fetchDeviceDataPoints(deviceId);
    } else {
      setSelectedDevice(null);
      setDataPoints([]);
    }
  };
  
  // Handle save
  const handleSave = (newConfig) => {
    setComponentConfig(newConfig);
    onConfigure(newConfig);
    setModalOpen(false);
  };
  
  return (
    <>
      <div className="p-4 bg-background text-text rounded-lg shadow-md relative">
        <h3 className="text-md font-bold mb-2">{componentConfig.title || 'Device Data'}</h3>
        
        {/* Component content */}
        {componentConfig.deviceId && componentConfig.dataPointName ? (
          <div>
            {/* Render actual component data here */}
            <div>Device ID: {componentConfig.deviceId}</div>
            <div>Data Point: {componentConfig.dataPointName}</div>
          </div>
        ) : (
          <div className="text-gray-500 italic">
            {isEditing ? 'Configure this component' : 'No data configured'}
          </div>
        )}
        
        {/* Edit button (only visible in edit mode) */}
        {isEditing && (
          <button
            onClick={handleOpenModal}
            className="absolute top-2 right-2 p-1 text-gray-500 hover:text-primary"
          >
            ⚙️
          </button>
        )}
      </div>
      
      {/* Configuration Modal */}
      <ConfigurationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        title="Configure Device Data Component"
        initialConfig={componentConfig}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSave(componentConfig);
        }}>
          <div className="mb-4">
            <label className="block mb-1">Title</label>
            <input
              type="text"
              value={componentConfig.title}
              onChange={(e) => setComponentConfig(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              placeholder="Component Title"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Device</label>
            <select
              value={componentConfig.deviceId}
              onChange={handleDeviceChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select a device</option>
              {devices.map(device => (
                <option key={device._id} value={device._id}>
                  {device.name} ({device.make} {device.model})
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Data Point</label>
            <select
              value={componentConfig.dataPointName}
              onChange={(e) => setComponentConfig(prev => ({ ...prev, dataPointName: e.target.value }))}
              className="w-full px-3 py-2 border rounded"
              disabled={!componentConfig.deviceId}
            >
              <option value="">Select a data point</option>
              {dataPoints.map(dataPoint => (
                <option key={dataPoint.name} value={dataPoint.name}>
                  {dataPoint.name} ({dataPoint.registerType} {dataPoint.registerIndex})
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Refresh Interval (ms)</label>
            <input
              type="number"
              min="1000"
              step="1000"
              value={componentConfig.refreshInterval}
              onChange={(e) => setComponentConfig(prev => ({ 
                ...prev, 
                refreshInterval: parseInt(e.target.value, 10) 
              }))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </ConfigurationModal>
    </>
  );
};
```

## Complete Dashboard Implementation Example

This example shows how to combine various components into a full dashboard system:

1. First, ensure you have a portal root for modals in your HTML:
```html
<div id="modal-root"></div>
```

2. Create a component registry:
```typescript
// src/components/DashboardComponents/componentRegistry.ts
import { DeviceStatusCard } from './DeviceStatus/DeviceStatusCard';
import { ReadingsGauge } from './Readings/ReadingsGauge';
import { HistoricalDataChart } from './Charts/HistoricalDataChart';
import { DeviceList } from './DeviceList/DeviceList';
import { DeviceControlPanel } from './DeviceControl/DeviceControlPanel';

// Registry of available components
export const componentRegistry = {
  'device-status': {
    component: DeviceStatusCard,
    label: 'Device Status',
    icon: '📊',
    defaultConfig: {
      title: 'Device Status',
      deviceId: '',
      refreshInterval: 30000
    },
    defaultLayout: { w: 2, h: 1, minW: 1, minH: 1 }
  },
  'readings-gauge': {
    component: ReadingsGauge,
    label: 'Readings Gauge',
    icon: '🔄',
    defaultConfig: {
      title: 'Current Reading',
      deviceId: '',
      dataPointName: '',
      min: 0,
      max: 100,
      unit: '',
      refreshInterval: 10000
    },
    defaultLayout: { w: 2, h: 2, minW: 1, minH: 1 }
  },
  'historical-chart': {
    component: HistoricalDataChart,
    label: 'Historical Chart',
    icon: '📈',
    defaultConfig: {
      title: 'Historical Data',
      deviceId: '',
      dataPointName: '',
      timeRange: '24h',
      unit: ''
    },
    defaultLayout: { w: 4, h: 2, minW: 2, minH: 1 }
  },
  'device-list': {
    component: DeviceList,
    label: 'Device List',
    icon: '📋',
    defaultConfig: {
      title: 'Devices',
      showFilters: true,
      limit: 5
    },
    defaultLayout: { w: 3, h: 3, minW: 2, minH: 2 }
  },
  'device-control': {
    component: DeviceControlPanel,
    label: 'Device Control',
    icon: '🎛️',
    defaultConfig: {
      title: 'Device Control',
      deviceId: ''
    },
    defaultLayout: { w: 3, h: 2, minW: 2, minH: 1 }
  }
};

// Helper to get component
export const getComponentByType = (type: string) => {
  return componentRegistry[type] || null;
};

// Get all available components
export const getAvailableComponents = () => {
  return Object.entries(componentRegistry).map(([key, value]) => ({
    type: key,
    ...value
  }));
};
```

3. Create the main dashboard container:
```typescript
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks/hooks';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { 
  setCurrentDashboard,
  updateLayout,
  addComponent,
  removeComponent,
  toggleEditMode
} from '../../redux/slices/dashboardSlice';
import { getComponentByType, getAvailableComponents } from './componentRegistry';
import { useDashboardPersistence } from '../../hooks/useDashboardPersistence';
import { v4 as uuidv4 } from 'uuid';

// Add width provider to make the grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

export const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { currentDashboard, dashboards } = useAppSelector(state => state.dashboard);
  const { saveDashboard, loadDashboard, loadUserDashboards } = useDashboardPersistence();
  
  // Local state for dashboard name/description editing
  const [editingName, setEditingName] = useState(false);
  const [dashboardName, setDashboardName] = useState(currentDashboard.name);
  const [dashboardDescription, setDashboardDescription] = useState(currentDashboard.description);
  
  // Load user dashboards on mount
  useEffect(() => {
    loadUserDashboards();
  }, []);
  
  // Update local state when current dashboard changes
  useEffect(() => {
    setDashboardName(currentDashboard.name);
    setDashboardDescription(currentDashboard.description);
  }, [currentDashboard.id]);
  
  // Handle layout changes
  const handleLayoutChange = (layout) => {
    dispatch(updateLayout(layout));
  };
  
  // Add a new component
  const handleAddComponent = (componentType) => {
    const componentInfo = getComponentByType(componentType);
    if (!componentInfo) return;
    
    const componentId = `${componentType}-${uuidv4()}`;
    const layout = {
      i: componentId,
      x: 0, // Will be automatically adjusted by react-grid-layout
      y: Infinity, // Put at the bottom
      ...componentInfo.defaultLayout
    };
    
    dispatch(addComponent({
      id: componentId,
      componentType,
      initialConfig: componentInfo.defaultConfig,
      layout
    }));
  };
  
  // Handle component removal
  const handleRemoveComponent = (componentId) => {
    dispatch(removeComponent(componentId));
  };
  
  // Handle component configuration
  const handleConfigureComponent = (componentId, newConfig) => {
    dispatch(updateComponentConfig({
      id: componentId,
      config: newConfig
    }));
  };
  
  // Handle dashboard save
  const handleSaveDashboard = async () => {
    try {
      // Update dashboard name/description if editing
      if (editingName) {
        dispatch(updateDashboardMetadata({
          name: dashboardName,
          description: dashboardDescription
        }));
        setEditingName(false);
      }
      
      await saveDashboard();
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      // Show error notification
    }
  };
  
  // Render each component based on its type
  const renderComponent = (componentId, componentType, componentConfig) => {
    const ComponentInfo = getComponentByType(componentType);
    if (!ComponentInfo) return null;
    
    const Component = ComponentInfo.component;
    
    return (
      <div key={componentId} className="h-full">
        {currentDashboard.isEditing && (
          <div className="absolute top-0 right-0 z-10 flex gap-1 p-1">
            <button
              onClick={() => handleConfigureComponent(componentId)}
              className="p-1 text-xs bg-primary/10 rounded"
              title="Configure"
            >
              ⚙️
            </button>
            <button
              onClick={() => handleRemoveComponent(componentId)}
              className="p-1 text-xs bg-red-500/10 rounded"
              title="Remove"
            >
              ✖️
            </button>
          </div>
        )}
        
        <Component
          id={componentId}
          config={componentConfig}
          onConfigure={(newConfig) => handleConfigureComponent(componentId, newConfig)}
          isEditing={currentDashboard.isEditing}
        />
      </div>
    );
  };
  
  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <div>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="px-3 py-1 border rounded"
                placeholder="Dashboard Name"
              />
              <input
                type="text"
                value={dashboardDescription}
                onChange={(e) => setDashboardDescription(e.target.value)}
                className="px-3 py-1 border rounded"
                placeholder="Description (optional)"
              />
              <button
                onClick={() => setEditingName(false)}
                className="p-1 text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDashboard}
                className="px-3 py-1 bg-primary text-white rounded"
              >
                Save
              </button>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">{dashboardName}</h1>
              {dashboardDescription && (
                <p className="text-gray-500">{dashboardDescription}</p>
              )}
              {currentDashboard.isEditing && (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-sm text-primary"
                >
                  Edit name
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <select
            value={currentDashboard.id || ''}
            onChange={(e) => {
              if (e.target.value) {
                loadDashboard(e.target.value);
              } else {
                dispatch(resetCurrentDashboard());
              }
            }}
            className="px-3 py-1 border rounded"
          >
            <option value="">New Dashboard</option>
            {dashboards.map(dashboard => (
              <option key={dashboard._id} value={dashboard._id}>
                {dashboard.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => dispatch(toggleEditMode())}
            className={`px-3 py-1 rounded ${
              currentDashboard.isEditing
                ? 'bg-secondary text-white'
                : 'border'
            }`}
          >
            {currentDashboard.isEditing ? 'Done' : 'Edit'}
          </button>
          
          <button
            onClick={handleSaveDashboard}
            className="px-3 py-1 bg-primary text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
      
      {currentDashboard.isEditing && (
        <div className="mb-4 p-3 bg-secondary/10 rounded">
          <h3 className="text-md font-bold mb-2">Add Components</h3>
          <div className="flex flex-wrap gap-2">
            {getAvailableComponents().map(component => (
              <button
                key={component.type}
                onClick={() => handleAddComponent(component.type)}
                className="px-3 py-2 border rounded flex items-center gap-1 hover:bg-primary/10"
              >
                <span>{component.icon}</span>
                <span>{component.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="bg-background border rounded shadow-sm">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: currentDashboard.layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable={currentDashboard.isEditing}
          isResizable={currentDashboard.isEditing}
          margin={[10, 10]}
        >
          {Object.entries(currentDashboard.components).map(([id, { type, config }]) => (
            <div key={id} className="relative overflow-hidden">
              {renderComponent(id, type, config)}
            </div>
          ))}
        </ResponsiveGridLayout>
        
        {currentDashboard.layout.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            {currentDashboard.isEditing
              ? 'Add components to your dashboard from the panel above'
              : 'This dashboard is empty. Click Edit to add components.'}
          </div>
        )}
      </div>
    </div>
  );
};
```

This comprehensive set of examples should provide a clear understanding of how to integrate the API endpoints with various dashboard components.