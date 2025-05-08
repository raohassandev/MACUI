import React, { useState, useEffect } from 'react';
import { AlertWidget as AlertWidgetType } from '../../../types/dashboard';

interface AlertWidgetProps {
  widget: AlertWidgetType;
}

interface Alert {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  source: string;
  message: string;
  description?: string;
  acknowledged: boolean;
}

export const AlertWidget: React.FC<AlertWidgetProps> = ({ widget }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // TODO: Replace with actual API call to fetch alerts
        // For now, generate mock alerts
        const mockAlerts = generateMockAlerts();
        setAlerts(mockAlerts);
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();

    // Set up polling interval if specified
    if (widget.refreshRate && widget.refreshRate > 0) {
      const interval = setInterval(fetchAlerts, widget.refreshRate);
      return () => clearInterval(interval);
    }
  }, [widget.refreshRate, widget.maxAlerts]);

  // Generate mock alerts
  const generateMockAlerts = (): Alert[] => {
    const alertLevels: ('info' | 'warning' | 'error')[] = ['info', 'warning', 'error'];
    const alertSources = [
      'Temperature Sensor 1',
      'Pressure Sensor 1',
      'Motor Controller',
      'Production Line',
      'Power Supply'
    ];
    
    const alertMessages = {
      info: [
        'System startup complete',
        'Maintenance scheduled',
        'Parameter updated',
        'Calibration successful',
      ],
      warning: [
        'High temperature detected',
        'Low pressure warning',
        'Battery level low',
        'Connection unstable',
      ],
      error: [
        'Critical temperature exceeded',
        'Pressure out of range',
        'Communication lost',
        'Emergency shutdown initiated',
      ]
    };

    // Generate between 0 and max alerts
    const maxAlerts = widget.maxAlerts || 5;
    const count = Math.floor(Math.random() * (maxAlerts + 1));
    
    // Generate alerts
    const mockAlerts: Alert[] = [];
    for (let i = 0; i < count; i++) {
      const level = alertLevels[Math.floor(Math.random() * alertLevels.length)];
      const source = alertSources[Math.floor(Math.random() * alertSources.length)];
      const message = alertMessages[level][Math.floor(Math.random() * alertMessages[level].length)];
      
      // Only include alerts that match the filter level
      if (widget.alertLevel && level !== widget.alertLevel && level !== 'error') {
        continue;
      }
      
      // Add to alerts list
      mockAlerts.push({
        id: `alert-${Date.now()}-${i}`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
        level,
        source,
        message,
        description: `Detailed information about the ${message.toLowerCase()} alert from ${source}`,
        acknowledged: Math.random() > 0.7,
      });
    }
    
    // Sort by timestamp, newest first
    return mockAlerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  // Get color for alert level
  const getAlertColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100';
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-green-500 dark:text-green-400">No active alerts</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto py-1">
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`rounded-md p-3 ${getAlertColor(alert.level)}`}
          >
            <div className="flex justify-between">
              <div className="font-medium">
                {alert.message}
              </div>
              {widget.showTimestamp && (
                <div className="text-xs opacity-75">
                  {formatTimestamp(alert.timestamp)}
                </div>
              )}
            </div>
            <div className="text-sm font-medium mt-1">
              {alert.source}
            </div>
            {widget.showDescription && alert.description && (
              <div className="text-xs mt-1 opacity-75">
                {alert.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};