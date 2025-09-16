import React from 'react';
import { HomeModernIcon } from './icons/HomeModernIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-5 px-8 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-800/70 h-[80px] flex items-center">
      <div className="container mx-auto flex items-center gap-4">
        <div className='bg-gradient-to-br from-amber-500 to-amber-600 p-2.5 rounded-lg shadow-md'>
          <HomeModernIcon className="w-6 h-6 text-white" />
        </div>
        <div>
           <h1 className="text-xl font-bold text-gray-100">
            SuperArchitect AI
          </h1>
          <p className="text-sm text-gray-400">by RSPL & YHES</p>
        </div>
      </div>
    </header>
  );
};