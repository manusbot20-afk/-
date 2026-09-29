import React, { useState, useEffect } from 'react';
import { voice } from '../services/voiceService';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export const VoiceNarrationBar: React.FC = () => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentText, setCurrentText] = useState<string>('');

  useEffect(() => {
    const unsubscribe = voice.subscribe((speaking, text) => {
      setIsSpeaking(speaking);
      if (text) setCurrentText(text);
    });
    return unsubscribe;
  }, []);

  if (!isSpeaking || !currentText) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto pointer-events-none animate-fadeIn">
      <div className="bg-slate-950/95 border-2 border-amber-500/60 shadow-2xl rounded-2xl p-3.5 backdrop-blur-md flex items-center gap-3 text-right pointer-events-auto">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
          <Volume2 className="w-5 h-5 text-amber-400 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] font-black text-amber-400 bg-amber-950 px-2 py-0.2 rounded-full border border-amber-500/30">
              الراوي الصوتي عم رشيد يتحدث
            </span>
            <div className="flex items-center gap-0.5">
              {[8, 14, 10, 18, 12, 16].map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${h}px` }}
                  className="w-0.5 bg-amber-400 rounded-full animate-pulse"
                />
              ))}
            </div>
          </div>
          <p className="text-xs font-bold text-white line-clamp-2 leading-relaxed">
            {currentText}
          </p>
        </div>

        <button
          onClick={() => voice.stop()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 text-xs shrink-0 cursor-pointer"
          title="إيقاف الصوت"
        >
          <VolumeX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
