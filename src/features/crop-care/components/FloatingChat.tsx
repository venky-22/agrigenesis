
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './ChatInterface';

interface FloatingChatProps {
  farmContext: any;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ farmContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  return (
    <>
      {/* Chat Popup */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-20 md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] md:w-[400px] shadow-2xl"
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <i className="fas fa-leaf text-white"></i>
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-emerald-600"></span>
                  </div>
                  <div>
                    <p className="font-bold text-white">Farm Assistant</p>
                    <p className="text-xs text-emerald-100">Online • Always here to help</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-white"></i>
                </button>
              </div>

              {/* Chat Content */}
              <div className="bg-transparent rounded-b-xl overflow-hidden">
                <ChatInterface farmContext={farmContext} isPopup={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-4 md:right-6 z-40 w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-emerald-500/50 transition-all duration-300 group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.i
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fas fa-times text-xl md:text-2xl"
            />
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <i className="fas fa-comment-dots text-xl md:text-2xl"></i>
              {hasNewMessage && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></span>
        )}
      </motion.button>

      {/* Helper tooltip (shows on first visit) */}
      {!isOpen && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed bottom-6 right-20 md:right-24 z-30 hidden md:block"
          >
            <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg shadow-xl border border-white/10 relative">
              <p className="text-sm font-medium text-slate-100">Need help? Ask me anything!</p>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-8 border-l-white/10"></div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export default FloatingChat;
