import React, { useState, useEffect } from 'react';
import { AppView } from './types';
import { Home } from './components/Home';
import { PlantAnalyzer } from './components/PlantAnalyzer';
import { ChatBot } from './components/ChatBot';
import { Profile } from './components/Profile';
import { Navigation } from './components/Navigation';
import { getAuthInstance, onAuthStateChanged } from './services/firebase';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setView] = useState<AppView>(AppView.HOME);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('theme');
        return stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    // Use our local storage auth wrapper
    const authInstance = getAuthInstance();
    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return <Home setView={setView} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
      case AppView.ANALYZE:
        return <PlantAnalyzer />;
      case AppView.CHAT:
        return <ChatBot />;
      case AppView.PROFILE:
        return <Profile />;
      default:
        return <Home setView={setView} toggleTheme={toggleTheme} isDarkMode={isDarkMode} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
        <p className="text-gray-500 dark:text-gray-400 font-bold bn-font">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 pb-20 transition-colors duration-300 overflow-x-hidden">
      <main className="w-full max-w-2xl mx-auto min-h-screen bg-white dark:bg-gray-900 sm:border-x-2 sm:border-gray-100 dark:sm:border-gray-800 shadow-sm transition-colors duration-300 overflow-x-hidden relative">
        {renderView()}
      </main>
      <Navigation currentView={currentView} setView={setView} />
    </div>
  );
};

export default App;