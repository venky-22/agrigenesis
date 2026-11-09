
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingChat from './components/FloatingChat';
import RiskChart from './components/RiskChart';
import VisionDiagnosis from './components/VisionDiagnosis';
import WeatherForecast from './components/WeatherForecast';
import YieldPrediction from './components/YieldPrediction';
import FinancialDashboard from './components/FinancialDashboard';
import MarkdownRenderer from './components/MarkdownRenderer';
import RecommendationCard from './components/RecommendationCard';
import AnimatedButton from './components/AnimatedButton';
import BottomSheet from './components/BottomSheet';
import { ModalTransition, SlideUp, StaggerChildren, StaggerItem } from './components/PageTransition';
import { ToastProvider, useToast } from './components/Toast';
import { analyzeCropRisk, getWeatherForecast } from './services/aiService';
import { FarmState, Recommendation } from './types';
import { AI_ENABLED } from '../../services/ai';

const AppContent: React.FC = () => {
  const toast = useToast();
  const [params] = useSearchParams();

  const [farm, setFarm] = useState<FarmState>({
    // Prefilled from AgriGenesis (?crop=&location=&acres=) or Nova Scotia pilot defaults
    cropType: params.get('crop') || 'Potatoes',
    location: params.get('location') || 'Truro, Nova Scotia',
    fieldSize: `${params.get('acres') || 10} Acres`,
    risks: [
      { label: 'Heat', score: 35, color: 'orange', description: 'Moderate heat stress predicted next week.' },
      { label: 'Drought', score: 65, color: 'red', description: 'Soil moisture levels are critical.' },
      { label: 'Flood', score: 10, color: 'blue', description: 'Low risk of precipitation extremes.' }
    ]
  });

  const [loadingRisks, setLoadingRisks] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  const [showForecast, setShowForecast] = useState(false);
  const [isFetchingForecast, setIsFetchingForecast] = useState(false);
  const [forecastData, setForecastData] = useState<{ text: string; sources: any[] } | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRisksMobile, setShowRisksMobile] = useState(false);
  const [expectedYield, setExpectedYield] = useState<number | undefined>(undefined);

  useEffect(() => {
    setRecommendations([
      { id: '1', title: 'Schedule Night Irrigation', priority: 'High', action: 'Water between 9PM and 4AM to minimize evaporation.', category: 'Irrigation' },
      { id: '2', title: 'Check Shade Cloths', priority: 'Medium', action: 'Ensure north-facing sections are covered by Tuesday.', category: 'Protection' },
      { id: '3', title: 'Monitor Soil pH', priority: 'Low', action: 'Next testing cycle recommended in 14 days.', category: 'Soil' }
    ]);
  }, []);

  // Replace the sample risk numbers with a real AI assessment on first load
  useEffect(() => { if (AI_ENABLED) refreshRisks(); }, []);

  const refreshRisks = async () => {
    setLoadingRisks(true);
    try {
      const data = await analyzeCropRisk(farm.cropType, farm.location);
      setFarm(prev => ({ ...prev, risks: data.risks }));
      toast.success('Risk analysis updated successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update risk analysis. Please try again.');
    } finally {
      setLoadingRisks(false);
    }
  };

  const handleViewForecast = async () => {
    setShowForecast(true);
    setIsFetchingForecast(true);
    try {
      const data = await getWeatherForecast(farm.cropType, farm.location);
      setForecastData(data);
    } catch (e) {
      console.error(e);
      setForecastData({ text: "Error fetching weather data. Please try again later.", sources: [] });
    } finally {
      setIsFetchingForecast(false);
    }
  };

  const handleCompleteRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
    setCompletedCount(prev => prev + 1);
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
  };

  return (
    <div className="relative">


      <ModalTransition isOpen={showForecast} onClose={() => setShowForecast(false)}>
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-emerald-500/20 backdrop-blur-md text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <i className="fas fa-cloud-sun"></i>
                Detailed Agricultural Insights & Forecast
              </h3>
              <button onClick={() => setShowForecast(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 bg-black/20 backdrop-blur-sm">
              {isFetchingForecast ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-300 animate-pulse font-medium">Analyzing real-time meteorological data...</p>
                </div>
              ) : (
                <div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-6 shadow-xl">
                    <div className="flex-1 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <i className="fas fa-location-dot"></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Region</p>
                        <p className="text-xl font-bold text-slate-100">{farm.location}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <i className="fas fa-seedling"></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Crop</p>
                        <p className="text-xl font-bold text-slate-100">{farm.cropType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-xl">
                    <MarkdownRenderer content={forecastData?.text || ""} />
                  </div>

                  {forecastData?.sources && forecastData.sources.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Grounding Sources</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {forecastData.sources.map((source: any, i: number) => (
                          <a
                            key={i}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/5 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 p-3 rounded-xl border border-white/10 hover:border-emerald-500/30 transition-all flex items-center gap-3 backdrop-blur-md"
                          >
                            <i className="fas fa-external-link-alt text-xs opacity-50"></i>
                            <span className="text-xs font-medium truncate">{source.title || 'Official Weather Bulletin'}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </ModalTransition>


      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Crop Care</h1>
        <p className="text-muted-foreground mt-1">In-season monitoring: diagnose plant photos, track climate risks, forecast yield and costs, and ask the farm assistant.</p>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">

        {/* Left Column: Farm Profile, Risks, Recommendations */}
        <StaggerChildren className="lg:col-span-4 space-y-4 md:space-y-6">
          <StaggerItem>
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' }}
              transition={{ duration: 0.2 }}
              className="bg-white/5 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-xl border border-white/10"
            >
            <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <i className="fas fa-map-marked-alt text-emerald-400"></i>
              Farm Profile
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Crop</label>
                <input
                  type="text"
                  value={farm.cropType}
                  onChange={(e) => setFarm({...farm, cropType: e.target.value})}
                  className="input-field w-full mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={farm.location}
                  onChange={(e) => setFarm({...farm, location: e.target.value})}
                  className="input-field w-full mt-1"
                />
              </div>
              <AnimatedButton
                onClick={refreshRisks}
                loading={loadingRisks}
                variant="secondary"
                className="w-full"
                icon={loadingRisks ? undefined : 'fa-bolt'}
              >
                {loadingRisks ? 'Updating...' : 'Update Risk Intelligence'}
              </AnimatedButton>
            </div>
          </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' }}
              transition={{ duration: 0.2 }}
              className="bg-white/5 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-slate-100">Climate Vulnerability</h3>
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[10px] px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-full font-bold"
                >
                  REAL-TIME
                </motion.span>
              </div>
            <div className="hidden md:block">
              <RiskChart risks={farm.risks} />
            </div>
            <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
              {farm.risks.map((risk, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-300 font-medium">{risk.label}</span>
                    <span className={`font-bold ${risk.score > 60 ? 'text-red-400' : risk.score > 30 ? 'text-orange-400' : 'text-emerald-400'}`}>{risk.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${risk.score}%`, backgroundColor: risk.score > 60 ? '#ef4444' : risk.score > 30 ? '#f97316' : '#10b981' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          </StaggerItem>

          <StaggerItem>
            <motion.div
              whileHover={{ y: -2, boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)' }}
              transition={{ duration: 0.2 }}
              className="bg-white/5 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold text-slate-100 flex items-center gap-2">
                  <motion.i
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="fas fa-lightbulb text-emerald-400"
                  />
                  Smart Directives
                </h3>
                {completedCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xs bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-1 rounded-full font-medium"
                  >
                    {completedCount} completed
                  </motion.span>
                )}
              </div>
            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.id}
                    recommendation={rec}
                    onComplete={handleCompleteRecommendation}
                    onDismiss={handleDismissRecommendation}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <i className="fas fa-check-circle text-3xl mb-2"></i>
                  <p className="text-sm">All recommendations completed!</p>
                </div>
              )}
            </div>
          </motion.div>
          </StaggerItem>

          <StaggerItem>
            <VisionDiagnosis />
          </StaggerItem>
        </StaggerChildren>

        {/* Right Column: Weather, Yield, Financial */}
        <StaggerChildren className="lg:col-span-8 space-y-4 md:space-y-6">

          {/* Weather Forecast Dashboard */}
          <StaggerItem>
            <SlideUp>
              <WeatherForecast location={farm.location} cropType={farm.cropType} />
            </SlideUp>
          </StaggerItem>

          {/* Yield Prediction Dashboard */}
          <StaggerItem>
            <SlideUp>
              <YieldPrediction
                cropType={farm.cropType}
                location={farm.location}
                fieldSize={farm.fieldSize}
                risks={farm.risks}
                onPrediction={setExpectedYield}
              />
            </SlideUp>
          </StaggerItem>

          {/* Financial Dashboard */}
          <StaggerItem>
            <SlideUp>
              <FinancialDashboard
                cropType={farm.cropType}
                fieldSize={farm.fieldSize}
                expectedYield={expectedYield}
              />
            </SlideUp>
          </StaggerItem>
        </StaggerChildren>
      </main>

      {/* Floating Chat Assistant */}
      <FloatingChat farmContext={farm} />

    </div>
  );
};

const CropCarePage: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default CropCarePage;
