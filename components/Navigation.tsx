import React from 'react';
import { AppView } from '../types';
import { Leaf, MessageCircle, Home, User } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: AppView.HOME, icon: Home, label: 'হোম' }, // Home
    { view: AppView.ANALYZE, icon: Leaf, label: 'গাছ দেখুন' }, // Scan Plant
    { view: AppView.CHAT, icon: MessageCircle, label: 'চ্যাট' }, // Chat
    { view: AppView.PROFILE, icon: User, label: 'প্রোফাইল' }, // Profile
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-800 p-2 pb-4 z-50">
      <div className="max-w-2xl mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive 
                  ? 'text-green-500 bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-900 transform -translate-y-2 shadow-sm' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 3 : 2} 
                className={`transition-transform duration-300 ${isActive ? 'animate-pop' : ''}`}
              />
              <span className="text-xs font-bold mt-1 bn-font">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};