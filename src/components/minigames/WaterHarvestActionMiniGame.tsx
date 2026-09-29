import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../../services/audioService';
import { voice } from '../../services/voiceService';
import { Waves, Sparkles, CheckCircle2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WaterHarvestActionMiniGameProps {
  instructions: string;
  onComplete: () => void;
}

interface FallingItem {
  id: number;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  type: 'water' | 'wheat' | 'cotton';
}

export const WaterHarvestActionMiniGame: React.FC<WaterHarvestActionMiniGameProps> = ({
  instructions,
  onComplete
}) => {
  const [basketX, setBasketX] = useState<number>(50); // percentage 0-100
  const [score, setScore] = useState<number>(0);
  const targetScore = 8;
  const [items, setItems] = useState<FallingItem[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const facts = [
    'فيضان النيل كان سر خصوبة تربة مصر عبر آلاف السنين!',
    'القناطر الخيرية حولت أراضي الوجه البحري لنظام الري الدائم!',
    'القطن المصري طويل التيلة أصبح أشهر وأجود أنواع القطن في العالم!',
    'ترعة المحمودية حفرها محمد علي لتوصيل مياه النيل لمدينة الإسكندرية!'
  ];

  // Spawn falling items
  useEffect(() => {
    if (score >= targetScore) {
      if (!isGameOver) {
        setIsGameOver(true);
        sound.playLevelUp();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        voice.speak('يا لعيب! جمعت خيرات النيل كلها وحققت الهدف بمهارة!', onComplete);
      }
      return;
    }

    const interval = setInterval(() => {
      setItems(prev => {
        if (prev.length >= 3) return prev;
        const types: ('water' | 'wheat' | 'cotton')[] = ['water', 'wheat', 'cotton'];
        const newItem: FallingItem = {
          id: Date.now() + Math.random(),
          x: Math.floor(Math.random() * 80) + 10,
          y: 0,
          type: types[Math.floor(Math.random() * types.length)]
        };
        return [...prev, newItem];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [score, isGameOver, onComplete]);

  // Fall animation loop
  useEffect(() => {
    if (isGameOver) return;

    const gameLoop = setInterval(() => {
      setItems(prev => {
        const next: FallingItem[] = [];
        for (const item of prev) {
          const nextY = item.y + 4; // fall speed
          // Check collision with basket at bottom (y >= 80)
          if (nextY >= 75 && nextY <= 90 && Math.abs(item.x - basketX) < 18) {
            // Caught!
            sound.playCoin();
            setScore(s => {
              const newScore = s + 1;
              if (newScore % 2 === 0 && newScore < targetScore) {
                const fact = facts[(newScore / 2 - 1) % facts.length];
                voice.speak(fact);
              }
              return newScore;
            });
          } else if (nextY < 100) {
            next.push({ ...item, y: nextY });
          }
        }
        return next;
      });
    }, 80);

    return () => clearInterval(gameLoop);
  }, [basketX, isGameOver]);

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, relativeX)));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-slate-100 space-y-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Waves className="w-5 h-5 text-sky-400 animate-pulse" />
          <div>
            <h3 className="font-black text-sm text-sky-300">لعبة حركية: جمع خيرات النيل والري</h3>
            <span className="text-[10px] text-slate-400">حرك السلة بإصبعك لالتقاط قطرات النيل والقمح</span>
          </div>
        </div>

        <div className="text-left">
          <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 font-bold text-sky-400 tabular-nums">
            {score} / {targetScore}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-300 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50 leading-relaxed">
        {instructions}
      </p>

      {/* Action Field */}
      <div
        ref={containerRef}
        onTouchMove={handleTouchMove}
        onMouseMove={handleTouchMove}
        className="relative w-full h-64 bg-gradient-to-b from-sky-950 via-slate-900 to-emerald-950 rounded-2xl border-2 border-sky-500/40 overflow-hidden shadow-2xl touch-none select-none cursor-ew-resize"
      >
        {/* River Stream Decor */}
        <div className="absolute inset-0 bg-[radial-gradient(#0284c715_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Falling items */}
        {items.map((item) => (
          <div
            key={item.id}
            style={{ top: `${item.y}%`, left: `${item.x}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl transition-all pointer-events-none drop-shadow-md"
          >
            {item.type === 'water' ? '💧' : item.type === 'wheat' ? '🌾' : '☁️'}
          </div>
        ))}

        {/* Player Knowledge Basket */}
        <div
          style={{ left: `${basketX}%` }}
          className="absolute bottom-3 -translate-x-1/2 w-16 h-10 bg-gradient-to-t from-amber-600 to-amber-500 rounded-b-2xl rounded-t-lg border-2 border-amber-300 shadow-xl flex items-center justify-center text-xs font-black text-slate-950 transition-transform active:scale-95"
        >
          🏺 سلة النيل
        </div>
      </div>

      {score >= targetScore ? (
        <button
          onClick={() => {
            sound.playCorrect();
            onComplete();
          }}
          className="w-full py-3 rounded-xl font-black text-sm bg-gradient-to-r from-sky-400 to-emerald-500 text-slate-950 shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>اكتملت الجولة الحركية بنجاح! متابعة الرحلة</span>
        </button>
      ) : (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>المس الشاشة وحرك يميناً ويساراً لتلتقط العناصر</span>
        </div>
      )}
    </div>
  );
};
