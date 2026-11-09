
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Recommendation } from '../types';
import { useToast } from './Toast';
import AnimatedButton from './AnimatedButton';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onComplete: (id: string) => void;
  onDismiss: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onComplete,
  onDismiss
}) => {
  const toast = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const getCategoryIcon = (category: Recommendation['category']) => {
    switch (category) {
      case 'Irrigation': return 'fa-droplet';
      case 'Protection': return 'fa-shield';
      case 'Harvest': return 'fa-wheat';
      case 'Soil': return 'fa-seedling';
    }
  };

  const getPriorityStyles = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const handleComplete = () => {
    setIsCompleted(true);
    toast.success(`Completed: ${recommendation.title}`);
    setTimeout(() => onComplete(recommendation.id), 300);
  };

  const handleDismiss = () => {
    toast.info(`Dismissed: ${recommendation.title}`);
    onDismiss(recommendation.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={!isCompleted ? { scale: 1.02, y: -2 } : {}}
      className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${
        isCompleted
          ? 'bg-emerald-500/20 backdrop-blur-md border-emerald-500/30 opacity-75'
          : 'bg-white/5 backdrop-blur-md border-white/10 hover:border-emerald-500/30 hover:shadow-xl'
      }`}
      onClick={() => !isCompleted && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start gap-3">
        <motion.div
          animate={isCompleted ? { rotate: 360 } : {}}
          transition={{ duration: 0.5 }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isCompleted ? 'bg-emerald-500' : 'bg-white/5 backdrop-blur-md group-hover:bg-emerald-500/20'
          } transition-colors duration-200`}
        >
          <i className={`fas ${isCompleted ? 'fa-check text-white' : `${getCategoryIcon(recommendation.category)} text-emerald-400`}`}></i>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className={`text-sm font-bold ${
              isCompleted ? 'text-emerald-300 line-through' : 'text-slate-100 group-hover:text-emerald-300'
            } transition-colors`}>
              {recommendation.title}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${
              getPriorityStyles(recommendation.priority)
            }`}>
              {recommendation.priority}
            </span>
          </div>

          <p className={`text-xs text-slate-300 leading-relaxed mb-3 ${
            isExpanded ? '' : 'line-clamp-2'
          }`}>
            {recommendation.action}
          </p>

          {!isCompleted && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={isExpanded ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-2 overflow-hidden"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete();
                }}
                className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium px-3 py-2 rounded-lg hover:bg-emerald-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-check"></i>
                Mark Complete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                className="flex-1 bg-white/5 backdrop-blur-md text-slate-300 text-xs font-medium px-3 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <i className="fas fa-times"></i>
                Dismiss
              </button>
            </motion.div>
          )}

          {isCompleted && (
            <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <i className="fas fa-check-circle"></i>
              Completed
            </p>
          )}
        </div>
      </div>

      {!isCompleted && (
        <div className="mt-2 text-center">
          <motion.i
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="fas fa-chevron-down text-[10px] text-slate-400"
          />
        </div>
      )}
    </motion.div>
  );
};

export default RecommendationCard;
