
import React from 'react';

interface RiskGaugeProps {
  score: number;
  category: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, category }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s > 75) return '#ef4444'; // red-500
    if (s > 50) return '#f97316'; // orange-500
    if (s > 25) return '#eab308'; // yellow-500
    return '#22c55e'; // green-500
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-2xl shadow-lg border border-slate-700">
      <div className="relative flex items-center justify-center w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#334155"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-bold text-slate-100">{score}</span>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Risk Score</span>
        </div>
      </div>
      <div 
        className="mt-4 px-4 py-1 rounded-full text-white font-bold text-sm shadow-md"
        style={{ backgroundColor: color }}
      >
        {category} Risk
      </div>
    </div>
  );
};
