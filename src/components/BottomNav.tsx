import React from 'react';
import { Home, Map, Gamepad2, Gift, RefreshCw, Trophy } from 'lucide-react';
import { sound } from '../services/audioService';

export type TabType = 'home' | 'map' | 'arcade' | 'rewards' | 'review' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unresolvedMistakesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unresolvedMistakesCount
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'الرئيسية', icon: Home },
    { id: 'map' as TabType, label: 'الخريطة', icon: Map },
    { id: 'arcade' as TabType, label: 'التحديات', icon: Gamepad2 },
    { id: 'rewards' as TabType, label: 'المكافآت', icon: Gift },
    { 
      id: 'review' as TabType, 
      label: 'المراجعة', 
      icon: RefreshCw, 
      badge: unresolvedMistakesCount > 0 ? unresolvedMistakesCount : undefined 
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 min-h-[48px] rounded-lg transition-all relative ${
                isActive
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''}`} />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center border border-slate-900 animate-bounce">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1 h-1 bg-amber-400 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
