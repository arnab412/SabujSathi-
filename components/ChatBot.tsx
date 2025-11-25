import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Bot, User, Sparkles, Activity, Zap, CheckCircle2 } from 'lucide-react';
import { sendChatMessage, getQuotaStats } from '../services/gemini';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'quota'>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'নমস্কার! আমি সবুজ সাথী। গাছ লাগান, প্রাণ বাঁচান! আপনার বাগানের খবর বলুন।',
      timestamp: Date.now(),
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [quota, setQuota] = useState(getQuotaStats());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLocked, activeTab]);

  // Refresh quota on mount and when tab changes
  useEffect(() => {
    setQuota(getQuotaStats());
  }, [activeTab]);

  const handleSend = async () => {
    if (!input.trim() || loading || isLocked) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const responseText = await sendChatMessage(userMessage.text, history);
      
      // Update quota immediately after send
      setQuota(getQuotaStats());

      if (responseText) {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: 'দুঃখিত, এখন উত্তর দিতে পারছি না। একটু পরে চেষ্টা করুন।',
        timestamp: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVerification = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setIsLocked(false);
    }, 1500);
  };

  const quotaPercent = (quota.used / quota.limit) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-85px)] max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-3 shadow-sm border-b-2 border-gray-100 dark:border-gray-800 z-10 sticky top-0 flex flex-col gap-3 transition-colors">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-2 rounded-xl border border-green-200 dark:border-green-800">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h2 className="text-base font-black text-gray-700 dark:text-gray-100 bn-font">সবুজ সাথী</h2>
                  <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider">AI Assistant</p>
                </div>
            </div>
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
               <button 
                 onClick={() => setActiveTab('chat')}
                 className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-gray-400'}`}
               >
                 Chat
               </button>
               <button 
                 onClick={() => setActiveTab('quota')}
                 className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 ${activeTab === 'quota' ? 'bg-white dark:bg-gray-700 text-blue-500 dark:text-blue-400 shadow-sm' : 'text-gray-400'}`}
               >
                 Quota
                 {quotaPercent > 90 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
               </button>
            </div>
         </div>
      </div>

      {activeTab === 'chat' ? (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-gray-50 dark:bg-gray-950 transition-colors">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isUser 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white dark:bg-gray-800 text-blue-500 dark:text-blue-400 border border-gray-100 dark:border-gray-700'
                  }`}>
                    {isUser ? <User size={14} /> : <Bot size={16} />}
                  </div>
                  
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed bn-font relative group ${
                      isUser
                        ? 'bg-green-500 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    {msg.text}
                    <div className={`text-[9px] font-bold uppercase mt-2 opacity-60 ${isUser ? 'text-green-100' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                  <Bot size={16} className="text-blue-500 dark:text-blue-400" />
                </div>
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 dark:border-gray-700">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-3 pt-3 pb-2 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-10 transition-colors mt-auto">
            {isLocked ? (
              <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 animate-pulse">
                  {!verifying ? (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-300 bn-font">শক্তি শেষ! আবার শক্তি পেতে ট্যাপ করুন</p>
                      <button 
                        onClick={handleVerification}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full text-xs uppercase tracking-widest shadow-lg shadow-green-200 dark:shadow-none transition-transform active:scale-95"
                      >
                        Recharge Energy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                      <Loader2 size={18} className="animate-spin" />
                      Recharging...
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="গাছ সম্পর্কে কিছু জিজ্ঞাসা করুন..."
                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-2xl pl-4 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 border border-transparent focus:border-green-500 transition-all bn-font text-base"
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className={`p-3 rounded-2xl transition-all duration-200 ${
                    !input.trim() || loading
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-none hover:bg-green-600 active:scale-90 active:rotate-12'
                  }`}
                >
                  {loading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Quota View */
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950 animate-fade-in">
           <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-800 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
               
               <div className="mb-6">
                  <h3 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Daily Usage Limit</h3>
                  <div className="flex items-baseline justify-center gap-1">
                     <span className="text-4xl font-black text-gray-800 dark:text-white bn-font">{quota.remaining}</span>
                     <span className="text-sm font-bold text-gray-400">/ {quota.limit}</span>
                  </div>
                  <p className="text-xs font-bold text-green-500 mt-2 uppercase tracking-wide flex items-center justify-center gap-1">
                     <CheckCircle2 size={12} /> Requests Remaining
                  </p>
               </div>

               <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-6 border border-gray-200 dark:border-gray-700">
                  <div 
                    className={`h-full transition-all duration-1000 ${quotaPercent > 90 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                    style={{ width: `${Math.min(100, quotaPercent)}%` }}
                  ></div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                     <Activity size={20} className="text-blue-500 mx-auto mb-2" />
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Used</p>
                     <p className="text-xl font-black text-gray-800 dark:text-gray-200">{quota.used}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                     <Zap size={20} className="text-yellow-500 mx-auto mb-2" />
                     <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Model</p>
                     <p className="text-xl font-black text-gray-800 dark:text-gray-200">Flash 2.5</p>
                  </div>
               </div>
               
               <p className="text-[10px] text-gray-400 mt-6 max-w-[200px] mx-auto leading-relaxed">
                  Quota resets daily. This is an estimate based on your current device usage.
               </p>
           </div>
        </div>
      )}
    </div>
  );
};