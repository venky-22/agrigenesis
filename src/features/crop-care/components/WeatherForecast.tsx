
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getRealWeatherForecast } from '../services/weatherService';

interface WeatherDay {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

interface WeatherForecastProps {
  location: string;
  cropType: string;
}

// Mock weather data generator - in production, this would come from a real API
const generateMockForecast = (location: string): WeatherDay[] => {
  const conditions = [
    { name: 'Sunny', icon: 'fa-sun', temp: [78, 92] },
    { name: 'Partly Cloudy', icon: 'fa-cloud-sun', temp: [72, 85] },
    { name: 'Cloudy', icon: 'fa-cloud', temp: [68, 78] },
    { name: 'Rainy', icon: 'fa-cloud-rain', temp: [62, 72] },
    { name: 'Stormy', icon: 'fa-cloud-bolt', temp: [65, 75] }
  ];

  return Array.from({ length: 7 }, (_, index) => {
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const date = new Date();
    date.setDate(date.getDate() + index);

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

    return {
      day: dayName,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tempHigh: condition.temp[1] + Math.floor(Math.random() * 10 - 5),
      tempLow: condition.temp[0] + Math.floor(Math.random() * 10 - 5),
      humidity: 40 + Math.floor(Math.random() * 40),
      precipitation: condition.name === 'Rainy' ? 60 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 15),
      condition: condition.name,
      icon: condition.icon
    };
  });
};

const WeatherForecast: React.FC<WeatherForecastProps> = ({ location, cropType }) => {
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch real weather forecast data
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await getRealWeatherForecast(location);
        setForecast(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        // Fallback to mock data if API fails
        setForecast(generateMockForecast(location));
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  const getWeatherColor = (condition: string) => {
    switch (condition) {
      case 'Sunny': return 'from-yellow-400 to-orange-500';
      case 'Partly Cloudy': return 'from-blue-400 to-cyan-500';
      case 'Cloudy': return 'from-slate-400 to-slate-600';
      case 'Rainy': return 'from-blue-600 to-blue-800';
      case 'Stormy': return 'from-purple-600 to-indigo-800';
      default: return 'from-slate-400 to-slate-600';
    }
  };

  const getAgriculturalInsight = (day: WeatherDay) => {
    if (day.tempLow <= 0) {
      return { icon: 'fa-snowflake', text: 'Frost risk: cover tender crops', color: 'text-sky-400' };
    } else if (day.precipitation > 70) {
      return { icon: 'fa-triangle-exclamation', text: 'Postpone spraying & outdoor work', color: 'text-red-600' };
    } else if (day.tempHigh > 30) {
      return { icon: 'fa-fire', text: 'Increase irrigation frequency', color: 'text-orange-600' };
    } else if (day.humidity > 70) {
      return { icon: 'fa-droplet', text: 'Monitor for fungal diseases', color: 'text-blue-600' };
    } else if (day.windSpeed > 25) {
      return { icon: 'fa-wind', text: 'Secure loose structures', color: 'text-cyan-600' };
    } else {
      return { icon: 'fa-check-circle', text: 'Optimal conditions for field work', color: 'text-emerald-600' };
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-lg shadow-xl border border-white/20">
          <p className="font-bold text-slate-100">{payload[0].payload.day}</p>
          <p className="text-sm text-slate-300">{payload[0].name}: {payload[0].value}°C</p>
        </div>
      );
    }
    return null;
  };

  if (loading || forecast.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 md:px-6 py-3 md:py-4 text-white">
          <h3 className="text-base md:text-xl font-bold flex items-center gap-2">
            <i className="fas fa-cloud-sun text-sm md:text-base"></i>
            <span>Loading Weather...</span>
          </h3>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-300">Fetching real weather data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 md:px-6 py-3 md:py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-xl font-bold flex items-center gap-2">
              <i className="fas fa-cloud-sun text-sm md:text-base"></i>
              <span className="truncate">7-Day Forecast</span>
            </h3>
            <p className="text-xs md:text-sm text-blue-100 mt-1 truncate">
              <i className="fas fa-location-dot mr-1"></i>
              {location} • {cropType}
            </p>
          </div>
          <div className="flex gap-1 md:gap-2 shrink-0 ml-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <i className="fas fa-grid-2 md:mr-1"></i>
              <span className="hidden md:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                viewMode === 'chart'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <i className="fas fa-chart-line md:mr-1"></i>
              <span className="hidden md:inline">Charts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-6">
        {viewMode === 'cards' ? (
          <>
            {/* Daily Cards - Horizontal scroll on mobile, grid on desktop */}
            <div className="flex md:grid md:grid-cols-7 gap-2 md:gap-3 mb-4 md:mb-6 overflow-x-auto scrollbar-hide pb-2 -mx-3 px-3 md:mx-0 md:px-0">
              {forecast.map((day, index) => {
                const insight = getAgriculturalInsight(day);
                const isSelected = selectedDay === index;

                return (
                  <motion.div
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isSelected ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
                    className={`cursor-pointer rounded-xl transition-all duration-300 flex-shrink-0 w-20 md:w-auto ${
                      isSelected
                        ? 'bg-gradient-to-br ' + getWeatherColor(day.condition) + ' text-white shadow-xl'
                        : 'bg-white/5 backdrop-blur-md hover:bg-white/10 text-slate-100 border border-white/10'
                    }`}
                  >
                    <div className="p-3 md:p-4 text-center">
                      <p className={`text-[10px] md:text-xs font-bold mb-1 md:mb-2 ${isSelected ? 'text-white/90' : 'text-slate-300'}`}>
                        {day.day}
                      </p>
                      <p className={`text-[8px] md:text-[10px] mb-2 md:mb-3 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {day.date.split(' ')[0]}
                      </p>
                      <motion.i
                        animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className={`fas ${day.icon} text-xl md:text-3xl mb-2 md:mb-3 ${isSelected ? 'text-white' : 'text-slate-300'}`}
                      />
                      <div className="space-y-0.5 md:space-y-1">
                        <p className="text-sm md:text-lg font-bold">{day.tempHigh}°</p>
                        <p className={`text-[10px] md:text-xs ${isSelected ? 'text-white/70' : 'text-slate-300'}`}>
                          {day.tempLow}°
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Day Details */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-4 md:p-6"
              >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6 gap-3">
                <div className="flex-1">
                  <h4 className="text-lg md:text-2xl font-bold text-slate-100">
                    {forecast[selectedDay].day}, {forecast[selectedDay].date}
                  </h4>
                  <p className="text-sm md:text-base text-slate-300 flex items-center gap-2 mt-1">
                    <i className={`fas ${forecast[selectedDay].icon}`}></i>
                    {forecast[selectedDay].condition}
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-4xl md:text-5xl font-bold text-slate-100">{forecast[selectedDay].tempHigh}°</p>
                  <p className="text-sm md:text-base text-slate-300">Low: {forecast[selectedDay].tempLow}°C</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="bg-white/5 backdrop-blur-md rounded-lg p-2 md:p-4 border border-white/10">
                  <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-1 md:mb-0">
                      <i className="fas fa-droplet text-blue-400 text-xs md:text-base"></i>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-300">Precipitation</p>
                      <p className="text-base md:text-xl font-bold text-slate-100">{forecast[selectedDay].precipitation}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-lg p-2 md:p-4 border border-white/10">
                  <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center mb-1 md:mb-0">
                      <i className="fas fa-water text-cyan-400 text-xs md:text-base"></i>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-300">Humidity</p>
                      <p className="text-base md:text-xl font-bold text-slate-100">{forecast[selectedDay].humidity}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md rounded-lg p-2 md:p-4 border border-white/10">
                  <div className="flex flex-col md:flex-row items-center md:gap-3 text-center md:text-left">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-1 md:mb-0">
                      <i className="fas fa-wind text-purple-400 text-xs md:text-base"></i>
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-300">Wind Speed</p>
                      <p className="text-base md:text-xl font-bold text-slate-100">{forecast[selectedDay].windSpeed} km/h</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agricultural Insight */}
              <div className={`bg-gradient-to-r ${
                forecast[selectedDay].precipitation > 70 ? 'from-red-500/20 to-red-600/20 border-red-500/30' :
                forecast[selectedDay].tempHigh > 30 ? 'from-orange-500/20 to-orange-600/20 border-orange-500/30' :
                'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30'
              } border-2 rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 backdrop-blur-md`}>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${
                  forecast[selectedDay].precipitation > 70 ? 'bg-red-500' :
                  forecast[selectedDay].tempHigh > 30 ? 'bg-orange-500' :
                  'bg-emerald-500'
                } flex items-center justify-center text-white shrink-0`}>
                  <i className={`fas ${getAgriculturalInsight(forecast[selectedDay]).icon} text-sm md:text-base`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] md:text-xs font-bold text-slate-300 uppercase tracking-wide mb-0.5 md:mb-1">
                    Farm Advisory
                  </p>
                  <p className={`text-sm md:text-base font-bold ${getAgriculturalInsight(forecast[selectedDay]).color.replace('600', '400')}`}>
                    {getAgriculturalInsight(forecast[selectedDay]).text}
                  </p>
                </div>
              </div>
            </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <>
            {/* Temperature Chart */}
            <div className="mb-6">
              <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                <i className="fas fa-temperature-half text-orange-400"></i>
                Temperature Trend
              </h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={forecast}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="tempHigh" stroke="#f97316" fill="url(#tempGradient)" strokeWidth={2} />
                  <Area type="monotone" dataKey="tempLow" stroke="#3b82f6" fill="none" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Precipitation & Humidity Chart */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                  <i className="fas fa-cloud-rain text-blue-400"></i>
                  Precipitation Probability
                </h4>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="precipitation" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
                  <i className="fas fa-water text-cyan-400"></i>
                  Humidity Levels
                </h4>
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={forecast}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="humidity" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherForecast;
