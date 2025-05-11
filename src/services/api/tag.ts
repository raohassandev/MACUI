/**
 * Tag API Service
 * 
 * This service handles all tag-related API calls
 */

import { Tag } from '../../types/dashboard';

// Mock API base URL - replace with actual API URL in production
const API_BASE_URL = '/api';

/**
 * Get all tags
 * @returns Promise<Tag[]>
 */
export const fetchTags = async (): Promise<Tag[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tags:', error);
    // Return mock data for development
    return mockTags;
  }
};

/**
 * Get a tag by ID
 * @param id Tag ID
 * @returns Promise<Tag>
 */
export const fetchTagById = async (id: string): Promise<Tag> => {
  try {
    // Skip actual API call in development to avoid HTML errors
    // Uncomment below when API is ready
    // const response = await fetch(`${API_BASE_URL}/tags/${id}`);
    // if (!response.ok) {
    //   throw new Error(`Failed to fetch tag: ${response.statusText}`);
    // }
    // return await response.json();

    // Always use mock data for now to avoid HTML errors
    const mockTag = mockTags.find(t => t.id === id);
    if (!mockTag) {
      throw new Error(`Tag with id ${id} not found`);
    }
    return mockTag;
  } catch (error) {
    console.error(`Error fetching tag ${id}:`, error);
    // Return mock data for development
    return mockTags.find(t => t.id === id) || mockTags[0];
  }
};

/**
 * Get historical data for a tag
 * @param id Tag ID
 * @param timeRange Time range in milliseconds
 * @param points Number of data points
 * @returns Promise<{ timestamp: string, value: any }[]>
 */
export const fetchTagHistory = async (
  id: string, 
  timeRange: number = 3600000, // Default: 1 hour
  points: number = 100 // Default: 100 points
): Promise<{ timestamp: string, value: any }[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/tags/${id}/history?timeRange=${timeRange}&points=${points}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch tag history: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching history for tag ${id}:`, error);
    // Generate mock historical data
    return generateMockHistory(id, timeRange, points);
  }
};

/**
 * Generate mock historical data for a tag
 */
const generateMockHistory = (
  id: string, 
  timeRange: number, 
  points: number
): { timestamp: string, value: any }[] => {
  const tag = mockTags.find(t => t.id === id);
  if (!tag || tag.valueType === 'string') {
    return [];
  }

  const now = Date.now();
  const result = [];
  const interval = timeRange / points;

  // Generate data based on tag type
  if (tag.valueType === 'number') {
    const baseValue = typeof tag.lastValue === 'number' ? tag.lastValue : 
      (tag.minValue !== undefined && tag.maxValue !== undefined ? tag.minValue + (tag.maxValue - tag.minValue) / 2 : 50);
    const amplitude = tag.maxValue !== undefined && tag.minValue !== undefined ? 
      (tag.maxValue - tag.minValue) / 4 : 10;

    for (let i = 0; i < points; i++) {
      const time = new Date(now - (points - i - 1) * interval);
      // Generate a somewhat realistic fluctuating value
      const noise = Math.sin(i / 5) * amplitude * 0.5 + (Math.random() - 0.5) * amplitude;
      let value = baseValue + noise;
      
      // Ensure value is within min/max if defined
      if (tag.minValue !== undefined) {
        value = Math.max(tag.minValue, value);
      }
      if (tag.maxValue !== undefined) {
        value = Math.min(tag.maxValue, value);
      }
      
      result.push({
        timestamp: time.toISOString(),
        value: parseFloat(value.toFixed(2))
      });
    }
  } else if (tag.valueType === 'boolean') {
    const baseValue = Boolean(tag.lastValue);
    let currentValue = baseValue;
    
    for (let i = 0; i < points; i++) {
      const time = new Date(now - (points - i - 1) * interval);
      // Occasionally change boolean value
      if (Math.random() < 0.1) {
        currentValue = !currentValue;
      }
      
      result.push({
        timestamp: time.toISOString(),
        value: currentValue
      });
    }
  }

  return result;
};

// Mock tags data for development
export const mockTags: Tag[] = [
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'machine-status-1',
    name: 'Machine Status',
    description: 'Current machine status',
    valueType: 'number',
    refreshRate: 5000,
    status: 'active',
    lastValue: 2, // Running
    lastUpdated: new Date().toISOString(),
  },
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
    lastUpdated: new Date().toISOString(),
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
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'motor-status-1',
    name: 'Motor 1 Status',
    description: 'Status of production line motor 1',
    valueType: 'boolean',
    refreshRate: 5000,
    status: 'active',
    lastValue: true,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'valve-position-1',
    name: 'Valve 1 Position',
    description: 'Position of control valve 1',
    valueType: 'number',
    unit: '%',
    minValue: 0,
    maxValue: 100,
    refreshRate: 5000,
    status: 'active',
    lastValue: 45,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'humidity-sensor-1',
    name: 'Humidity Sensor 1',
    description: 'Production area humidity sensor',
    valueType: 'number',
    unit: '%',
    minValue: 0,
    maxValue: 100,
    refreshRate: 10000,
    status: 'active',
    lastValue: 55.8,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'alarm-status-1',
    name: 'System Alarms',
    description: 'Active system alarms',
    valueType: 'number',
    refreshRate: 5000,
    status: 'active',
    lastValue: 0, // No alarms
    lastUpdated: new Date().toISOString(),
  },
];