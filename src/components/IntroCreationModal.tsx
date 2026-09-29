import React, { useState } from 'react';
import { PlayerProfile } from '../types';
import { GameStorage } from '../services/storageService';
import { sound } from '../services/audioService';
import { Compass, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface IntroCreationModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const IntroCreationModal: React.FC<IntroCreationModalProps> = ({
  isOpen,
  onComplete
}) => {
  const [step, setStep] = useState<'character' | 'story'>('character');
  const [name, setName] = useState<string>('بطل المعرفة');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('/src/assets/images/avatar_boy_hero_1790663154099.jpg');

  if (!isOpen) return null;

  const characters = [
    {
      id: 'boy',
      name: 'المستكشف زياد',
      avatar: '/src/assets/images/avatar_boy_hero_1790663154099.jpg',
      desc: 'ذكي، شجاع، يعشق تتبع الجبال والبحار وأسرار المعارك التاريخية.'
    },
    {
      id: 'girl',
      name: 'المستكشفة فريدة',
      avatar: '/src/assets/images/avatar_girl_hero_1790663168362.jpg',
      desc: 'نبيهة، سريعة الملاحظة، خبيرة في فك شفرات الخرائط والأحداث.'
    }
  ];

  const handleNextToStory = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (!name.trim()) return;
    setStep('story');
  };

  const handleStartGame = () => {
    sound.playLevelUp();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    const profile = GameStorage.getProfile();
    const updated: PlayerProfile = {
      ...profile,
      name: name.trim(),
      selectedAvatar
    };
    GameStorage.saveProfile(updated);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-500/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn text-slate-100 p-6 space-y-5">
        {step === 'character' ? (
          <form onSubmit={handleNextToStory} className="space-y-5 text-right">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-950/70 border border-amber-500/40 px-3 py-0.5 rounded-full inline-block">
                مرحباً بك في رحلة إنقاذ المعرفة!
              </span>
              <h3 className="text-xl font-black text-white">
                اختر شخصيتك ولقبك في المغامرة
              </h3>
              <p className="text-xs text-slate-300">
                منهج الدراسات الاجتماعية للصف الثالث الإعدادي بطريقة حماسية لا تُنسى
              </p>
            </div>

            {/* Character Selection Cards */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {characters.map((char) => {
                const isSelected = selectedAvatar === char.avatar;

                return (
                  <button
                    type="button"
                    key={char.id}
                    onClick={() => {
                      sound.playClick();
                      setSelectedAvatar(char.avatar);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                        : 'bg-slate-800/80 border-slate-700 hover:bg-slate-750 opacity-80'
                    }`}
                  >
                    <img
                      src={char.avatar}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-full border-2 border-amber-400 object-cover bg-slate-900 shadow"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white">{char.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{char.desc}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                اسم المستكشف (كما تحب أن يناديك عم رشيد):
              </label>
              <input
                type="text"
                required
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اكتب اسمك هنا"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3.5 text-sm text-white focus:outline-none focus:border-amber-400 text-right font-bold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>متابعة القصة وبدء التحدي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Cinematic Story Brief */
          <div className="space-y-5 text-right animate-fadeIn">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <img
                src="/src/assets/images/npc_guide_rashid_1790663140301.jpg"
                alt="عم رشيد"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full border-2 border-amber-500 object-cover bg-slate-800 shadow"
              />
              <div>
                <span className="text-[11px] font-bold text-amber-400 block">المرشد التاريخي</span>
                <h4 className="font-black text-base text-white">عم رشيد المؤرخ</h4>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
              <p>
                "أهلاً بك يا <span className="text-amber-400 font-bold">{name}</span> في عالمنا الغامض!
              </p>
              <p>
                'خريطة المعرفة الكبرى' اللي بتحفظ تاريخ مصر وجغرافيا كوكب الأرض تفرقت أجزاؤها إلى 5 مناطق مليانة بالألغاز والتحديات وحراس الـ Boss!
              </p>
              <p className="text-emerald-300 font-bold">
                مهمتنا نبدأ من أرخبيل التضاريس، وننتقل لمعارك المماليك والعثمانيين، ونهزم شبح الحملة الفرنسية، ونبني مصر مع محمد علي، وصولاً لثورة 1919م العظيمة!"
              </p>
            </div>

            <button
              onClick={handleStartGame}
              className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>جاهز يا عم رشيد! انطلق في أول مهمة!</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
