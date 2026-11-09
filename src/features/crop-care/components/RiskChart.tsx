
import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CropRisk } from '../types';

interface RiskChartProps {
  risks: CropRisk[];
}

const RiskChart: React.FC<RiskChartProps> = ({ risks }) => {
  const [activeRisk, setActiveRisk] = useState<string | null>(null);

  const data = risks.map(r => ({
    subject: r.label,
    score: r.score,
    fullMark: 100,
  }));

  // Determine overall risk color based on max score
  const maxScore = Math.max(...risks.map(r => r.score));
  const chartColor = maxScore > 60 ? '#ef4444' : maxScore > 30 ? '#f59e0b' : '#10b981';
  const chartColorSecondary = maxScore > 60 ? '#dc2626' : maxScore > 30 ? '#d97706' : '#059669';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const risk = risks.find(r => r.label === payload[0].payload.subject);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 animate-scale-in">
          <p className="font-bold text-slate-800 mb-1">{payload[0].payload.subject}</p>
          <p className={`text-lg font-bold ${
            payload[0].value > 60 ? 'text-red-500' :
            payload[0].value > 30 ? 'text-orange-500' :
            'text-emerald-500'
          }`}>
            {payload[0].value}% Risk
          </p>
          {risk && (
            <p className="text-xs text-slate-600 mt-1 max-w-xs">{risk.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full relative group">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle, ${chartColor}20 0%, transparent 70%)`
        }}
      />

      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="75%"
          data={data}
          className="transition-all duration-700 ease-out"
        >
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={chartColorSecondary} stopOpacity={0.3}/>
            </linearGradient>
          </defs>

          <PolarGrid
            stroke="#e2e8f0"
            strokeWidth={1.5}
            className="opacity-60"
          />

          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: '#475569',
              fontSize: 13,
              fontWeight: 600
            }}
          />

          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: '#94a3b8',
              fontSize: 10
            }}
            tickCount={6}
          />

          <Tooltip content={<CustomTooltip />} />

          <Radar
            name="Risk Level"
            dataKey="score"
            stroke={chartColor}
            strokeWidth={3}
            fill="url(#riskGradient)"
            fillOpacity={0.6}
            animationBegin={0}
            animationDuration={1500}
            animationEasing="ease-out"
            onMouseEnter={(data: any) => setActiveRisk(data.subject)}
            onMouseLeave={() => setActiveRisk(null)}
            className="transition-all duration-300 hover:drop-shadow-lg"
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Risk Legend */}
      <div className="absolute bottom-2 right-2 flex gap-2 text-[10px] font-medium bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-slate-600">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <span className="text-slate-600">Med</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-slate-600">High</span>
        </div>
      </div>
    </div>
  );
};

export default RiskChart;
