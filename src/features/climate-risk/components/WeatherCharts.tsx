
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { WeatherDataPoint, NDVIPoint } from '../types';

interface WeatherChartsProps {
  weatherData: WeatherDataPoint[];
  ndviData: NDVIPoint[];
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ weatherData, ndviData }) => {
  return (
    <div className="grid grid-cols-1 gap-6 w-full mt-6">
      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">30-Day Max Temperature (°C)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                tickFormatter={(val) => val.split('-')[2]} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
              />
              <Line 
                type="monotone" 
                dataKey="maxTemp" 
                stroke="#f97316" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Daily Precipitation (mm)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weatherData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                tickFormatter={(val) => val.split('-')[2]} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
              />
              <Area 
                type="monotone" 
                dataKey="precipitation" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">30-Day NDVI (simulated until satellite data is connected)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ndviData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                tickFormatter={(val) => val.split('-')[2]} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis domain={[0, 1]} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="NDVI"
                stroke="#10b981" 
                strokeWidth={3} 
                dot={false}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
