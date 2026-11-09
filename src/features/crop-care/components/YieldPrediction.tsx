
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictYield, YieldPrediction as YieldPredictionType } from '../services/aiService';
import { CropRisk } from '../types';
import { useToast } from './Toast';

interface YieldPredictionProps {
  cropType: string;
  location: string;
  fieldSize: string;
  risks: CropRisk[];
  onPrediction?: (expectedYieldPerAcre: number) => void;
}

const YieldPrediction: React.FC<YieldPredictionProps> = ({ cropType, location, fieldSize, risks, onPrediction }) => {
  const toast = useToast();
  const [prediction, setPrediction] = useState<YieldPredictionType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const fetchPrediction = async () => {
    setIsLoading(true);
    try {
      const data = await predictYield(cropType, location, fieldSize, risks);
      setPrediction(data);
      onPrediction?.(data.expectedYield?.medium);
      setLastFetchTime(new Date());
      toast.success('Yield prediction updated!');
    } catch (error) {
      console.error('Error fetching yield prediction:', error);
      toast.error('Failed to fetch yield prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, []);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-400';
    if (confidence >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceBgColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-emerald-500/20 border border-emerald-500/30';
    if (confidence >= 60) return 'bg-yellow-500/20 border border-yellow-500/30';
    return 'bg-orange-500/20 border border-orange-500/30';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading && !prediction) {
    return (
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/10">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-300 font-medium animate-pulse">Analyzing yield potential...</p>
          <p className="text-xs text-slate-400">Processing weather patterns, soil data, and market conditions</p>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="bg-white/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/10">
        <div className="text-center text-slate-400">
          <i className="fas fa-chart-line text-4xl mb-4"></i>
          <p>No prediction data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fas fa-chart-line text-white"></i>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Yield Prediction</h3>
            <p className="text-xs text-emerald-100">
              AI-Powered Harvest Forecast
            </p>
          </div>
        </div>
        <button
          onClick={fetchPrediction}
          disabled={isLoading}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
        >
          <i className={`fas fa-sync-alt ${isLoading ? 'animate-spin' : ''}`}></i>
          Refresh
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Confidence Badge */}
        <div className="flex items-center justify-between">
          <div className={`px-4 py-2 rounded-full ${getConfidenceBgColor(prediction.confidence)} flex items-center gap-2`}>
            <i className={`fas fa-shield-alt ${getConfidenceColor(prediction.confidence)}`}></i>
            <span className={`font-bold ${getConfidenceColor(prediction.confidence)}`}>
              {prediction.confidence}% Confidence
            </span>
          </div>
          {lastFetchTime && (
            <span className="text-xs text-slate-400">
              Updated {lastFetchTime.toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Main Yield Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Low Scenario */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-arrow-down text-orange-400 text-sm"></i>
              <span className="text-xs font-bold text-slate-300 uppercase">Pessimistic</span>
            </div>
            <p className="text-3xl font-bold text-slate-100">
              {prediction.expectedYield.low}
            </p>
            <p className="text-sm text-slate-300">{prediction.expectedYield.unit}/acre</p>
            <p className="text-xs text-orange-400 font-medium mt-2">
              {formatCurrency(prediction.revenueProjection.low)}
            </p>
          </motion.div>

          {/* Medium Scenario (Most Likely) */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-emerald-500/20 backdrop-blur-md border-2 border-emerald-500/30 rounded-xl p-4 relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <span className="text-[8px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                MOST LIKELY
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-bullseye text-emerald-400 text-sm"></i>
              <span className="text-xs font-bold text-emerald-300 uppercase">Expected</span>
            </div>
            <p className="text-4xl font-bold text-emerald-100">
              {prediction.expectedYield.medium}
            </p>
            <p className="text-sm text-emerald-200">{prediction.expectedYield.unit}/acre</p>
            <p className="text-sm text-emerald-200 font-bold mt-2">
              {formatCurrency(prediction.revenueProjection.medium)}
            </p>
          </motion.div>

          {/* High Scenario */}
          <motion.div
            whileHover={{ y: -2 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <i className="fas fa-arrow-up text-emerald-400 text-sm"></i>
              <span className="text-xs font-bold text-slate-300 uppercase">Optimistic</span>
            </div>
            <p className="text-3xl font-bold text-slate-100">
              {prediction.expectedYield.high}
            </p>
            <p className="text-sm text-slate-300">{prediction.expectedYield.unit}/acre</p>
            <p className="text-xs text-emerald-400 font-medium mt-2">
              {formatCurrency(prediction.revenueProjection.high)}
            </p>
          </motion.div>
        </div>

        {/* Harvest Date */}
        <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center">
            <i className="fas fa-calendar-check text-blue-400 text-lg"></i>
          </div>
          <div>
            <p className="text-xs font-bold text-blue-400 uppercase">Estimated Harvest Date</p>
            <p className="text-xl font-bold text-blue-200">{prediction.harvestDate}</p>
          </div>
        </div>

        {/* Regional Comparison */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-100">vs. Regional Average</span>
            <span className="text-xs text-slate-300">{prediction.regionalAverage} {prediction.expectedYield.unit}/acre</span>
          </div>
          <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(prediction.expectedYield.medium / prediction.regionalAverage) * 100}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={`h-full rounded-full ${
                prediction.expectedYield.medium >= prediction.regionalAverage
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600'
              }`}
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {prediction.expectedYield.medium >= prediction.regionalAverage ? (
              <>
                <i className="fas fa-arrow-up text-emerald-400 text-xs"></i>
                <span className="text-xs text-emerald-300 font-medium">
                  {((prediction.expectedYield.medium - prediction.regionalAverage) / prediction.regionalAverage * 100).toFixed(1)}% above average
                </span>
              </>
            ) : (
              <>
                <i className="fas fa-arrow-down text-orange-400 text-xs"></i>
                <span className="text-xs text-orange-300 font-medium">
                  {((prediction.regionalAverage - prediction.expectedYield.medium) / prediction.regionalAverage * 100).toFixed(1)}% below average
                </span>
              </>
            )}
          </div>
        </div>

        {/* Factors Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Factors */}
          <div className="border border-emerald-500/30 rounded-xl p-4 bg-emerald-500/20 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-check-circle text-emerald-400"></i>
              <h4 className="font-bold text-emerald-200">Positive Factors</h4>
            </div>
            <ul className="space-y-2">
              {prediction.factors.positive.map((factor, idx) => (
                <li key={idx} className="text-sm text-emerald-300 flex items-start gap-2">
                  <i className="fas fa-plus text-emerald-400 text-xs mt-1"></i>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Negative Factors */}
          <div className="border border-orange-500/30 rounded-xl p-4 bg-orange-500/20 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <i className="fas fa-exclamation-triangle text-orange-400"></i>
              <h4 className="font-bold text-orange-200">Risk Factors</h4>
            </div>
            <ul className="space-y-2">
              {prediction.factors.negative.map((factor, idx) => (
                <li key={idx} className="text-sm text-orange-300 flex items-start gap-2">
                  <i className="fas fa-minus text-orange-400 text-xs mt-1"></i>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-500/20 backdrop-blur-md border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-lightbulb text-blue-400 text-lg"></i>
            <h4 className="font-bold text-blue-200">AI Recommendations to Maximize Yield</h4>
          </div>
          <div className="space-y-2">
            {prediction.recommendations.map((rec, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-lg"
              >
                <span className="w-6 h-6 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </span>
                <p className="text-sm text-slate-300">{rec}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YieldPrediction;
