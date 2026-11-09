
import React, { useRef } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9]
}) => {
  const dragControls = useDragControls();
  const [snapPoint, setSnapPoint] = React.useState(snapPoints[0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;

    // If dragging down with sufficient velocity or distance, close
    if (offset.y > 100 || velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 py-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <i className="fas fa-times text-slate-600"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
