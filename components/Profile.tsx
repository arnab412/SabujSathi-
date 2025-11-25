import React, { useState, useEffect } from 'react';
import { UserData } from '../types';
import { subscribeToUserData, getAuthInstance } from '../services/firebase';
import { Footer } from './Footer';
import { User, Flame, Zap, Award, Lock, Droplets, Wind, CloudRain, Heart, Shovel, Sun, Leaf, Bug, Trophy, Settings } from 'lucide-react';

const XP_BADGES = [
  { id: 1, name: 'Nature Lover', icon: Heart, threshold: 50, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 2, name: 'Water Saver', icon: Droplets, threshold: 150, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 3, name: 'Soil Expert', icon: Shovel, threshold: 300, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 4, name: 'Sun Seeker', icon: Sun, threshold: 500, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 5, name: 'Green Thumb', icon: Leaf, threshold: 800, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 6, name: 'Bug Hero', icon: Bug, threshold: 1200, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
];

export const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const { currentUser } = getAuthInstance();
    const unsubscribe = subscribeToUserData(currentUser.uid, (data) => {
      setUserData(data);
    });
    return () => unsubscribe();
  }, []);

  if (!userData) return (
    <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const level = Math.floor(userData.totalXp / 500) + 1;
  const nextLevelXp = level * 500;
  const currentLevelProgress = userData.totalXp % 500;
  const progressPercent = (currentLevelProgress / 500) * 100;

  return (
    <div className="pb-4 pt-6 px-4 space-y-6 overflow-x-hidden animate-slide-up">
       {/* Header with Avatar */}
       <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-[2.5rem] p-8 text-center text-white shadow-xl shadow-green-200 dark:shadow-none overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)]"></div>
           <div className="absolute top-4 right-4 p-2 bg-white/10 rounded-full cursor-pointer hover:bg-white/20 transition-colors">
              <Settings size={20} className="text-white" />
           </div>

           <div className="relative z-10 flex flex-col items-center">
               <div className="w-28 h-28 bg-white dark:bg-gray-800 rounded-full p-1 shadow-2xl mb-4 relative">
                   <div className="w-full h-full bg-green-50 dark:bg-gray-900 rounded-full flex items-center justify-center overflow-hidden">
                      <User size={48} className="text-green-500 dark:text-green-400" />
                   </div>
                   <div className="absolute -bottom-2 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full border-2 border-white dark:border-gray-800 shadow-md">
                      LVL {level}
                   </div>
               </div>
               
               <h1 className="text-3xl font-black bn-font mb-1 tracking-tight">{userData.displayName}</h1>
               <p className="text-green-100 text-sm font-bold uppercase tracking-widest opacity-80">{userData.email}</p>
           </div>
       </div>

       {/* Stats Overview Grid */}
       <div className="grid grid-cols-2 gap-4 -mt-12 relative z-20 px-2">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col items-center justify-center gap-2 group hover:-translate-y-1 transition-transform duration-300">
             <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-orange-500 group-hover:scale-110 transition-transform">
                <Flame size={24} className="fill-orange-500 animate-pulse" />
             </div>
             <div className="text-center">
                <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{userData.streak}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Day Streak</p>
             </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg flex flex-col items-center justify-center gap-2 group hover:-translate-y-1 transition-transform duration-300">
             <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl text-yellow-500 group-hover:scale-110 transition-transform">
                <Zap size={24} className="fill-yellow-500" />
             </div>
             <div className="text-center">
                <span className="text-3xl font-black text-gray-800 dark:text-gray-100">{userData.totalXp}</span>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total XP</p>
             </div>
          </div>
       </div>

       {/* Level Progress */}
       <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
           <div className="flex justify-between items-end mb-2">
              <div>
                 <h3 className="font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest text-xs mb-1">Level Progress</h3>
                 <p className="text-[10px] text-gray-400 font-bold">{nextLevelXp - userData.totalXp} XP to Level {level + 1}</p>
              </div>
              <span className="text-xl font-black text-green-500">{Math.round(progressPercent)}%</span>
           </div>
           <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 relative"
                style={{ width: `${progressPercent}%` }}
              >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
              </div>
           </div>
       </div>

       {/* Eco Stats */}
       <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/30">
          <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-xs mb-6 flex items-center gap-2">
             <Trophy size={16} className="text-blue-500" /> Lifetime Eco Impact
          </h3>
          <div className="space-y-5">
             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white dark:bg-blue-900/30 text-blue-500 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <Droplets size={20} />
                   </div>
                   <div>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Water Saved</span>
                       <span className="text-sm font-bold text-gray-600 dark:text-gray-300">জল সাশ্রয়</span>
                   </div>
                </div>
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{userData.impactStats.water} L</span>
             </div>
             
             <div className="w-full h-[1px] bg-blue-200/50 dark:bg-blue-800/50"></div>

             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white dark:bg-green-900/30 text-green-500 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <Wind size={20} />
                   </div>
                   <div>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Oxygen Added</span>
                       <span className="text-sm font-bold text-gray-600 dark:text-gray-300">অক্সিজেন উৎপাদন</span>
                   </div>
                </div>
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{userData.impactStats.oxygen} kg</span>
             </div>

             <div className="w-full h-[1px] bg-blue-200/50 dark:bg-blue-800/50"></div>

             <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white dark:bg-gray-700 text-gray-500 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                      <CloudRain size={20} />
                   </div>
                   <div>
                       <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Carbon Reduced</span>
                       <span className="text-sm font-bold text-gray-600 dark:text-gray-300">কার্বন হ্রাস</span>
                   </div>
                </div>
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{userData.impactStats.carbon} kg</span>
             </div>
          </div>
       </div>

       {/* Badges Collection */}
       <div>
         <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-xs mb-4 px-1 flex items-center gap-2">
            <Award size={14} className="text-amber-500" /> অর্জিত ব্যাজ (Badges)
         </h3>
         <div className="grid grid-cols-3 gap-3">
            {XP_BADGES.map((badge) => {
               const isUnlocked = (userData?.totalXp || 0) >= badge.threshold;
               return (
                  <div key={badge.id} className={`aspect-square rounded-3xl flex flex-col items-center justify-center p-3 text-center border-2 transition-all duration-500 group relative overflow-hidden ${isUnlocked ? 'bg-white dark:bg-gray-800 border-transparent shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'}`}>
                     
                     {isUnlocked && <div className={`absolute inset-0 opacity-10 ${badge.bg}`}></div>}
                     
                     <div className={`relative z-10 p-3 rounded-full mb-2 transition-transform duration-300 group-hover:scale-110 ${isUnlocked ? badge.bg + ' ' + badge.color : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                        {isUnlocked ? <badge.icon size={24} /> : <Lock size={24} />}
                     </div>
                     
                     <span className={`text-[10px] font-black uppercase leading-tight transition-colors ${isUnlocked ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                        {badge.name}
                     </span>
                     
                     {!isUnlocked && (
                        <span className="text-[9px] font-bold text-gray-400 mt-1">{badge.threshold} XP</span>
                     )}
                  </div>
               );
            })}
         </div>
       </div>
       
       <Footer />
    </div>
  );
};