import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sun, Droplets, Sprout, Heart, X, Search, ShieldCheck, AlertTriangle, Lightbulb, CheckCircle2, ScanLine, Info, Leaf, ImagePlus, Bug, Scan, Fingerprint, Activity, Database, ShieldAlert, ThermometerSun, ScanEye, Shield, Wind, Sparkles, AlertCircle, Eye, Flower2, Skull, ChevronDown, ChevronUp, Check, ArrowRight, RotateCcw, Calendar, Clock, Bookmark, CloudRain } from 'lucide-react';
import { identifyPlant } from '../services/gemini';
import { PlantData } from '../types';
import { Button } from './ui/Button';
import { Footer } from './Footer';

const COMMON_PESTS = [
  {
    name: "মিলিবাগ (Mealybugs)",
    id: "mealybug",
    color: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-200 dark:border-pink-800",
    symptom: "সাদা তুলোর মতো পোকা, আঠালো রস ও পিঁপড়ে দেখা যায়।",
    remedy: "রাবিং অ্যালকোহল ও নিম তেল",
    instruction: "একটি কটন বাড রাবিং অ্যালকোহলে ভিজিয়ে পোকাগুলো মুছে ফেলুন। এরপর ১ লিটার জলে ৫ মিলি নিম তেল মিশিয়ে ৭ দিন পর পর স্প্রে করুন।"
  },
  {
    name: "জাব পোকা (Aphids)",
    id: "aphids",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-800",
    symptom: "কচি পাতা ও কুঁড়িতে ছোট সবুজ বা কালো পোকা গিজগিজ করে।",
    remedy: "সাবান জল বা নিম তেল",
    instruction: "১ লিটার জলে ১ চামচ লিকুইড সাবান বা শ্যাম্পু মিশিয়ে জোরে স্প্রে করে পোকা ধুয়ে ফেলুন। প্রয়োজনে নিম তেল ব্যবহার করুন।"
  },
  {
    name: "মাকড়সা (Spider Mites)",
    id: "mites",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-800",
    symptom: "পাতার নিচে লাল বিন্দু, পাতা হলুদ হয়ে যায় ও সূক্ষ্ম জাল দেখা যায়।",
    remedy: "ঠান্ডা জল স্প্রে ও আদ্রতা",
    instruction: "এরা শুকনো আবহাওয়া পছন্দ করে। তাই প্রতিদিন পাতার নিচে ঠান্ডা জল স্প্রে করুন। আদ্রতা বাড়ালে এরা চলে যায়।"
  },
  {
    name: "সাদা মাছি (Whiteflies)",
    id: "whitefly",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    border: "border-yellow-200 dark:border-yellow-800",
    symptom: "গাছ নাড়ালে এক ঝাঁক ছোট সাদা মাছি উড়ে যায়।",
    remedy: "হলুদ স্টিকি ট্র্যাপ",
    instruction: "গাছের কাছে হলুদ রঙের আঠালো কাগজ (Yellow Sticky Trap) ঝুলিয়ে দিন। মাছিরা হলুদ রঙে আকৃষ্ট হয়ে আটকে যাবে।"
  }
];

const PREVENTION_TIPS = [
  { 
    id: 'daily_check', 
    label: 'রোজ দেখুন', 
    sub: 'Daily Check', 
    icon: Eye, 
    desc: 'প্রতিদিন সকালে অন্তত ১ মিনিট গাছ পর্যবেক্ষণ করুন।',
    details: 'পাতার রঙ পরিবর্তন বা নতুন কুঁড়ি খেয়াল করুন। সকালের রোদ গাছ দেখার উপযুক্ত সময়। নিয়মিত দেখলে রোগবালাই এড়ানো যায়।',
    cardBg: 'bg-lime-800', 
    textColor: 'text-lime-50',
    accentColor: 'bg-lime-900/40'
  },
  { 
    id: 'underside', 
    label: 'পাতার নিচে', 
    sub: 'Under Leaves', 
    icon: ScanEye, 
    desc: 'বেশিরভাগ পোকা পাতার উল্টো দিকে লুকায়।',
    details: 'মিলিবাগ বা মাকড়সার মতো পোকারা পাতার নিচে বাসা বাঁধে। সপ্তাহে দুবার পাতা উল্টে পরীক্ষা করুন।',
    cardBg: 'bg-yellow-700', 
    textColor: 'text-yellow-50',
    accentColor: 'bg-yellow-800/40'
  },
  { 
    id: 'spots', 
    label: 'পাতায় দাগ', 
    sub: 'Leaf Spots', 
    icon: AlertCircle, 
    desc: 'হলুদ বা কালো দাগ ছত্রাকের লক্ষণ হতে পারে।',
    details: 'পাতায় বাদামী বা কালো দাগ ছত্রাকের আক্রমণ হতে পারে। আক্রান্ত পাতাটি ছিঁড়ে ফেলুন এবং ছত্রাকনাশক স্প্রে করুন।',
    cardBg: 'bg-red-800', 
    textColor: 'text-red-50',
    accentColor: 'bg-red-900/40'
  },
  {
     id: 'sticky', 
     label: 'আঠালো পাতা', 
     sub: 'Sticky Residue', 
     icon: Droplets, 
     desc: 'পাতা আঠালো মনে হলে জাব পোকা খুঁজুন।',
     details: 'পাতায় আঠালো পদার্থ দেখা গেলে জাব পোকা বা মিলিবাগ আছে। সাবান জল বা নিম তেল স্প্রে করে এদের দূর করুন।',
     cardBg: 'bg-orange-700', 
     textColor: 'text-orange-50',
     accentColor: 'bg-orange-800/40'
  },
  { 
    id: 'clean', 
    label: 'পরিচ্ছন্নতা', 
    sub: 'Cleaning', 
    icon: Sparkles, 
    desc: 'টবের আগাছা ও শুকনো পাতা পরিষ্কার রাখুন।',
    details: 'শুকনো পাতা ও আগাছা পোকাদের লুকানোর আদর্শ জায়গা। এগুলো নিয়মিত পরিষ্কার করলে ছত্রাক ও ব্যাকটেরিয়ার সংক্রমণ কমে যায়।',
    cardBg: 'bg-cyan-800', 
    textColor: 'text-cyan-50',
    accentColor: 'bg-cyan-900/40'
  },
  { 
    id: 'air', 
    label: 'বাতাস চলাচল', 
    sub: 'Airflow', 
    icon: Wind, 
    desc: 'গাছগুলো গায়ে গায়ে লাগিয়ে রাখবেন না।',
    details: 'গাছের মধ্যে বাতাস চলাচল জরুরি। ঠাসাঠাসি করে থাকলে ছত্রাক জন্মায়। টবগুলোর মাঝে ফাঁকা জায়গা রাখুন।',
    cardBg: 'bg-violet-800', 
    textColor: 'text-violet-50',
    accentColor: 'bg-violet-900/40'
  }
];

const ALERTS = [
  { title: "বর্ষায় ছত্রাক (Fungi)", desc: "এখন বাতাসে আদ্রতা বেশি। গাছে ছত্রাকনাশক স্প্রে করুন।", icon: CloudRain, color: "from-blue-500 to-indigo-500" },
  { title: "রোদে পোড়া (Sunburn)", desc: "দুপুরের কড়া রোদ থেকে চারা গাছকে বাঁচিয়ে রাখুন।", icon: Sun, color: "from-orange-500 to-red-500" },
  { title: "মিলিবাগ সতর্কতা", desc: "নতুন পাতায় সাদা পোকা দেখলেই নিম তেল দিন।", icon: Bug, color: "from-pink-500 to-rose-500" }
];

export const PlantAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interaction States
  const [expandedPest, setExpandedPest] = useState<string | null>(null);
  const [checkedTips, setCheckedTips] = useState<string[]>([]);
  const [activeStackIndex, setActiveStackIndex] = useState(0);
  const [activeAlert, setActiveAlert] = useState(0);

  useEffect(() => {
    let interval: any;
    if (loading) {
      setLoadingPhase(0);
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % 4);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const alertInterval = setInterval(() => {
      setActiveAlert((prev) => (prev + 1) % ALERTS.length);
    }, 5000);
    return () => clearInterval(alertInterval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const mimeType = image.split(';')[0].split(':')[1];
      const base64Data = image.split(',')[1];
      const data = await identifyPlant(base64Data, mimeType);
      setResult(data);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      let errorMessage = "সনাক্ত করা যায়নি। আবার চেষ্টা করুন।";
      
      const lowerMsg = (err.message || '').toLowerCase();
      if (lowerMsg.includes('quota') || lowerMsg.includes('limit')) {
          errorMessage = "সার্ভার ব্যস্ত। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।";
      } else if (err.message && (err.message.includes('গাছ') || err.message.includes('অস্পষ্ট'))) {
          errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePest = (id: string) => {
    setExpandedPest(expandedPest === id ? null : id);
  };

  const toggleTip = (id: string) => {
    setCheckedTips(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNextCard = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveStackIndex((prev) => (prev + 1) % PREVENTION_TIPS.length);
  };

  const MetricCard = ({ icon: Icon, label, value, color, delay }: any) => (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between h-full animate-fade-in-scale ${delay} relative overflow-hidden group`}>
       <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-10 ${color.replace('text-', 'bg-')}`}></div>
       
       <div className="flex items-center gap-2 mb-3 z-10">
         <div className={`p-2.5 rounded-xl ${color.replace('text-', 'bg-').replace('600', '50')} dark:bg-opacity-20 border ${color.replace('text-', 'border-').replace('600', '100')} dark:border-opacity-30`}>
           <Icon size={20} className={color} strokeWidth={2.5} />
         </div>
         <span className="text-[10px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">{label}</span>
       </div>
       <p className="text-base font-bold text-gray-700 dark:text-gray-300 bn-font leading-snug z-10">{value}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 space-y-6 overflow-hidden">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-2">
         <div>
           <h2 className="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-tight bn-font leading-normal py-1 flex items-center gap-2">
             <span className="bg-gradient-to-tr from-green-400 to-green-600 text-transparent bg-clip-text">গাছ চিনুন</span>
             <ScanLine size={24} className="text-green-500" />
           </h2>
           <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1 pl-1">AI Scanner Tool</p>
         </div>
         <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-green-100 dark:border-green-800">
            Beta
         </div>
      </div>

      <div className="w-full relative">
        {!image ? (
          <div 
            className="group relative w-full h-[320px] md:h-[400px] rounded-[2.5rem] overflow-hidden bg-white dark:bg-gray-800/50 border-4 border-dashed border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center text-center p-6 shadow-sm hover:shadow-xl hover:shadow-green-100 dark:hover:shadow-none"
            onClick={() => fileInputRef.current?.click()}
          >
             <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#22c55e_1.5px,transparent_1.5px)] [background-size:24px_24px] group-hover:opacity-10 transition-opacity"></div>
             
             <div className="relative w-32 h-32 mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-green-200 dark:border-green-800 scale-90 group-hover:scale-110 transition-transform duration-1000 ease-in-out opacity-50"></div>
                <div className="absolute inset-4 rounded-full border-2 border-green-100 dark:border-green-900/50 group-hover:scale-105 transition-transform duration-700"></div>
                <div className="absolute inset-6 bg-gradient-to-br from-green-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-full shadow-xl shadow-green-100 dark:shadow-none flex items-center justify-center z-10 group-hover:-translate-y-2 transition-transform duration-300 border border-white dark:border-gray-700">
                    <div className="relative">
                        <Leaf size={40} className="text-green-500 fill-green-100 dark:fill-green-900/20" strokeWidth={1.5} />
                        <div className="absolute -right-2 -bottom-2 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md border border-gray-100 dark:border-gray-700">
                           <Search size={14} className="text-blue-500" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
                <div className="absolute top-2 right-0 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-2xl shadow-sm animate-float border border-blue-100 dark:border-blue-800">
                    <Camera size={16} className="text-blue-500" />
                </div>
                <div className="absolute bottom-2 left-0 bg-orange-50 dark:bg-orange-900/30 p-2 rounded-2xl shadow-sm animate-float delay-500 border border-orange-100 dark:border-orange-800">
                    <ImagePlus size={16} className="text-orange-500" />
                </div>
             </div>
             
             <div className="relative z-10 space-y-2">
                 <h3 className="text-xl font-black text-gray-800 dark:text-gray-100 bn-font leading-tight">
                    ছবি তুলুন বা <br/>
                    <span className="text-green-600 dark:text-green-400">আপলোড করুন</span>
                 </h3>
                 <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 max-w-[180px] mx-auto uppercase tracking-wide leading-relaxed">
                   Identify plants & diseases instantly with AI
                 </p>
             </div>
          </div>
        ) : (
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-gray-900 w-full h-[400px] md:h-[500px] animate-fade-in group">
             <img src={image} alt="Plant" className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? 'opacity-40 blur-md scale-110' : 'opacity-100 scale-100'}`} />
             {!loading && (
               <button 
                 onClick={() => { setImage(null); setResult(null); }}
                 className="absolute top-4 right-4 bg-white/20 hover:bg-black/50 text-white p-2.5 rounded-full backdrop-blur-md transition-all border border-white/20 z-20"
               >
                 <X size={20} strokeWidth={2.5} />
               </button>
             )}
             {loading && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 z-0 opacity-20" 
                         style={{ 
                            backgroundImage: 'linear-gradient(rgba(74, 222, 128, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(74, 222, 128, 0.5) 1px, transparent 1px)', 
                            backgroundSize: '30px 30px' 
                         }}>
                    </div>
                    <div className="absolute w-full h-1 bg-green-400 shadow-[0_0_20px_rgba(74,222,128,1)] animate-scan top-0 z-10"></div>
                    <div className="absolute w-full h-32 bg-gradient-to-b from-green-500/20 to-transparent animate-scan top-0 z-0"></div>
                    <div className="relative z-20 mb-8">
                        <div className="absolute inset-[-20px] border border-green-500/30 rounded-full border-dashed animate-spin-slow"></div>
                        <div className="absolute inset-[-10px] border border-green-400/50 rounded-full border-t-transparent border-l-transparent animate-[spin_3s_linear_infinite_reverse]"></div>
                        <div className="w-20 h-20 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-green-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.3)] relative overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2),transparent)]"></div>
                            {loadingPhase === 0 && <Scan size={32} className="text-green-400 animate-pulse" />}
                            {loadingPhase === 1 && <Fingerprint size={32} className="text-blue-400 animate-pulse" />}
                            {loadingPhase === 2 && <Search size={32} className="text-yellow-400 animate-pulse" />}
                            {loadingPhase === 3 && <Activity size={32} className="text-purple-400 animate-pulse" />}
                        </div>
                    </div>
                    <div className="bg-black/70 backdrop-blur-md px-6 py-3 rounded-xl border border-green-500/20 text-center z-20 max-w-[80%]">
                        <h3 className="text-green-400 font-black text-sm uppercase tracking-widest animate-pulse mb-1 bn-font">
                            {["ইমেজ প্রসেসিং...", "লক্ষণ বিশ্লেষণ...", "তথ্য যাচাই...", "রিপোর্ট তৈরি..."][loadingPhase]}
                        </h3>
                    </div>
                </div>
             )}
          </div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
      
      {/* Analysis Results View (Button) */}
      {image && !result && !loading && (
        <Button onClick={handleAnalyze} fullWidth variant="secondary" className="bn-font text-lg shadow-xl shadow-blue-200/50 dark:shadow-none animate-pop mt-6 mb-2">
          <ScanLine className="mr-2" size={20} /> বিশ্লেষণ শুরু করুন
        </Button>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-6 py-4 rounded-3xl border border-red-100 dark:border-red-900 font-black text-center w-full bn-font animate-shake flex items-center justify-center gap-3">
          <AlertTriangle size={24} />
          {error}
        </div>
      )}

      {!result && (
        <div className="w-full mt-4 animate-slide-up delay-100 space-y-6">
           {/* 1. AI Process Flow (Only show if no image to save space) */}
           {!image && (
             <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"></div>
                <h3 className="text-center font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-[10px] mb-6">AI Diagnosis Process</h3>
                
                <div className="flex justify-between items-center relative z-10">
                   {/* Step 1 */}
                   <div className="flex flex-col items-center gap-2 group">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shadow-sm border border-blue-100 dark:border-blue-800 group-hover:scale-110 transition-transform duration-300 relative">
                         <Camera size={24} />
                         <div className="absolute -right-1 -top-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 text-[10px] text-white flex items-center justify-center font-bold">1</div>
                      </div>
                      <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">ছবি তুলুন</p>
                   </div>
                   
                   {/* Arrow 1 */}
                   <div className="flex-1 h-[2px] bg-gray-100 dark:bg-gray-700 mx-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent to-blue-400 animate-[shimmer_1.5s_infinite]"></div>
                   </div>
  
                   {/* Step 2 */}
                   <div className="flex flex-col items-center gap-2 group">
                      <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center shadow-sm border border-purple-100 dark:border-purple-800 group-hover:scale-110 transition-transform duration-300 delay-100 relative">
                         <ScanLine size={24} />
                         <div className="absolute -right-1 -top-1 w-4 h-4 bg-purple-500 rounded-full border-2 border-white dark:border-gray-800 text-[10px] text-white flex items-center justify-center font-bold">2</div>
                      </div>
                      <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">বিশ্লেষণ</p>
                   </div>
  
                   {/* Arrow 2 */}
                   <div className="flex-1 h-[2px] bg-gray-100 dark:bg-gray-700 mx-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent to-purple-400 animate-[shimmer_1.5s_infinite] delay-75"></div>
                   </div>
  
                   {/* Step 3 */}
                   <div className="flex flex-col items-center gap-2 group">
                      <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/30 text-green-500 flex items-center justify-center shadow-sm border border-green-100 dark:border-green-800 group-hover:scale-110 transition-transform duration-300 delay-200 relative">
                         <Leaf size={24} />
                         <div className="absolute -right-1 -top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 text-[10px] text-white flex items-center justify-center font-bold">3</div>
                      </div>
                      <p className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">সমাধান</p>
                   </div>
                </div>
             </div>
           )}

           {/* 2. Dynamic Status Board */}
           <div className="grid grid-cols-2 gap-4">
              {/* Live Alert */}
              <div className={`col-span-2 bg-gradient-to-r ${ALERTS[activeAlert].color} rounded-3xl p-5 text-white relative overflow-hidden shadow-lg shadow-orange-200 dark:shadow-none transition-all duration-500`}>
                 <div className="absolute top-0 right-0 p-3 opacity-10 rotate-12">
                    {React.createElement(ALERTS[activeAlert].icon, { size: 80 })}
                 </div>
                 <div className="relative z-10 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">Live Alert</span>
                       <span className="text-[10px] font-bold opacity-80">Season Watch</span>
                    </div>
                    <h3 className="text-xl font-black bn-font mb-1">{ALERTS[activeAlert].title}</h3>
                    <p className="text-xs font-medium opacity-90 bn-font leading-relaxed max-w-[80%]">
                       {ALERTS[activeAlert].desc}
                    </p>
                 </div>
                 {/* Carousel Indicators */}
                 <div className="absolute bottom-4 right-4 flex gap-1">
                    {ALERTS.map((_, i) => (
                       <div key={i} className={`h-1.5 rounded-full transition-all ${i === activeAlert ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}></div>
                    ))}
                 </div>
              </div>

              {/* Stat Card 1 */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-500 flex items-center justify-center mb-2">
                     <Database size={18} />
                  </div>
                  <div>
                     <h4 className="text-2xl font-black text-gray-800 dark:text-gray-100">৮৫০+</h4>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Plants in DB</p>
                  </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:scale-105 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center mb-2">
                     <Activity size={18} />
                  </div>
                  <div>
                     <h4 className="text-2xl font-black text-gray-800 dark:text-gray-100">৯৮%</h4>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Accuracy</p>
                  </div>
              </div>
           </div>

           {/* 3. Prevention Tips (Restored) */}
           <div className="mt-8">
             <div className="flex items-center gap-2 mb-4 px-1">
                 <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-500">
                    <ShieldCheck size={16} />
                 </div>
                 <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-sm">
                    রোগ প্রতিরোধের উপায় (Prevention)
                 </h3>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
               {PREVENTION_TIPS.map((tip) => (
                 <div key={tip.id} className={`${tip.cardBg} rounded-3xl p-4 relative overflow-hidden shadow-sm group min-h-[140px] flex flex-col justify-between`}>
                    <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full ${tip.accentColor} opacity-50 transition-transform group-hover:scale-150`}></div>
                    <div>
                        <tip.icon size={24} className={`${tip.textColor} mb-2 relative z-10 opacity-90`} />
                        <h4 className={`font-black ${tip.textColor} text-sm mb-1 relative z-10 leading-tight`}>{tip.label}</h4>
                        <p className={`text-[10px] font-bold ${tip.textColor} opacity-80 uppercase tracking-wide relative z-10`}>{tip.sub}</p>
                    </div>
                    <p className={`text-[10px] font-bold ${tip.textColor} opacity-90 bn-font leading-relaxed relative z-10 mt-2`}>
                      {tip.desc}
                    </p>
                 </div>
               ))}
             </div>
           </div>

           {/* 4. Pesticides & Pest Control (Restored) */}
           <div className="mt-8 pb-4">
               <div className="flex items-center gap-2 mb-4 px-1">
                 <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-500">
                   <Bug size={16} />
                 </div>
                 <h3 className="font-black text-gray-700 dark:text-gray-200 uppercase tracking-wider text-sm">
                   বালাই দমন ও কীটনাশক (Pest Control)
                 </h3>
             </div>

             <div className="space-y-3">
               {COMMON_PESTS.map((pest) => {
                  const isExpanded = expandedPest === pest.id;
                  return (
                    <div key={pest.id} className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-green-500 shadow-md ring-1 ring-green-500/20' : 'border-gray-100 dark:border-gray-700'}`}>
                       <button 
                         onClick={() => togglePest(pest.id)}
                         className="w-full flex items-center justify-between p-4 text-left group"
                       >
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-xl ${pest.bg} ${pest.color} group-hover:scale-110 transition-transform`}>
                                <Bug size={20} />
                             </div>
                             <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm bn-font">{pest.name}</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tap for Pesticides Info</p>
                             </div>
                          </div>
                          <div className={`p-1 rounded-full bg-gray-50 dark:bg-gray-700 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-green-50 text-green-500' : 'text-gray-400'}`}>
                              <ChevronDown size={16} />
                          </div>
                       </button>
                       
                       {isExpanded && (
                          <div className="px-4 pb-5 pt-0 animate-fade-in">
                             <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-700 mb-4"></div>
                             
                             <div className="space-y-4">
                                <div>
                                   <span className="text-[10px] font-black uppercase text-red-400 tracking-widest flex items-center gap-1 mb-1">
                                      <AlertCircle size={10} /> লক্ষণ (Symptoms)
                                   </span>
                                   <p className="text-sm text-gray-600 dark:text-gray-300 bn-font leading-relaxed">
                                      {pest.symptom}
                                   </p>
                                </div>
                                
                                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800/30 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 dark:bg-green-800 rounded-full opacity-10 blur-xl -mr-4 -mt-4"></div>
                                   <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 tracking-widest flex items-center gap-1 mb-1 relative z-10">
                                      <ShieldCheck size={10} /> প্রতিকার ও কীটনাশক (Solution)
                                   </span>
                                   <p className="text-sm font-bold text-green-700 dark:text-green-300 bn-font mb-1 relative z-10">
                                      {pest.remedy}
                                   </p>
                                   <p className="text-xs text-green-800/80 dark:text-green-200/70 bn-font leading-relaxed relative z-10">
                                      {pest.instruction}
                                   </p>
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                  );
               })}
             </div>
           </div>
        </div>
      )}

      {result && (
        <div className="w-full space-y-5 animate-slide-up pb-10">
          
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 text-center relative overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-50 to-transparent dark:from-green-900/20"></div>
             <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-3 border border-green-200 dark:border-green-800">
                    <CheckCircle2 size={12} /> {result.disease.includes('Offline') ? 'Offline Identified' : 'Identified'}
                </div>
                <h3 className="text-3xl font-black bn-font text-gray-800 dark:text-gray-100 mb-1 leading-tight">{result.name}</h3>
                <p className="text-sm font-bold text-gray-400 dark:text-gray-500 italic font-serif">{result.scientificName}</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <MetricCard icon={Droplets} color="text-blue-500" label="Water Need" value={result.water} delay="delay-100" />
            <MetricCard icon={Sun} color="text-orange-500" label="Sunlight" value={result.sunlight} delay="delay-200" />
            <MetricCard icon={Sprout} color="text-amber-600" label="Soil Type" value={result.soil} delay="delay-300" />
            <MetricCard icon={Heart} color="text-rose-500" label="Care Level" value={result.care} delay="delay-100" />
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-[2.5rem] border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm animate-slide-up delay-200">
             <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2">
                   <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                      <ShieldCheck size={20} strokeWidth={2.5} />
                   </div>
                   <div>
                       <h3 className="font-black text-gray-800 dark:text-gray-200 uppercase text-xs tracking-wider">Health Report</h3>
                       <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500">Diagnosis by AI</p>
                   </div>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide border ${result.disease.includes('সুস্থ') ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800'}`}>
                   {result.disease.includes('সুস্থ') ? 'Healthy' : 'Attention Needed'}
                </div>
             </div>
             
             <div className="p-6">
                <div className="flex gap-4 mb-6">
                    <div className="w-1 bg-gray-200 dark:bg-gray-700 rounded-full h-full min-h-[40px]">
                        <div className={`w-full ${result.disease.includes('সুস্থ') ? 'bg-green-400' : 'bg-red-400'} rounded-full h-full`}></div>
                    </div>
                    <p className={`font-bold bn-font text-lg leading-relaxed ${result.disease.includes('সুস্থ') ? 'text-gray-600 dark:text-gray-300' : 'text-red-600 dark:text-red-400'}`}>
                      {result.disease}
                    </p>
                </div>

                <div className="space-y-3">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2 mb-2">
                     <Lightbulb size={14} className="text-yellow-400 fill-yellow-400" /> Care Recommendations
                   </h4>
                   {result.tips && result.tips.length > 0 ? (
                     <div className="grid gap-3">
                        {result.tips.map((tip, idx) => (
                           <div key={idx} className="flex gap-3 bg-yellow-50/50 dark:bg-yellow-900/20 p-4 rounded-2xl border border-yellow-100/50 dark:border-yellow-900/30">
                              <span className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 border border-yellow-200 dark:border-yellow-800 shadow-sm">
                                {idx + 1}
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold bn-font leading-relaxed">{tip}</span>
                           </div>
                        ))}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-400 dark:text-gray-500 italic">আর কোনো টিপস নেই</p>
                   )}
                </div>
             </div>
          </div>
          
          <Button variant="outline" fullWidth onClick={() => { setImage(null); setResult(null); }} className="bn-font mt-4 rounded-3xl border-2">
            <Camera size={18} className="mr-2" /> অন্য ছবি দিন
          </Button>
        </div>
      )}

      {/* Warning Disclaimer Box */}
      <div className="w-full mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 flex gap-4 animate-fade-in">
        <div className="p-2 bg-orange-100 dark:bg-orange-800/30 rounded-full h-fit text-orange-600 dark:text-orange-400">
           <AlertTriangle size={20} />
        </div>
        <div>
           <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-1 bn-font">সতর্কতা (Disclaimer)</h4>
           <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bn-font">
              এটি একটি AI ভিত্তিক টুল। ফলাফল ভুল হতে পারে। গাছের গুরুতর সমস্যার জন্য সর্বদা কৃষি বিশেষজ্ঞের পরামর্শ নিন।
           </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};