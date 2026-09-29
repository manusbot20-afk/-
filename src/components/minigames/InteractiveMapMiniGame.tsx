import React, { useState } from 'react';
import { InteractiveMapPin } from '../../types';
import { sound } from '../../services/audioService';
import { CheckCircle2, MapPin, Compass, Sparkles } from 'lucide-react';

interface InteractiveMapMiniGameProps {
  pins: InteractiveMapPin[];
  instructions: string;
  onComplete: () => void;
}

export const InteractiveMapMiniGame: React.FC<InteractiveMapMiniGameProps> = ({
  pins,
  instructions,
  onComplete
}) => {
  const [visitedPins, setVisitedPins] = useState<string[]>([]);
  const [selectedPin, setSelectedPin] = useState<InteractiveMapPin | null>(null);

  const handlePinClick = (pin: InteractiveMapPin) => {
    sound.playClick();
    setSelectedPin(pin);

    if (!visitedPins.includes(pin.id)) {
      sound.playCoin();
      const nextVisited = [...visitedPins, pin.id];
      setVisitedPins(nextVisited);

      if (nextVisited.length === pins.length) {
        sound.playFanfare ? sound.playFanfare() : sound.playCorrect();
      }
    }
  };

  const isAllDiscovered = visitedPins.length === pins.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          <h3 className="font-bold text-sm text-emerald-300">الخريطة التفاعلية: استكشاف المعالم</h3>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          المكتشف: <span className="text-emerald-400 font-bold tabular-nums">{visitedPins.length}</span> من {pins.length}
        </span>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
        {instructions}
      </p>

      {/* Styled Interactive Map Canvas */}
      <div className="relative w-full aspect-[16/9] bg-gradient-to-b from-sky-950 via-slate-900 to-indigo-950 rounded-xl border-2 border-emerald-500/30 overflow-hidden shadow-2xl">
        {/* Subtle Map Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c710_1px,transparent_1px),linear-gradient(to_bottom,#0284c710_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* World Map silhouette illustration */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          <svg className="w-4/5 h-4/5 text-teal-400" fill="currentColor" viewBox="0 0 1000 500">
            <path d="M150,120 Q180,90 220,110 T300,160 T250,240 T160,200 Z" />
            <path d="M450,100 Q520,80 580,120 T620,180 T560,220 T460,180 Z" />
            <path d="M480,220 Q560,230 580,320 T520,440 T440,360 T450,250 Z" />
            <path d="M680,120 Q780,100 860,140 T920,260 T800,280 T700,200 Z" />
            <path d="M780,320 Q860,310 880,380 T800,440 T740,380 Z" />
          </svg>
        </div>

        {/* Map Pins */}
        {pins.map((pin) => {
          const isVisited = visitedPins.includes(pin.id);
          const isSelected = selectedPin?.id === pin.id;

          return (
            <button
              key={pin.id}
              onClick={() => handlePinClick(pin)}
              style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all group z-10 ${
                isSelected
                  ? 'scale-125 z-20 ring-4 ring-emerald-400/50'
                  : 'hover:scale-110 active:scale-95'
              }`}
            >
              <div className="relative">
                <span className={`w-3.5 h-3.5 rounded-full block border-2 shadow-lg ${
                  isVisited
                    ? 'bg-emerald-400 border-white ring-2 ring-emerald-500'
                    : 'bg-amber-400 border-amber-200 animate-pulse'
                }`} />
                {/* Radar pulse for unvisited */}
                {!isVisited && (
                  <span className="absolute -inset-1 rounded-full bg-amber-400/40 animate-ping" />
                )}
              </div>
              <span className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap px-1.5 py-0.5 rounded shadow font-bold ${
                isVisited
                  ? 'bg-slate-900/90 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900/90 text-amber-300 border border-amber-500/40'
              }`}>
                {pin.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Pin Info Card */}
      {selectedPin ? (
        <div className="bg-slate-800/90 border border-emerald-500/40 rounded-lg p-3 space-y-1.5 transition-all animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {selectedPin.title}
            </span>
            <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              تم التثبيت على الخريطة ✓
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedPin.info}
          </p>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 py-2">
          اضغط على أي علامة متوهجة على الخريطة لقراءة إحداثياتها الجغرافية.
        </p>
      )}

      {/* Complete Button */}
      <button
        disabled={!isAllDiscovered}
        onClick={() => {
          sound.playCorrect();
          onComplete();
        }}
        className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
          isAllDiscovered
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        {isAllDiscovered ? 'استعادة إحداثيات الخريطة كاملة! (متابعة)' : `اكتشف باقي المعالم (${pins.length - visitedPins.length} متبقية)`}
      </button>
    </div>
  );
};
