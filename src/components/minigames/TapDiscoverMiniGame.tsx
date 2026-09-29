import React, { useState } from 'react';
import { TapDiscoverHotspot } from '../../types';
import { sound } from '../../services/audioService';
import { voice } from '../../services/voiceService';
import { Volume2, CheckCircle2, Sparkles, MapPin } from 'lucide-react';

interface TapDiscoverMiniGameProps {
  hotspots?: TapDiscoverHotspot[];
  instructions: string;
  onComplete: () => void;
}

const DEFAULT_HOTSPOTS: TapDiscoverHotspot[] = [
  { id: 'h1', title: 'دلتا النيل والأراضي الزراعية', x: 50, y: 35, audioFact: 'دلتا النيل في شمال مصر.. فيها أخصب الأراضي الزراعية اللي بتزرع بالري الدائم من أيام القناطر الخيرية لمحمد علي!', discovered: false },
  { id: 'h2', title: 'موقع الإسكندرية ومقاومة كُريّم', x: 38, y: 25, audioFact: 'عروس البحر المتوسط.. مدينة الإسكندرية اللي قاوم فيها البطل محمد كُريّم أسطول نابليون بونابرت!', discovered: false },
  { id: 'h3', title: 'القاهرة والجامع الأزهر', x: 53, y: 52, audioFact: 'القاهرة الفاطمية.. ومنها اشتعلت ثورة القاهرة الأولى من الجامع الأزهر الشريف ضد الفرنسيين سنة 1798!', discovered: false },
  { id: 'h4', title: 'صحراء العباسية والريدانية', x: 62, y: 48, audioFact: 'صحراء الريدانية شرق القاهرة.. موقع المعركة الفاصلة سنة 1517م اللي هزم فيها سليم الأول طومان باي!', discovered: false },
  { id: 'h5', title: 'شبه جزيرة سيناء وقناة السويس', x: 75, y: 42, audioFact: 'بوابة مصر الشرقية.. وبها ممر قناة السويس الملاحي اللي حفر بدماء المصريين واستشهد الآلاف دفاعاً عنه!', discovered: false }
];

export const TapDiscoverMiniGame: React.FC<TapDiscoverMiniGameProps> = ({
  hotspots = DEFAULT_HOTSPOTS,
  instructions,
  onComplete
}) => {
  const [spots, setSpots] = useState<TapDiscoverHotspot[]>(hotspots);
  const [activeSpot, setActiveSpot] = useState<TapDiscoverHotspot | null>(null);

  const handleTap = (spot: TapDiscoverHotspot) => {
    sound.playClick();
    sound.playCoin();
    setActiveSpot(spot);

    // Speak fact with voice narrator immediately
    voice.speak(`${spot.title}.. ${spot.audioFact}`);

    setSpots(prev => prev.map(s => s.id === spot.id ? { ...s, discovered: true } : s));
  };

  const discoveredCount = spots.filter(s => s.discovered).length;
  const isAllDiscovered = discoveredCount === spots.length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm text-emerald-300">المس واكتشف (صوتي وتفاعلي)</h3>
            <span className="text-[10px] text-slate-400">اضغط على النجوم لسماع أسرار المعالم</span>
          </div>
        </div>

        <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 font-bold text-emerald-400 tabular-nums">
          {discoveredCount} / {spots.length}
        </span>
      </div>

      <p className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 leading-relaxed">
        {instructions}
      </p>

      {/* Visual Discovery Canvas */}
      <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-sky-950 via-slate-900 to-indigo-950 rounded-2xl border-2 border-emerald-500/40 overflow-hidden shadow-2xl">
        {/* River Nile Stylized Graphic */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 400 250">
          <path d="M 210,250 Q 215,180 205,130 Q 195,100 205,80 Q 210,65 190,40 Q 230,40 220,70" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeLinecap="round" />
          <path d="M 205,80 Q 170,45 160,35" fill="none" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
          <path d="M 205,80 Q 240,50 255,40" fill="none" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
        </svg>

        {/* Hotspots */}
        {spots.map((spot) => {
          const isSelected = activeSpot?.id === spot.id;

          return (
            <button
              key={spot.id}
              onClick={() => handleTap(spot)}
              style={{ top: `${spot.y}%`, left: `${spot.x}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all group z-10 cursor-pointer ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110 active:scale-95'
              }`}
            >
              <div className="relative">
                <span className={`w-4 h-4 rounded-full block border-2 shadow-lg ${
                  spot.discovered
                    ? 'bg-emerald-400 border-white ring-2 ring-emerald-400/50'
                    : 'bg-amber-400 border-amber-100 animate-bounce'
                }`} />
                {!spot.discovered && (
                  <span className="absolute -inset-1 rounded-full bg-amber-400/50 animate-ping" />
                )}
              </div>
              <span className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap px-2 py-0.5 rounded shadow-lg font-bold border ${
                spot.discovered
                  ? 'bg-slate-900/95 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-900/95 text-amber-300 border-amber-500/40 animate-pulse'
              }`}>
                {spot.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Spoken Info Card */}
      {activeSpot && (
        <div className="bg-slate-800/90 border border-emerald-500/50 p-3.5 rounded-xl space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-emerald-300 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {activeSpot.title}
            </h4>
            <button
              onClick={() => voice.speak(activeSpot.audioFact)}
              className="text-xs bg-emerald-950 text-emerald-300 hover:bg-emerald-900 px-2 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              إعادة الاستماع
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            "{activeSpot.audioFact}"
          </p>
        </div>
      )}

      {/* Completion Button */}
      <button
        disabled={!isAllDiscovered}
        onClick={() => {
          sound.playCorrect();
          voice.speak('ممتاز جداً يا بطل! اكتشفت كل معالم الخريطة بنجاح!', onComplete);
        }}
        className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
          isAllDiscovered
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
        }`}
      >
        <CheckCircle2 className="w-4 h-4" />
        {isAllDiscovered ? 'استمعت للجميع! انطلق للتحدي التالي' : `المس باقي المعالم (${spots.length - discoveredCount} متبقية)`}
      </button>
    </div>
  );
};
