import React, { useState, useEffect } from 'react';
import { sound } from '../services/audioService';
import { voice } from '../services/voiceService';
import { Volume2, Sparkles, X, Play } from 'lucide-react';

interface WelcomeAudioBannerProps {
  playerName: string;
}

export const WelcomeAudioBanner: React.FC<WelcomeAudioBannerProps> = ({ playerName }) => {
  const [hasInteracted, setHasInteracted] = useState<boolean>(() => {
    return sessionStorage.getItem('audio_welcomed_v1') === 'true';
  });

  const handleStartAudio = () => {
    sound.playLevelUp();
    voice.unlockAudio();
    sessionStorage.setItem('audio_welcomed_v1', 'true');
    setHasInteracted(true);
    voice.playWelcomeAudio();
  };

  if (hasInteracted) return null;

  return (
    <div className="fixed top-14 left-3 right-3 z-40 max-w-lg mx-auto animate-fadeIn">
      <div className="bg-gradient-to-r from-amber-950/95 via-slate-900 to-amber-950/95 border-2 border-amber-500/70 shadow-2xl rounded-2xl p-3.5 backdrop-blur-md flex items-center justify-between gap-3 text-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
            <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">الراوي عم رشيد بانتظارك!</span>
              <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full font-bold">صوت مسموع</span>
            </div>
            <p className="text-[11px] text-slate-300">
              اضغط لبدء المغامرة وسماع القصة والشرح الصوتي بدون قراءة طويلة.
            </p>
          </div>
        </div>

        <button
          onClick={handleStartAudio}
          className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          <span>تشغيل الصوت 🎙️</span>
        </button>
      </div>
    </div>
  );
};
