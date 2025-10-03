import React from 'react';
import type { View } from '../types';
import { HomeModernIcon } from './icons/HomeModernIcon';
import { PaintBrushIcon } from './icons/PaintBrushIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { LightBulbIcon } from './icons/LightBulbIcon';
import { UsersIcon } from './icons/UsersIcon';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const navItems: { view: View; label: string; icon: React.FC<any> }[] = [
  { view: 'architecture', label: 'Architecture', icon: HomeModernIcon },
  { view: 'interior', label: 'Interior Revamp', icon: PaintBrushIcon },
  { view: 'designer', label: 'Superhuman Designer', icon: UserCircleIcon },
  { view: 'inspiration', label: 'Inspiration', icon: LightBulbIcon },
  { view: 'agents', label: 'Agents', icon: UsersIcon },
];

const NavItem: React.FC<{
  item: typeof navItems[0];
  isActive: boolean;
  onClick: () => void;
}> = ({ item, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
        isActive
          ? 'text-amber-300'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      <item.icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : ''}`} />
      <span>{item.label}</span>
      {isActive && (
        <div className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-amber-400 rounded-full"></div>
      )}
    </button>
  );
};

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="py-3 px-4 sm:px-6 lg:px-8 bg-brand-dark/70 backdrop-blur-lg sticky top-0 z-40 border-b border-brand-border/60">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo and App Name */}
        <div className="flex items-center gap-3">
          <div className='bg-gradient-to-br from-brand-amber-500 to-brand-amber-600 p-2.5 rounded-lg shadow-md'>
            <HomeModernIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">
              SuperArchitect AI
            </h1>
            <p className="text-sm text-gray-400 hidden sm:block">by RSPL & YHES</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <NavItem
              key={item.view}
              item={item}
              isActive={currentView === item.view}
              onClick={() => setView(item.view)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
};
