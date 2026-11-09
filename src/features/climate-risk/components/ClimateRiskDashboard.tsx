import { MapPin, Sprout, Search, Thermometer, Droplets, Leaf, ShieldAlert, Loader2, Info, Layers, CheckCircle, TrendingUp, Image as ImageIcon } from 'lucide-react';
import { RiskGauge } from './RiskGauge';
import { WeatherCharts } from './WeatherCharts';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { calculateRisk } from '../services/riskEngine';
import { RiskAssessment, CropType, SoilType } from '../types';

const Dashboard = () => {
    const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  // Prefilled from AgriGenesis (?lat=&lon=&crop=) or Truro, Nova Scotia
  const [params] = useSearchParams();
  const paramCrop = (params.get('crop') || '').toLowerCase() as CropType;
  const [lat, setLat] = useState<string>(params.get('lat') || '45.3650');
  const [lon, setLon] = useState<string>(params.get('lon') || '-63.2860');
  const [crop, setCrop] = useState<CropType>(['corn', 'wheat', 'tomato', 'soybean'].includes(paramCrop) ? paramCrop : 'wheat');
  const [soil, setSoil] = useState<SoilType>('loamy');

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await calculateRisk({
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        cropType: crop,
        soilType: soil
      });
      setAssessment(res);
    } catch (err) {
      setError("Failed to fetch climate data. Please check coordinates and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(4));
        setLon(pos.coords.longitude.toFixed(4));
      },
      () => setError("Unable to retrieve your location")
    );
  };

  const getConditionEmoji = (condition: string) => {
    switch (condition) {
      case 'Clear': return '☀️';
      case 'Partly Cloudy': return '⛅';
      case 'Fog': return '🌫️';
      case 'Rain': return '🌧️';
      case 'Snow': return '❄️';
      case 'Stormy': return '⛈️';
      default: return '🌡️';
    }
  };
  return (
    <main>
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Climate Risk</h1>
          <p className="text-slate-400 mt-1">Risk score from the last 30 days of weather and the 7-day forecast, plus crops suited to plant now.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          <section className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
              <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-emerald-500" />
                Parameters
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Target Crop</label>
                  <div className="relative">
                    <Sprout className="absolute left-3 top-3 w-5 h-5 text-slate-500 pointer-events-none" />
                    <select 
                      value={crop}
                      onChange={(e) => setCrop(e.target.value as CropType)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="corn">Corn</option>
                      <option value="wheat">Wheat</option>
                      <option value="tomato">Tomato</option>
                      <option value="soybean">Soybean</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Soil Type</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-3 w-5 h-5 text-slate-500 pointer-events-none" />
                    <select 
                      value={soil}
                      onChange={(e) => setSoil(e.target.value as SoilType)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                    >
                      <option value="loamy">Loamy (Balanced)</option>
                      <option value="clay">Clay (Heavy)</option>
                      <option value="sandy">Sandy (Light)</option>
                      <option value="silt">Silt (Smooth)</option>
                      <option value="peaty">Peaty (Organic)</option>
                      <option value="chalky">Chalky (Alkaline)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Latitude</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input 
                      type="number"
                      step="0.0001"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Longitude</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input 
                      type="number"
                      step="0.0001"
                      value={lon}
                      onChange={(e) => setLon(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleUseCurrentLocation}
                  className="w-full text-xs text-emerald-400 font-semibold hover:text-emerald-300 hover:underline mb-2"
                >
                  Use my current location
                </button>

                <button 
                  onClick={handleCalculate}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Run Deep Analysis"}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/40 text-red-300 text-sm rounded-lg border border-red-800">
                  {error}
                </div>
              )}
            </div>

            <div className="bg-slate-800 p-4 rounded-xl border border-emerald-900/50 flex gap-3">
              <Info className="w-8 h-8 text-emerald-500 shrink-0" />
              <p className="text-xs text-slate-300 leading-relaxed">
                AgriGenesis cross-references current atmospheric data with soil characteristics and seasonal trends to provide hyper-local planting guidance.
              </p>
            </div>
          </section>

          <section className="lg:col-span-3">
            {!assessment && !loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-slate-500 border-2 border-dashed border-slate-600 rounded-2xl bg-slate-800/50">
                <ShieldAlert className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg text-slate-400">Set location and soil type to begin agricultural risk assessment</p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
                <p className="text-slate-400 animate-pulse font-medium">Pulling 30-day weather history and the 7-day forecast...</p>
                <p className="text-xs text-slate-500 mt-2">AI is writing your risk insight and planting suggestions</p>
              </div>
            )}

            {assessment && !loading && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <RiskGauge score={assessment.score} category={assessment.category} />
                  
                  <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <IndexCard 
                      icon={<Thermometer className="text-orange-500" />} 
                      label="Heat Stress" 
                      value={`${(assessment.indices.heatStress * 100).toFixed(0)}%`} 
                    />
                    <IndexCard 
                      icon={<Droplets className="text-blue-500" />} 
                      label="Drought Index" 
                      value={`${(assessment.indices.droughtIndex * 100).toFixed(0)}%`} 
                    />
                    <IndexCard 
                      icon={<Leaf className="text-emerald-500" />} 
                      label="Veg Stress" 
                      value={assessment.ndvi.toString()} 
                      secondaryLabel="NDVI (simulated)"
                    />
                    
                    <div className="sm:col-span-3 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                      <h3 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-emerald-500" />
                        AI Climate Insight
                      </h3>
                      <p className="text-slate-300 leading-relaxed italic">
                        "{assessment.aiExplanation}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Seasonal Planting Recommendations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {assessment.plantingSuggestions.map((s, idx) => (
                      <div key={idx} className="flex flex-col bg-slate-700/50 rounded-xl border border-slate-600 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-500 transition">
                        <div className="h-40 bg-slate-700 relative group overflow-hidden">
                          {s.imageUrl ? (
                            <img 
                              src={s.imageUrl} 
                              alt={s.crop} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                              <ImageIcon className="w-10 h-10 mb-2" />
                              <span className="text-[10px] uppercase font-bold tracking-widest">Image Unavailable</span>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${s.suitability === 'High' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-emerald-900/60 text-emerald-300 shadow-md'}`}>
                              {s.suitability} Fit
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-slate-800/80 flex-1">
                          <h4 className="font-bold text-emerald-400 mb-1 flex items-center gap-1">
                            <Sprout className="w-4 h-4 text-emerald-500" />
                            {s.crop}
                          </h4>
                          <p className="text-xs text-slate-400 leading-snug">{s.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <WeatherCharts weatherData={assessment.historicalData} ndviData={assessment.historicalNdvi} />

                <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">7-Day Local Forecast</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {assessment.forecast.map((f, i) => (
                      <div key={i} className="flex-shrink-0 w-32 bg-slate-700/50 p-4 rounded-xl flex flex-col items-center border border-slate-600 shadow-sm">
                        <span className="text-xs text-slate-400 mb-1 font-medium">{new Date(f.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <div className="text-3xl mb-1">{getConditionEmoji(f.condition)}</div>
                        <span className={`text-xl font-bold ${f.temp > 35 ? 'text-red-400' : 'text-slate-200'}`}>{f.temp}°</span>
                        <span className="text-[10px] text-slate-500 mt-1 uppercase text-center leading-tight font-semibold">{f.condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
  )
}

interface IndexCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    secondaryLabel?: string;
  }
  
const IndexCard: React.FC<IndexCardProps> = ({ icon, label, value, secondaryLabel }) => (
<div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center justify-center">
    <div className="mb-2">{icon}</div>
    <span className="text-2xl font-bold text-slate-100">{value}</span>
    <span className="text-xs text-slate-400 uppercase font-medium mt-1 text-center">{label}</span>
    {secondaryLabel && <span className="text-[10px] text-slate-500 mt-0.5">{secondaryLabel}</span>}
</div>
);

export default Dashboard