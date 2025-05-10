import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/layout/Card';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Widget } from '../../../types/dashboard';

// Define consistent data shape
interface DataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface SimpleChartWidgetProps {
  widget: Widget;
}

const SimpleChartWidget: React.FC<SimpleChartWidgetProps> = ({ widget }) => {
  // Define all hooks upfront - no conditional hooks
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Generate sample data (in real app, this would be API data)
  useEffect(() => {
    const generateData = () => {
      setLoading(true);
      
      try {
        // Create a stable data set regardless of chart type
        const generatedData: DataPoint[] = [];
        const dataPoints = 7;
        
        for (let i = 0; i < dataPoints; i++) {
          generatedData.push({
            name: `Point ${i+1}`,
            value: Math.floor(Math.random() * 100),
            value2: Math.floor(Math.random() * 80),
            value3: Math.floor(Math.random() * 60)
          });
        }
        
        setData(generatedData);
        setError(null);
      } catch (err) {
        setError('Error generating chart data');
        console.error('Chart data error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    generateData();
    
    // Setup refresh interval if configured
    const refreshInterval = widget.config?.refreshInterval || 0;
    let intervalId: number | undefined;
    
    if (refreshInterval > 0) {
      intervalId = window.setInterval(generateData, refreshInterval * 1000);
    }
    
    // Clean up on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [widget.id, widget.config?.refreshInterval]);
  
  // Render appropriate chart based on widget.config.chartType
  const renderChart = () => {
    if (loading) {
      return <div className="flex justify-center items-center h-full">Loading chart data...</div>;
    }
    
    if (error) {
      return <div className="text-red-500 p-4">{error}</div>;
    }
    
    const chartType = widget.config?.chartType || 'line';
    const chartTitle = widget.config?.title || 'Chart';
    const chartColor = widget.config?.color || '#3B82F6';
    
    // Common props for all charts
    const commonProps = {
      width: '100%',
      height: '100%',
      data: data
    };
    
    // Return appropriate chart based on type
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={chartColor} />
              <Bar dataKey="value2" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" fill={chartColor} stroke={chartColor} />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill={chartColor}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={chartColor} />
              <Line type="monotone" dataKey="value2" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <Card
      title={widget.config?.title || 'Chart'}
      className="widget-content chart-widget"
      bodyClassName="chart-container"
    >
      <div className="chart-container">
        {renderChart()}
      </div>
    </Card>
  );
};

export default SimpleChartWidget;