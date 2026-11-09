
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { getChatResponse } from '../services/aiService';
import MarkdownRenderer from './MarkdownRenderer';
import { useToast } from './Toast';

interface ChatInterfaceProps {
  farmContext: any;
  isPopup?: boolean;
}

const QUICK_REPLIES = [
  "What's the weather forecast?",
  "Any pest alerts?",
  "Irrigation schedule?",
  "Harvest timing advice"
];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ farmContext, isPopup = false }) => {
  const toast = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm the AgriGenesis farm assistant. How can I help you with your farm today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setShowQuickReplies(false);
    setIsLoading(true);

    try {
      const response = await getChatResponse(messages, textToSend, farmContext);
      const aiMsg: Message = { role: 'model', content: response.text || "I'm not sure how to answer that.", timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(`Failed to get response: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please check the console for details.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className={`flex flex-col bg-white/5 backdrop-blur-md overflow-hidden ${
      isPopup ? 'h-[500px]' : 'h-[600px] rounded-xl shadow-xl border border-white/10'
    }`}>
      {!isPopup && (
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-white font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <i className="fas fa-comment-dots text-lg"></i>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            </div>
            <span className="font-semibold">AgriGenesis Farm Assistant</span>
          </div>
          <div className="flex items-center gap-2 text-xs bg-white/20 px-2 py-1 rounded-full">
            <i className="fas fa-circle text-green-400 text-[6px]"></i>
            <span>Online</span>
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white/5 to-transparent scrollbar-thin">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className={`max-w-[85%] group relative ${
              msg.role === 'user' ? '' : 'flex gap-2'
            }`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <i className="fas fa-leaf text-sm"></i>
                </div>
              )}

              <div className={`flex-1 px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 ${
                msg.role === 'user'
                  ? 'bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md text-emerald-100 rounded-tr-none'
                  : 'bg-white/5 backdrop-blur-md text-slate-100 border border-white/10 rounded-tl-none hover:shadow-xl'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <>
                    <MarkdownRenderer content={msg.content} className="text-sm" />
                    {idx > 0 && (
                      <button
                        onClick={() => copyToClipboard(msg.content)}
                        className="mt-2 text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                      >
                        <i className="fas fa-copy"></i>
                        Copy
                      </button>
                    )}
                  </>
                )}
                <span className={`text-[10px] opacity-70 mt-2 block ${
                  msg.role === 'user' ? 'text-emerald-300' : 'text-slate-400'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-slide-up">
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
                <i className="fas fa-leaf text-sm"></i>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl rounded-tl-none shadow-xl">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showQuickReplies && messages.length === 1 && !isLoading && (
          <div className="pt-2 animate-fade-in">
            <p className="text-xs text-slate-300 mb-2 px-1">Quick questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_REPLIES.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(reply)}
                  className="text-left text-xs bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-xl"
                >
                  <i className="fas fa-arrow-right text-[10px] mr-1.5 text-emerald-400"></i>
                  {reply}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about weather, pests, irrigation, or planting..."
            disabled={isLoading}
            className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 text-slate-100 placeholder-slate-400 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500/50 focus:bg-white/10 outline-none transition-all disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md text-emerald-300 px-4 py-2.5 rounded-lg hover:shadow-2xl hover:bg-emerald-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'}`}></i>
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
