import React from 'react';
import { Github, Twitter, Heart } from 'lucide-react';

export const Footer = () => (
   <div className="py-8 mt-4 flex flex-col items-center justify-center w-full">
      <div className="flex items-center gap-6 mb-6">
         <a href="#" className="p-4 bg-white dark:bg-gray-800 rounded-3xl text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:scale-110 hover:shadow-xl transition-all border-2 border-gray-100 dark:border-gray-700 group">
            <Github size={28} strokeWidth={2} className="group-hover:rotate-12 transition-transform" />
         </a>
         <a href="#" className="p-4 bg-white dark:bg-gray-800 rounded-3xl text-gray-400 dark:text-gray-500 hover:text-blue-500 hover:scale-110 hover:shadow-xl transition-all border-2 border-gray-100 dark:border-gray-700 group">
            <Twitter size={28} strokeWidth={2} className="group-hover:-rotate-12 transition-transform" />
         </a>
      </div>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-gray-100/50 dark:bg-gray-800/50 px-6 py-2.5 rounded-full border border-gray-200/50 dark:border-gray-700 backdrop-blur-md">
         Made with <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" /> for Nature
      </div>
      <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 mt-4 tracking-widest">© 2024 Sobuj Sathi AI</p>
   </div>
);