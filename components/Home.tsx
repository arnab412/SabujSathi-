import React, { useState, useEffect } from 'react';
import { AppView, UserData } from '../types';
import { 
  Flame, Trophy, Droplets, Sun, Leaf, Globe, Heart, 
  TreePine, BookOpen, Calendar as CalendarIcon,
  CloudRain, CloudSun, Loader2,
  Sprout, TreeDeciduous, Bean, Wind, Quote,
  Scissors, Bug, Shovel, ArrowRight, ArrowLeft,
  Lock, Award, Book, Coffee, ThermometerSun, CheckCircle2,
  X,
  Zap, Moon,
  Sparkles, RefreshCw,
  ScanLine,
  Lightbulb,
  HandHeart,
  Bird,
  Recycle,
  Camera,
  Flower2,
  AlertCircle,
  Activity,
  BarChart3,
  TrendingUp,
  PieChart,
  Target
} from 'lucide-react';
import { subscribeToUserData, updateUserProgress, getUserData } from '../services/firebase';
import { generateNewMission, getGardeningTip, generatePlantImage } from '../services/gemini';
import { saveImageToDB, getImageFromDB } from '../services/imageStorage';
import { Footer } from './Footer';

interface HomeProps {
  setView: (view: AppView) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

// --- CONSTANTS & DATA ---

const LEVEL_THRESHOLD = 500;

// Fallback Static Images (Unsplash)
const GROWTH_FALLBACKS: Record<string, string> = {
  seed: "https://images.unsplash.com/photo-1516051662668-db2d79c4a17e?q=80&w=800&auto=format&fit=crop", 
  sprout: "https://images.unsplash.com/photo-1590439169212-9c31168c74a0?q=80&w=800&auto=format&fit=crop",
  sapling: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop",
  tree: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=800&auto=format&fit=crop",
  mature: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=800&auto=format&fit=crop"
};

const PERSONALIZED_GUIDES = [
  {
    minLevel: 1,
    maxLevel: 1,
    title: 'বীজ রোপণ ও প্রাথমিক যত্ন (Seed Stage)',
    description: 'বীজটি সদ্য মাটিতে পোঁতা হয়েছে। মাটির আদ্রতা ধরে রাখা খুব জরুরি।',
    tips: [
      { icon: Droplets, text: 'মাটি শুকিয়ে গেলে জল দিন, তবে কাদা করবেন না।' },
      { icon: Sun, text: 'সরাসরি কড়া রোদ থেকে দূরে রাখুন।' }
    ],
    bg: 'bg-stone-50 dark:bg-stone-900/20',
    border: 'border-stone-200 dark:border-stone-800',
    iconColor: 'text-stone-500'
  },
  {
    minLevel: 2,
    maxLevel: 3,
    title: 'অঙ্কুরোদগম ও চারা (Sprouting Stage)',
    description: 'ছোট্ট চারা মাটি ভেদ করে উঠছে! এখন ভোরের রোদ ও বাতাস খুব জরুরি।',
    tips: [
      { icon: Wind, text: 'বাতাস চলাচলের ব্যবস্থা রাখুন।' },
      { icon: Sun, text: 'সকালের মিষ্টি রোদ চারা গাছের জন্য অমৃত।' }
    ],
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-800',
    iconColor: 'text-emerald-500'
  },
  {
    minLevel: 4,
    maxLevel: 7,
    title: 'বাড়ন্ত গাছের যত্ন (Growing Stage)',
    description: 'গাছটি দ্রুত বাড়ছে! এখন সঠিক পুষ্টি ও পর্যাপ্ত আলো প্রয়োজন।',
    tips: [
      { icon: Coffee, text: 'প্রতি মাসে একবার জৈব সার প্রয়োগ করুন।' },
      { icon: Sun, text: 'দিনে অন্তত ৪-৫ ঘণ্টা রোদে রাখুন।' }
    ],
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-100 dark:border-blue-800',
    iconColor: 'text-blue-500'
  },
  {
    minLevel: 8,
    maxLevel: 100,
    title: 'পূর্ণাঙ্গ গাছের যত্ন (Mature Stage)',
    description: 'গাছটি এখন পূর্ণাঙ্গ। রোগবালাই ও সঠিক আকৃতির দিকে নজর দিন।',
    tips: [
      { icon: Scissors, text: 'শুকনো বা মরা ডালপালা ছেঁটে দিন।' },
      { icon: Bug, text: 'পোকামাকড় বা ছত্রাক আছে কিনা দেখুন।' }
    ],
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-100 dark:border-purple-800',
    iconColor: 'text-purple-500'
  }
];

const STORIES = [
  { 
    id: 1,
    title: 'জলের গল্প (Water Tale)',
    text: "জানেন কি? মাটির গভীরে জল পৌঁছাতে হলে ধীরে ধীরে জল দেওয়া ভালো। এতে শিকড় মজবুত হয়। তাড়াহুড়ো করে জল দিলে তা কেবল উপরের মাটি ভিজিয়ে গড়িয়ে চলে যায়, শিকড় পর্যন্ত পৌঁছায় না।",
    icon: Droplets,
    bgGradient: "from-blue-600 via-blue-500 to-blue-400",
  },
  { 
    id: 2,
    title: 'সূর্যের কথা (Sun Story)',
    text: "সকালের মিষ্টি রোদ গাছের পাতার জন্য অমৃত সমান। এটি সালোকসংশ্লেষণে সাহায্য করে গাছের খাদ্য তৈরিতে। তবে দুপুরের কড়া রোদ কচি পাতার ক্ষতি করতে পারে, তাই দুপুরের রোদে ছায়া দেওয়া ভালো।",
    icon: Sun,
    bgGradient: "from-orange-600 via-orange-500 to-amber-400",
  },
  { 
    id: 3,
    title: 'মাটির বন্ধু (Soil Friend)',
    text: "কেঁচো হলো কৃষকের প্রকৃত বন্ধু। এরা মাটির নিচে গর্ত করে বাতাস চলাচলের পথ করে দেয় এবং মাটিকে উর্বর ও ঝুরঝুরে করে তোলে, যা গাছের শিকড় বিস্তারে এবং পুষ্টি গ্রহণে অত্যন্ত জরুরি ভূমিকা রাখে।",
    icon: Sprout,
    bgGradient: "from-emerald-600 via-emerald-500 to-green-400",
  },
];

const QUICK_GUIDES = [
  { 
    id: 1, 
    title: 'ঋতুভিত্তিক যত্ন', 
    subtitle: 'Summer Care', 
    icon: ThermometerSun, 
    color: 'text-orange-500 dark:text-orange-400', 
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    desc: 'গরমকালে গাছের গোড়ায় জল দিন, তবে কাদা করবেন না।',
    highlight: 'জল দিন'
  },
  { 
    id: 2, 
    title: 'সার ও পুষ্টি', 
    subtitle: 'Fertilizer 101', 
    icon: Coffee, 
    color: 'text-amber-700 dark:text-amber-400', 
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    desc: 'গাছের বৃদ্ধির জন্য সঠিক সময় জৈব সার ব্যবহার খুব জরুরি।',
    highlight: 'জৈব সার'
  },
  { 
    id: 3, 
    title: 'পোকা দমন', 
    subtitle: 'Pest Control', 
    icon: Bug, 
    color: 'text-red-500 dark:text-red-400', 
    bg: 'bg-red-50 dark:bg-red-900/20',
    desc: 'পোকামাকড় তাড়াতে নিম তেল স্প্রে করা একটি দারুণ উপায়।',
    highlight: 'নিম তেল'
  },
  { 
    id: 4, 
    title: 'টব পরিবর্তন', 
    subtitle: 'Repotting', 
    icon: Scissors, 
    color: 'text-purple-500 dark:text-purple-400', 
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    desc: 'শিকড় ছড়িয়ে পড়লে গাছকে বড় টবে স্থানান্তর করতে হয়।',
    highlight: 'বড় টবে'
  },
];

const XP_BADGES = [
  { id: 1, name: 'Nature Lover', icon: Heart, threshold: 50, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 2, name: 'Water Saver', icon: Droplets, threshold: 150, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 3, name: 'Soil Expert', icon: Shovel, threshold: 300, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 4, name: 'Sun Seeker', icon: Sun, threshold: 500, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { id: 5, name: 'Green Thumb', icon: Leaf, threshold: 800, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 6, name: 'Bug Hero', icon: Bug, threshold: 1200, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
];

const INITIAL_MISSIONS = [
  { 
    id: 'gratitude', 
    label: 'গাছকে ধন্যবাদ দিন', 
    sub: 'Gratitude', 
    desc: 'গাছের পাতায় আলতো হাত বুলিয়ে মনে মনে ধন্যবাদ জানান।',
    xp: 40, 
    iconName: 'HandHeart', 
    colorTheme: 'red'
  },
  { 
    id: 'recycle_water', 
    label: 'চাল ধোয়া জল', 
    sub: 'Recycle Water', 
    desc: 'আজ ট্যাপের জল না দিয়ে, চাল বা সবজি ধোয়া জল গাছে দিন।',
    xp: 50, 
    iconName: 'Recycle', 
    colorTheme: 'blue'
  },
  { 
    id: 'nature_care', 
    label: 'পাখির তৃষ্ণা', 
    sub: 'Kindness', 
    desc: 'বারান্দায় বা ছাদে পাখিদের জন্য একটি পাত্রে জল রাখুন।',
    xp: 45, 
    iconName: 'Bird', 
    colorTheme: 'orange'
  },
];

const ICON_MAP: any = {
  Leaf, Droplets, Sun, Wind, Bug, Sprout, Recycle, Heart, Bird, HandHeart,
  Flower2, TreeDeciduous, Zap, Shovel
};

const AI_THANK_YOU_NOTES = [
  "আপনার মমতা গাছের প্রাণে স্পন্দন জাগাল। ধন্যবাদ!", 
  "প্রকৃতি তার রক্ষাকর্তাকে চিনে নিল। দারুণ কাজ!",
  "আজকের এই যত্ন পৃথিবী মনে রাখবে।",
  "সবুজের বন্ধুত্ব অমূল্য। আপনি তা প্রমাণ করলেন।",
  "একটি ছোট পদক্ষেপ, কিন্তু প্রকৃতির জন্য বিশাল প্রাপ্তি।" 
];

// --- HELPER FUNCTIONS ---

const toBengali = (num: number | string) => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const getThemeClasses = (theme: string) => {
  const t = (theme || 'green').toLowerCase();
  const map: any = {
    green: { color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-100 dark:border-green-900' },
    blue: { color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-100 dark:border-blue-900' },
    red: { color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-100 dark:border-red-900' },
    orange: { color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-100 dark:border-orange-900' },
    yellow: { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-100 dark:border-yellow-900' },
    purple: { color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-100 dark:border-purple-900' },
    pink: { color: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-100 dark:border-pink-900' },
    teal: { color: 'text-teal-500 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-100 dark:border-teal-900' },
  };
  return map[t] || map.green;
};

// --- SUB-COMPONENTS ---

const WeatherWidget = () => (
  <div className="flex items-center justify-between p-5 bg-gradient-to-br from-sky-400 to-blue-600 rounded-3xl text-white shadow-lg shadow-blue-200 dark:shadow-none animate-slide-up relative overflow-hidden">
     <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
     <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1 opacity-90">
           <div className="p-1 rounded bg-white/20">
             <Globe size={12} />
           </div>
           <span className="text-[10px] font-bold uppercase tracking-widest">আজকের আবহাওয়া</span>
        </div>
        <div className="flex items-baseline gap-1 mb-1">
           <h2 className="text-4xl font-black bn-font">২৮°</h2>
           <span className="text-lg font-bold opacity-80">C</span>
        </div>
        <p className="text-sm font-medium bn-font opacity-90">রৌদ্রোজ্জ্বল • বাতাস ৩ কিমি/ঘণ্টা</p>
     </div>
     <div className="relative z-10 mr-2">
         <Sun size={56} className="text-yellow-300 animate-spin-slow drop-shadow-lg" />
         <CloudSun size={24} className="absolute bottom-0 -left-2 text-white/90" />
     </div>
  </div>
);

const StoriesCarousel = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % STORIES.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, []);

  const story = STORIES[index];

  return (
      <div className="animate-slide-up delay-300">
          <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-xs mb-4 px-1 flex items-center gap-2">
            <Quote size={14} className="text-purple-500" /> প্রকৃতির গল্প
          </h3>
          <div className="relative w-full">
               <div key={story.id} className={`w-full p-6 rounded-[2rem] bg-gradient-to-br ${story.bgGradient} text-white shadow-lg relative overflow-hidden group min-h-[220px] flex flex-col justify-center animate-fade-in`}>
                   <story.icon size={120} className="absolute -right-6 -bottom-6 opacity-20 rotate-12 transition-transform duration-700" />
                   <div className="relative z-10">
                      <Quote size={24} className="text-white/50 mb-3" />
                      <h4 className="text-xl font-black bn-font mb-3">{story.title}</h4>
                      <p className="text-sm font-medium text-white/95 bn-font leading-loose tracking-wide">
                         {story.text}
                      </p>
                   </div>
               </div>
               
               <div className="flex justify-center gap-2 mt-4">
                 {STORIES.map((_, i) => (
                   <button 
                     key={i} 
                     onClick={() => setIndex(i)}
                     className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-purple-500' : 'w-2 bg-gray-200 dark:bg-gray-700'}`}
                   />
                 ))}
               </div>
          </div>
      </div>
  );
};

// Enhanced TreeGrowth with Tech-Dashboard Style and Dynamic AI Generation
const TreeGrowth: React.FC<{ level: number, xpPercentage: number, currentXp: number, onScan: () => void }> = ({ level, xpPercentage, currentXp, onScan }) => {
  const [stageKey, setStageKey] = useState<string>('seed');
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // Determine stage key based on level
  useEffect(() => {
    let key = 'seed';
    if (level >= 10) key = 'mature';
    else if (level >= 7) key = 'tree';
    else if (level >= 4) key = 'sapling';
    else if (level >= 2) key = 'sprout';
    setStageKey(key);
  }, [level]);

  // Load or Generate Image for the specific stage
  useEffect(() => {
    const fetchImage = async () => {
      setLoadingImage(true);
      setPlantImage(null);
      
      try {
        // 1. Check Local DB Cache to save AI tokens
        const cached = await getImageFromDB(`growth_stage_${stageKey}`);
        
        if (cached) {
          setPlantImage(cached);
        } else {
          // 2. Generate New via AI (Nano Banana / Gemini Flash Image)
          const generated = await generatePlantImage(stageKey);
          if (generated) {
            setPlantImage(generated);
            await saveImageToDB(`growth_stage_${stageKey}`, generated);
          } else {
            // 3. Fallback to Static Unsplash if AI fails/quota
            setPlantImage(GROWTH_FALLBACKS[stageKey]);
          }
        }
      } catch (e) {
        console.error("Image loading failed:", e);
        setPlantImage(GROWTH_FALLBACKS[stageKey]);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchImage();
  }, [stageKey]);

  // Stage display name
  const getStageName = () => {
    switch(stageKey) {
      case 'seed': return 'বীজ (Seed)';
      case 'sprout': return 'অঙ্কুর (Sprout)';
      case 'sapling': return 'চারাগাছ (Sapling)';
      case 'tree': return 'তরু (Young Tree)';
      case 'mature': return 'মহীরুহ (Mature)';
      default: return 'বীজ (Seed)';
    }
  };

  return (
    <div className="w-full aspect-[4/3] md:aspect-video bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-900/50 border border-gray-800 relative overflow-hidden flex flex-col justify-between group">
       
       {/* Tech Background Grid (SVG) */}
       <div className="absolute inset-0 opacity-20 pointer-events-none z-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
             <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                   <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(74, 222, 128, 0.3)" strokeWidth="0.5"/>
                </pattern>
             </defs>
             <rect width="100%" height="100%" fill="url(#grid)" />
             <path d="M0,200 Q100,150 200,220 T400,180" fill="none" stroke="rgba(74, 222, 128, 0.4)" strokeWidth="2" className="animate-pulse" />
          </svg>
       </div>

       {/* Main Image Layer */}
       <div className="absolute inset-0 z-0 bg-gray-900 flex items-center justify-center">
           {loadingImage ? (
              <div className="flex flex-col items-center gap-3">
                 <Loader2 size={40} className="text-green-500 animate-spin" />
                 <p className="text-green-400 text-xs font-bold uppercase tracking-widest animate-pulse">Generating Plant AI...</p>
              </div>
           ) : (
             <img 
               src={plantImage || GROWTH_FALLBACKS[stageKey]} 
               alt={stageKey}
               className="absolute inset-0 w-full h-full object-cover transition-all duration-[3000ms] ease-in-out opacity-90 scale-100 group-hover:scale-105"
             />
           )}
           
           {/* Overlays for Text Readability */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/80 pointer-events-none"></div>
           <div className="absolute inset-0 bg-green-900/10 mix-blend-overlay animate-pulse pointer-events-none"></div>
       </div>

       {/* Top Controls HUD */}
       <div className="relative z-40 p-5 flex justify-between items-start">
          {/* Scan Button HUD Style */}
          <button 
            onClick={(e) => { e.stopPropagation(); onScan(); }}
            className="flex items-center gap-3 bg-gray-900/60 backdrop-blur-md border border-green-500/30 p-2 pr-5 rounded-full transition-all duration-300 group hover:bg-gray-800 hover:border-green-400 active:scale-95 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
          >
             <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-black transition-colors border border-green-500/50">
                <ScanLine size={18} strokeWidth={2.5} />
             </div>
             <div className="text-left">
                <p className="text-[9px] font-black uppercase tracking-widest mb-0.5 text-green-400">
                  AI Plant Scan
                </p>
                <p className="text-xs font-bold text-white bn-font leading-none">
                   গাছ ও রোগ চিনুন
                </p>
             </div>
          </button>

          {/* Stats HUD */}
          <div className="flex flex-col gap-2 items-end">
             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Activity size={12} className="text-blue-400" />
                <span className="text-[10px] font-bold text-gray-300">Rate: Normal</span>
             </div>
             <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Leaf size={12} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-gray-300">Health: 98%</span>
             </div>
          </div>
       </div>
       
       {/* Bottom HUD - Level & XP */}
       <div className="relative z-30 w-full flex flex-col gap-3 px-5 pb-5 mt-auto">
           
           {/* Floating Level Indicator */}
           <div className="self-center bg-black/70 backdrop-blur-xl px-8 py-2 rounded-t-2xl rounded-b-lg border-t border-x border-green-500/30 flex items-center gap-3 transform translate-y-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></span>
              <div className="text-center">
                 <h3 className="text-green-400 font-black text-xs uppercase tracking-widest shadow-black drop-shadow-md">{getStageName()}</h3>
                 <p className="text-[10px] text-gray-400 font-bold tracking-wider leading-none">LVL {toBengali(level)}</p>
              </div>
           </div>

           {/* Dashboard XP Bar */}
           <div className="bg-gray-900/80 backdrop-blur-xl p-4 rounded-2xl border border-gray-700 shadow-xl w-full relative overflow-hidden group-hover:border-green-500/30 transition-colors">
              <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Zap size={10} className="fill-current" /> Growth Energy
                      </span>
                      <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-white bn-font">{toBengali(currentXp)}</span>
                          <span className="text-xs font-bold text-gray-500">/ {toBengali(LEVEL_THRESHOLD)} XP</span>
                      </div>
                  </div>
                  <div className="text-right">
                      <span className="text-3xl font-black text-white bn-font tracking-tighter">
                        {toBengali(Math.round(xpPercentage))}%
                      </span>
                  </div>
              </div>

              {/* Progress Bar with Glitch Effect */}
              <div className="h-3 bg-black/50 rounded-full overflow-hidden relative border border-white/5">
                  <div 
                      className="h-full bg-gradient-to-r from-green-600 via-emerald-500 to-green-400 relative transition-all duration-700 ease-out shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                      style={{ width: `${Math.max(5, Math.min(xpPercentage, 100))}%` }} 
                  >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-[shimmer_2s_infinite]"></div>
                  </div>
              </div>
              
              {/* Decorative data lines */}
              <div className="absolute bottom-0 right-0 p-2 opacity-20">
                 <BarChart3 size={24} className="text-white" />
              </div>
           </div>
       </div>
    </div>
  );
};

const ImpactCard = ({ icon: Icon, title, subtitle, value, unit, gradient, delay }: any) => (
  <div className={`relative overflow-hidden rounded-[1.5rem] p-4 ${gradient} shadow-lg shadow-gray-200/50 dark:shadow-none hover:shadow-xl transition-all duration-500 group animate-slide-up ${delay} hover:-translate-y-1 border border-white/10`}>
     <div className="absolute -right-4 -top-4 w-20 h-20 bg-white opacity-20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
     <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-black opacity-5 rounded-full blur-xl"></div>
     
     <div className="relative z-10 flex flex-col h-full justify-between min-h-[110px]">
        <div className="flex justify-between items-start">
           <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm shadow-sm border border-white/20">
              <Icon size={18} className="text-white" strokeWidth={2.5} />
           </div>
           <span className="text-[10px] font-black text-white/80 uppercase tracking-widest bg-black/10 px-2 py-0.5 rounded-full backdrop-blur-sm">{title}</span>
        </div>

        <div className="mt-2 pt-2">
           <h4 className="text-white/90 font-medium text-xs bn-font mb-0.5 tracking-wide">{subtitle}</h4>
           <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white tracking-tighter drop-shadow-sm">{toBengali(Math.round(value))}</span>
              <span className="text-[10px] font-bold text-white/80 uppercase">{unit}</span>
           </div>
        </div>
     </div>
  </div>
);

const ScannerTeaser = ({ onScan }: { onScan: () => void }) => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      title: "Scanning...",
      desc: "AI Analyzing Plant Features",
      icon: ScanLine,
      color: "text-blue-400"
    },
    {
      title: "Identified!",
      desc: "Holy Basil (Tulsi) • 98%",
      icon: CheckCircle2,
      color: "text-green-400"
    },
    {
      title: "Health Check",
      desc: "Healthy Leaves • Needs Water",
      icon: Activity,
      color: "text-emerald-400"
    }
  ];

  return (
    <div onClick={onScan} className="mb-8 cursor-pointer group relative overflow-hidden rounded-[2.5rem] bg-gray-900 border border-gray-800 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.01] hover:border-green-500/30">
       
       {/* Background Effects */}
       <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(34,197,94,0.15),transparent_60%)] group-hover:opacity-100 transition-opacity duration-700"></div>
       <div className="absolute inset-0 opacity-20" 
            style={{ 
               backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', 
               backgroundSize: '30px 30px' 
            }}>
       </div>

       <div className="relative z-10 flex flex-col md:flex-row min-h-[240px]">
          
          {/* Left: Interactive Visualization */}
          <div className="w-full md:w-5/12 relative flex items-center justify-center p-8 border-b md:border-b-0 md:border-r border-white/5 bg-black/20">
             
             {/* Central Plant Display */}
             <div className="relative w-36 h-36 flex items-center justify-center">
                 {/* Plant Icon */}
                 <div className={`absolute inset-0 transition-all duration-700 ease-in-out ${activeStep === 0 ? 'scale-95 blur-[2px] opacity-60' : 'scale-110 blur-0 opacity-100'}`}>
                    <Leaf size={100} className="text-green-500 fill-green-500/10 drop-shadow-[0_0_25px_rgba(34,197,94,0.4)]" strokeWidth={1} />
                 </div>

                 {/* Step 0: Scanning Animation */}
                 {activeStep === 0 && (
                   <>
                     <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,1)] animate-scan"></div>
                     <div className="absolute inset-[-10px] border-2 border-dashed border-blue-500/30 rounded-2xl animate-spin-slow opacity-50"></div>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <ScanLine size={48} className="text-blue-400 animate-pulse opacity-80" />
                     </div>
                   </>
                 )}

                 {/* Step 1: Identification Success */}
                 {activeStep === 1 && (
                   <>
                     <div className="absolute -right-6 -top-2 animate-pop delay-100">
                        <div className="bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-green-400/50 flex items-center gap-1.5 backdrop-blur-md">
                           <CheckCircle2 size={12} strokeWidth={3} />
                           <span>MATCH FOUND</span>
                        </div>
                     </div>
                     <div className="absolute inset-0 rounded-full border-2 border-green-500/20 animate-ping opacity-20"></div>
                   </>
                 )}
                 
                 {/* Step 2: Diagnostics */}
                 {activeStep === 2 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="absolute w-[120%] h-[120%] border border-emerald-500/30 rounded-full animate-spin-slow opacity-40"></div>
                       <div className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg animate-bounce">
                          <Activity size={16} fill="currentColor" />
                       </div>
                    </div>
                 )}
             </div>
          </div>

          {/* Right: Info & CTA */}
          <div className="flex-1 p-8 flex flex-col justify-between relative">
             <div className="absolute top-6 right-6">
                <div className="bg-white/5 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                   <Sparkles size={12} className="text-yellow-400 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/60">AI Scanner</span>
                </div>
             </div>

             {/* Animated Text Content */}
             <div className="mt-4 relative h-20">
                 {steps.map((s, i) => (
                    <div key={i} className={`absolute top-0 left-0 w-full transition-all duration-700 ease-out ${activeStep === i ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
                        <div className={`flex items-center gap-2 mb-2 ${s.color}`}>
                           <s.icon size={20} className="animate-pulse" />
                           <h4 className="text-xs font-black uppercase tracking-widest">{s.title}</h4>
                        </div>
                        <p className="text-2xl font-black text-white bn-font leading-tight drop-shadow-md">{s.desc}</p>
                    </div>
                 ))}
             </div>

             {/* Action Button */}
             <div className="mt-4">
                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-green-900/50 transition-all group-hover:shadow-green-500/30 group-hover:translate-y-[-2px] border border-white/10">
                   <div className="p-1 bg-white/20 rounded-full">
                      <Camera size={14} strokeWidth={3} />
                   </div>
                   Start AI Diagnosis
                </button>
                <div className="flex justify-center gap-4 mt-4 opacity-40">
                   <span className="h-1 w-1 bg-white rounded-full"></span>
                   <span className="h-1 w-1 bg-white rounded-full"></span>
                   <span className="h-1 w-1 bg-white rounded-full"></span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

interface MissionCardProps {
  mission: any;
  onComplete: (xp: number) => void;
  userUid: string;
}

const MissionCard: React.FC<MissionCardProps> = ({ mission, onComplete, userUid }) => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [greeting, setGreeting] = useState("");

  const styles = getThemeClasses(mission.colorTheme);
  const Icon = ICON_MAP[mission.iconName] || Leaf;

  const handleClick = async () => {
    if (loading || completed) return;
    setLoading(true);

    // 1. Simulate Check
    await new Promise(r => setTimeout(r, 800));

    // 2. Show Greeting
    const randomGreeting = AI_THANK_YOU_NOTES[Math.floor(Math.random() * AI_THANK_YOU_NOTES.length)];
    setGreeting(randomGreeting);
    setCompleted(true);
    
    // 3. Update Logic - moved to parent component
    onComplete(mission.xp);
    setLoading(false);
  };

  if (completed && greeting) {
    return (
      <div className={`p-5 rounded-3xl border-2 border-dashed ${styles.border} ${styles.bg} flex flex-col items-center justify-center text-center animate-fade-in-scale h-[220px]`}>
         <div className="p-4 rounded-full bg-white dark:bg-gray-900 shadow-sm mb-3">
           <Heart size={32} className="text-red-500 fill-red-500 animate-bounce" />
         </div>
         <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 bn-font mb-2">ধন্যবাদ!</h3>
         <p className="text-sm text-gray-600 dark:text-gray-300 bn-font px-4 leading-relaxed">{greeting}</p>
         <div className="mt-4 flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 animate-pulse">
            <Loader2 size={14} className="animate-spin" />
            নতুন মিশন তৈরি হচ্ছে...
         </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md group`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${styles.bg} ${styles.color} group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={28} strokeWidth={2.5} />
          </div>
          <div>
             <div className={`text-xs font-black uppercase tracking-widest opacity-70 ${styles.color} mb-1`}>{mission.sub}</div>
             <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 bn-font leading-tight">{mission.label}</h3>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 shadow-sm">
           <Zap size={16} className="text-yellow-500 fill-yellow-500" />
           {toBengali(mission.xp)} XP
        </div>
      </div>
      
      <p className="text-base text-gray-600 dark:text-gray-300 bn-font leading-relaxed mb-6 pl-1 font-medium">
        {mission.desc}
      </p>

      <button 
        onClick={handleClick}
        disabled={loading}
        className={`w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-sm ${
           loading 
             ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-wait' 
             : `bg-white dark:bg-gray-900 border-2 ${styles.border} ${styles.color} hover:bg-gray-50 dark:hover:bg-gray-800`
        }`}
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} strokeWidth={2.5} />}
        {loading ? 'যাচাই হচ্ছে...' : 'সম্পন্ন করুন (Complete)'}
      </button>
    </div>
  );
};

const DailyTipCard = () => {
  const [tip, setTip] = useState("গাছ লাগান, প্রাণ বাঁচান!");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchTip = async () => {
      try {
        const today = new Date().toDateString();
        const STORAGE_KEY = 'sobuj_sathi_daily_tip';
        
        // Check local storage for today's tip
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.date === today && parsed.text) {
             if(mounted) {
                setTip(parsed.text);
                setLoading(false);
             }
             return;
          }
        }

        // If not found or outdated, fetch new
        const t = await getGardeningTip();
        if(mounted) {
           setTip(t);
           localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, text: t }));
        }
      } catch(e) {
        console.error(e);
      } finally {
        if(mounted) setLoading(false);
      }
    };
    fetchTip();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-5 border border-green-100 dark:border-green-800 animate-slide-up">
       <div className="flex items-start gap-3">
         <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-sm text-green-500">
            <Lightbulb size={20} className="fill-green-100 dark:fill-green-900/20" />
         </div>
         <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-green-600 dark:text-green-400 mb-1">Daily Gardening Tip</h3>
            {loading ? (
               <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
               <p className="text-sm font-medium text-gray-700 dark:text-gray-300 bn-font leading-relaxed">
                  {tip}
               </p>
            )}
         </div>
       </div>
    </div>
  );
};

export const Home: React.FC<HomeProps> = ({ setView, toggleTheme, isDarkMode }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [missions, setMissions] = useState(INITIAL_MISSIONS);

  useEffect(() => {
    const { currentUser } = (window as any).getAuthInstance ? (window as any).getAuthInstance() : { currentUser: { uid: 'guest' } }; 
    const unsubscribe = subscribeToUserData(currentUser.uid, (data) => {
      setUserData(data);
    });
    return () => unsubscribe();
  }, []);

  const handleMissionComplete = async (missionId: string, xpEarned: number) => {
     // Safety: Ensure numeric
     const safeXp = Number(xpEarned) || 0;
     
     // Fetch latest data synchronously from storage to avoid stale closure
     const currentData = getUserData();
     
     if (currentData) {
        const newData = {
            xp: (currentData.xp || 0) + safeXp,
            totalXp: (currentData.totalXp || 0) + safeXp,
            impactStats: {
                water: currentData.impactStats.water + 1,
                oxygen: currentData.impactStats.oxygen + 1,
                carbon: currentData.impactStats.carbon + 1
            }
        };
        // Trigger update
        updateUserProgress(currentData.uid, newData);
        
        // Optimistically update local state for immediate feedback
        setUserData({ ...currentData, ...newData });
     }

     setTimeout(async () => {
        try {
          const newMission = await generateNewMission();
          setMissions(prev => prev.map(m => m.id === missionId ? newMission : m));
        } catch (e) {
          console.error("Failed to gen mission", e);
        }
     }, 3000);
  };

  const level = userData ? Math.floor(userData.totalXp / LEVEL_THRESHOLD) + 1 : 1;
  const currentLevelXp = userData ? userData.totalXp % LEVEL_THRESHOLD : 0;
  const xpPercentage = userData ? (currentLevelXp / LEVEL_THRESHOLD) * 100 : 0;

  const currentGuide = PERSONALIZED_GUIDES.find(g => level >= g.minLevel && level <= g.maxLevel) || PERSONALIZED_GUIDES[PERSONALIZED_GUIDES.length - 1];

  return (
    <div className="pb-4 pt-6 px-4 space-y-8 overflow-x-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
         <div>
            <h1 className="text-2xl font-black text-gray-800 dark:text-white bn-font flex items-center gap-2">
               <span className="text-green-500">সবুজ</span> সাথী
               <Leaf className="text-green-500 fill-green-500 animate-wiggle" size={24} />
            </h1>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Gardening Assistant</p>
         </div>
         <button 
           onClick={toggleTheme}
           className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
         >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
         </button>
      </div>

      {/* Weather Widget (New) */}
      <WeatherWidget />

      {/* Daily Tip Section */}
      <DailyTipCard />

      {/* Tree Growth Visualization */}
      <TreeGrowth 
        level={level} 
        xpPercentage={xpPercentage} 
        currentXp={currentLevelXp} 
        onScan={() => setView(AppView.ANALYZE)} 
      />

      {/* Impact Summary Section (Replaces Impact Greeting) */}
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-center animate-slide-up delay-100 mt-6 mb-4 relative overflow-hidden group">
         {/* Background Effects */}
         <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 via-green-400 to-teal-400 left-0 opacity-50"></div>
         <div className="absolute -left-10 top-1/2 w-32 h-32 bg-green-400/10 rounded-full blur-3xl"></div>
         <div className="absolute -right-10 top-1/2 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl"></div>

         <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-3">
               <span className="p-1.5 bg-green-100 dark:bg-green-900/40 rounded-full text-green-600 dark:text-green-400">
                  <Globe size={16} />
               </span>
               <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  Eco Impact Report
               </span>
            </div>

            <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 bn-font mb-3">
               পৃথিবী রক্ষায় আপনার ভূমিকা
            </h3>
            
            <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 bn-font leading-loose max-w-xl mx-auto">
               সবুজ সাথী অ্যাপের মাধ্যমে আপনি শুধু গাছই পরিচর্যা করছেন না, বরং ইকো-সিস্টেমের ভারসাম্য বজায় রাখছেন। 
               আপনার প্রচেষ্টায় এ পর্যন্ত <span className="text-blue-500 font-extrabold">{toBengali(userData?.impactStats.water || 0)} লিটার</span> জল সাশ্রয় হয়েছে, 
               পরিবেশে যুক্ত হয়েছে <span className="text-green-500 font-extrabold">{toBengali(userData?.impactStats.oxygen || 0)} কেজি</span> অক্সিজেন 
               এবং অপসারিত হয়েছে <span className="text-gray-600 dark:text-gray-300 font-extrabold">{toBengali(userData?.impactStats.carbon || 0)} কেজি</span> কার্বন।
            </p>
         </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-3 gap-3">
         <ImpactCard 
            icon={Droplets} 
            title="Water" 
            subtitle="Water Saved" 
            value={userData?.impactStats.water || 0} 
            unit="L" 
            gradient="bg-gradient-to-br from-blue-500 to-cyan-400"
            delay="delay-100"
         />
         <ImpactCard 
            icon={Wind} 
            title="Oxygen" 
            subtitle="Produced" 
            value={userData?.impactStats.oxygen || 0} 
            unit="kg" 
            gradient="bg-gradient-to-br from-emerald-500 to-teal-400"
            delay="delay-200"
         />
         <ImpactCard 
            icon={CloudRain} 
            title="Carbon" 
            subtitle="Reduced" 
            value={userData?.impactStats.carbon || 0} 
            unit="kg" 
            gradient="bg-gradient-to-br from-gray-600 to-gray-500"
            delay="delay-300"
         />
      </div>

      {/* Interactive AI Scanner Showcase (Replaces old static carousel) */}
      <div className="animate-slide-up delay-100 mt-6">
         <div className="flex items-center gap-2 mb-3 px-1">
             <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-500">
                <ScanLine size={16} />
             </div>
             <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-sm">
                AI Plant Doctor
             </h3>
         </div>
         <ScannerTeaser onScan={() => setView(AppView.ANALYZE)} />
      </div>

      {/* Dynamic Missions Section */}
      <div className="animate-slide-up delay-200">
         <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
               <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
                  <TargetIcon size={16} />
               </div>
               <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-sm">
                  আজকের মিশন (Today's Mission)
               </h3>
            </div>
         </div>
         
         <div className="space-y-4">
            {missions.map((mission) => (
               <MissionCard 
                 key={mission.id} 
                 mission={mission} 
                 userUid={userData?.uid || 'guest'} 
                 onComplete={(xp) => handleMissionComplete(mission.id, xp)} 
               />
            ))}
         </div>
      </div>

      {/* Personalized Level Guide */}
      <div className={`rounded-[2rem] p-6 border ${currentGuide.border} ${currentGuide.bg} relative overflow-hidden shadow-sm animate-slide-up delay-300`}>
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
               <BookOpen size={18} className={currentGuide.iconColor} />
               <span className={`text-[10px] font-black uppercase tracking-widest ${currentGuide.iconColor}`}>Level Guide</span>
            </div>
            <h3 className={`text-xl font-black mb-2 bn-font ${currentGuide.iconColor.replace('text-', 'text-gray-800 dark:text-')}`}>
               {currentGuide.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 bn-font mb-5 leading-relaxed">
               {currentGuide.description}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
               {currentGuide.tips.map((tip, idx) => (
                  <div key={idx} className="bg-white/60 dark:bg-black/20 p-3 rounded-2xl backdrop-blur-sm border border-white/20">
                     <tip.icon size={16} className={`mb-2 ${currentGuide.iconColor}`} />
                     <p className="text-xs font-bold text-gray-700 dark:text-gray-200 bn-font leading-snug">
                        {tip.text}
                     </p>
                  </div>
               ))}
            </div>
         </div>
         {/* Decor */}
         <Leaf className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-10 ${currentGuide.iconColor}`} />
      </div>

      {/* Quick Guides Grid */}
      <div>
         <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-xs mb-4 px-1 flex items-center gap-2">
            <Lightbulb size={14} className="text-yellow-500" /> টিপস ও ট্রিকস
         </h3>
         <div className="grid grid-cols-2 gap-3">
            {QUICK_GUIDES.map((guide) => (
               <div key={guide.id} className={`p-4 rounded-3xl border ${guide.bg} border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all group`}>
                  <div className="flex justify-between items-start mb-2">
                     <guide.icon size={20} className={guide.color} />
                     <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>
                  <h4 className="font-black text-gray-800 dark:text-gray-200 bn-font text-sm mb-1">{guide.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 bn-font leading-relaxed line-clamp-2">
                     {guide.desc}
                  </p>
               </div>
            ))}
         </div>
      </div>

      {/* Community Stories Carousel */}
      <StoriesCarousel />

      {/* Badges - Grid Layout */}
      <div className="pb-4">
         <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-xs mb-4 px-1 flex items-center gap-2">
            <Award size={14} className="text-amber-500" /> আপনার অর্জন (Badges)
         </h3>
         <div className="grid grid-cols-2 gap-3">
            {XP_BADGES.map((badge) => {
               const isUnlocked = (userData?.totalXp || 0) >= badge.threshold;
               return (
                  <div key={badge.id} className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${isUnlocked ? badge.bg + ' ' + badge.color + ' border-transparent shadow-sm' : 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-700 grayscale-[0.8] opacity-80'}`}>
                     <div className={`p-2 rounded-full shrink-0 ${isUnlocked ? 'bg-white/50 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                        {isUnlocked ? <badge.icon size={16} /> : <Lock size={16} />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest block opacity-60 truncate">Badge</span>
                        <span className="text-xs font-black uppercase tracking-wide truncate block" title={badge.name}>{badge.name}</span>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Footer (New) */}
      <Footer />

    </div>
  );
};

const TargetIcon = ({ size = 24, className = "" }) => (
   <svg 
     xmlns="http://www.w3.org/2000/svg" 
     width={size} 
     height={size} 
     viewBox="0 0 24 24" 
     fill="none" 
     stroke="currentColor" 
     strokeWidth="2" 
     strokeLinecap="round" 
     strokeLinejoin="round" 
     className={className}
   >
     <circle cx="12" cy="12" r="10" />
     <circle cx="12" cy="12" r="6" />
     <circle cx="12" cy="12" r="2" />
   </svg>
);