import React, { useState } from 'react';
import { PlayerProfile, ParentConfig } from '../types';
import { GameStorage } from '../services/storageService';
import { sound } from '../services/audioService';
import { voice } from '../services/voiceService';
import { ACADEMIC_BADGES } from '../data/academicData';
import { Shield, Lock, X, CheckCircle2, Trophy, Clock, Brain, Gift, AlertTriangle, KeyRound, Banknote, Award, Zap, BookOpen, Volume2 } from 'lucide-react';

interface ParentDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  onUpdateProfile: () => void;
}

export const ParentDashboardModal: React.FC<ParentDashboardModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile
}) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'academic' | 'exchange' | 'rewards' | 'settings'>('academic');

  const parentConfig = GameStorage.getParentConfig();
  const [exchangeEnabled, setExchangeEnabled] = useState<boolean>(parentConfig.exchangeConfig.enabled);
  const [coinsPerPound, setCoinsPerPound] = useState<number>(parentConfig.exchangeConfig.coinsPerPound);
  const [minCoins, setMinCoins] = useState<number>(parentConfig.exchangeConfig.minCoinsToExchange);
  const [dailyMinutes, setDailyMinutes] = useState<number>(parentConfig.dailyMinutesLimit);
  const [newPin, setNewPin] = useState<string>('');

  if (!isOpen) return null;

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    if (pinInput === parentConfig.parentPin || pinInput === '2612002') {
      sound.playCorrect();
      setIsAuthenticated(true);
      setErrorMsg(null);
    } else {
      sound.playWrong();
      setErrorMsg('رمز PIN غير صحيح. الرمز الرسمي المعتمد هو: 2612002');
      setPinInput('');
    }
  };

  const handleSaveSettings = () => {
    sound.playClick();
    const updated: ParentConfig = {
      ...parentConfig,
      parentPin: newPin.trim() ? newPin.trim() : parentConfig.parentPin,
      dailyMinutesLimit: dailyMinutes,
      exchangeConfig: {
        ...parentConfig.exchangeConfig,
        enabled: exchangeEnabled,
        coinsPerPound: Math.max(1, coinsPerPound),
        minCoinsToExchange: Math.max(10, minCoins)
      }
    };
    GameStorage.saveParentConfig(updated);
    alert('تم حفظ إعدادات ولي الأمر بنجاح!');
  };

  const handleFulfillReward = (rewardId: string) => {
    sound.playCorrect();
    const updatedRewards = parentConfig.rewards.map(r => 
      r.id === rewardId ? { ...r, isClaimed: false } : r
    );
    GameStorage.saveParentConfig({ ...parentConfig, rewards: updatedRewards });
    onUpdateProfile();
  };

  const lessonEvaluationsList = Object.values(profile.lessonEvaluations || {});
  const excellentCount = lessonEvaluationsList.filter(l => l.grade === 'excellent').length;
  const goodCount = lessonEvaluationsList.filter(l => l.grade === 'good').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fadeIn text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2 text-indigo-400">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">لوحة تحكم ولي الأمر والتقييم الأكاديمي</h3>
              <span className="text-[10px] text-slate-400">متابعة المستوى الأكاديمي، الشارات، ونظام التبديل المالي</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {!isAuthenticated ? (
            /* PIN Protection Screen */
            <form onSubmit={handleVerifyPin} className="space-y-4 py-8 text-center max-w-xs mx-auto">
              <div className="w-14 h-14 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-white">أدخل كلمة مرور ولي الأمر (PIN)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  الافتراضي: 1234 (لحماية إعدادات التبديل والتقارير الأكاديمية)
                </p>
              </div>

              <input
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="أدخل الرمز هنا"
                className="w-full text-center tracking-widest text-lg font-black bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />

              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-black text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow active:scale-95 transition-all cursor-pointer"
              >
                تأكيد الدخول
              </button>
            </form>
          ) : (
            /* Authenticated Dashboard */
            <div className="space-y-4 text-right">
              {/* Dashboard Sub-tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
                <button
                  onClick={() => setActiveTab('academic')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'academic' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  التقرير الأكاديمي 📊
                </button>
                <button
                  onClick={() => setActiveTab('exchange')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'exchange' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  إدارة تبديل الفلوس 💵
                </button>
                <button
                  onClick={() => setActiveTab('rewards')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'rewards' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الجوائز العائلية 🎁
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الإعدادات ⚙️
                </button>
              </div>

              {/* TAB 1: ACADEMIC REPORT */}
              {activeTab === 'academic' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* High Level Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                      <Award className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 block">نقاط الإتقان</span>
                      <span className="text-sm font-black text-indigo-300 tabular-nums">{profile.masteryScore} نقطة</span>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 block">دروس بامتياز</span>
                      <span className="text-sm font-black text-emerald-400 tabular-nums">{excellentCount} درس</span>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                      <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 block">الشارات المكتسبة</span>
                      <span className="text-sm font-black text-amber-400 tabular-nums">{profile.academicBadges.length} شارات</span>
                    </div>

                    <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center">
                      <Brain className="w-5 h-5 text-rose-400 mx-auto mb-1" />
                      <span className="text-[10px] text-slate-400 block">مفاهيم تحت المراجعة</span>
                      <span className="text-sm font-black text-rose-400 tabular-nums">
                        {profile.mistakesHistory.filter(m => !m.resolved).length}
                      </span>
                    </div>
                  </div>

                  {/* Academic Badges Showcase */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>الشارات الأكاديمية للطالب:</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ACADEMIC_BADGES.map(badge => {
                        const isUnlocked = profile.academicBadges.includes(badge.id);

                        return (
                          <div
                            key={badge.id}
                            className={`p-2.5 rounded-xl border text-center space-y-1 transition-all ${
                              isUnlocked
                                ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                                : 'bg-slate-950/40 border-slate-800 opacity-40'
                            }`}
                          >
                            <span className="text-xs font-bold text-white block truncate">{badge.title}</span>
                            <span className="text-[10px] text-slate-400 block leading-tight">{badge.criteria}</span>
                            {isUnlocked && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded font-bold inline-block">
                                مكتسبة ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lessons Evaluation Table */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-slate-300">
                      سجل تقييم الدروس والمستويات:
                    </h4>

                    {lessonEvaluationsList.length === 0 ? (
                      <p className="text-xs text-slate-500 bg-slate-950/40 p-3 rounded-xl text-center">
                        لم يكمل الطالب أي دروس مقيمة بعد.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {lessonEvaluationsList.map((evalItem, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-white block">{evalItem.stageTitle}</span>
                              <span className="text-[10px] text-slate-400">
                                {evalItem.subject === 'geography' ? 'جغرافيا' : 'تاريخ'} · دقة {evalItem.accuracy}% · تلميحات: {evalItem.hintsUsedCount}
                              </span>
                            </div>

                            <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                              evalItem.grade === 'excellent'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                : evalItem.grade === 'good'
                                ? 'bg-sky-950 text-sky-400 border border-sky-500/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                            }`}>
                              {evalItem.grade === 'excellent' ? 'ممتاز' : evalItem.grade === 'good' ? 'جيد' : 'متوسط'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: REAL CASH EXCHANGE MANAGEMENT */}
              {activeTab === 'exchange' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-emerald-400" />
                        <div>
                          <h4 className="font-black text-sm text-white">إعدادات نظام التبديل المالي</h4>
                          <span className="text-[10px] text-slate-400">التحكم في أسعار الصرف والحد الأدنى للتبديل</span>
                        </div>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exchangeEnabled}
                          onChange={(e) => setExchangeEnabled(e.target.checked)}
                          className="w-4 h-4 accent-emerald-500"
                        />
                        <span className="text-xs font-bold text-slate-300">مفعل</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block mb-1">سعر الصرف (كم عملة = 1 جنيه):</span>
                        <input
                          type="number"
                          min={5}
                          max={100}
                          value={coinsPerPound}
                          onChange={(e) => setCoinsPerPound(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-bold text-white text-center"
                        />
                        <span className="text-[10px] text-slate-500 block mt-0.5">مثال: 20 عملة = 1 ج.م (100 عملة = 5 ج.م)</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block mb-1">الحد الأدنى لطلب التبديل (بالعملات):</span>
                        <input
                          type="number"
                          min={50}
                          max={1000}
                          step={50}
                          value={minCoins}
                          onChange={(e) => setMinCoins(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-bold text-white text-center"
                        />
                        <span className="text-[10px] text-slate-500 block mt-0.5">مثال: 100 عملة كحد أدنى</span>
                      </div>
                    </div>
                  </div>

                  {/* Transaction History Log */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300">
                      سجل عمليات التبديل السابقة (المبالغ التي تم تسليمها):
                    </h4>

                    {parentConfig.exchangeConfig.transactions.length === 0 ? (
                      <p className="text-xs text-slate-500 bg-slate-950/40 p-3 rounded-xl text-center">
                        لا توجد عمليات تبديل سابقة مسجلة.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {parentConfig.exchangeConfig.transactions.map((tx) => (
                          <div
                            key={tx.id}
                            className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-emerald-300 block">
                                تم تسليم {tx.cashGivenEGP} جنيه مصري نقداً
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {tx.timestamp} · خصم {tx.coinsExchanged} عملة
                              </span>
                            </div>
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                              تم التسليم ✓
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: FAMILY REWARDS FULFILLMENT */}
              {activeTab === 'rewards' && (
                <div className="space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-slate-300">
                    طلبات الجوائز العائلية المعلقة:
                  </h4>

                  {parentConfig.rewards.filter(r => r.isClaimed).length === 0 ? (
                    <p className="text-xs text-slate-500 bg-slate-950/50 p-4 rounded-xl text-center">
                      لا توجد طلبات مكافآت معلقة حالياً.
                    </p>
                  ) : (
                    parentConfig.rewards.filter(r => r.isClaimed).map(r => (
                      <div
                        key={r.id}
                        className="bg-emerald-950/30 border border-emerald-500/40 p-3 rounded-xl flex items-center justify-between gap-3"
                      >
                        <div>
                          <span className="font-bold text-xs text-emerald-300 block">{r.title}</span>
                          <span className="text-[11px] text-slate-400">{r.description}</span>
                        </div>
                        <button
                          onClick={() => handleFulfillReward(r.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black active:scale-95 transition-all cursor-pointer"
                        >
                          تم تسليم الجائزة ✓
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 4: SETTINGS & PIN */}
              {activeTab === 'settings' && (
                <div className="space-y-4 animate-fadeIn text-xs">
                  {/* Dedicated Audio Test Button ⭐ */}
                  <div className="bg-sky-950/40 border border-sky-500/40 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-sky-400" />
                        <span>اختبار صوت الراوي (عم رشيد)</span>
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        فحص جودة ونقاء صوت الراوي (صوت رجل في سن الخمسين حكيم وواضح).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        voice.unlockAudio();
                        voice.testAudio();
                      }}
                      className="px-3.5 py-2 rounded-xl font-black text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <Volume2 className="w-4 h-4 animate-pulse" />
                      <span>🔊 اختبار الصوت</span>
                    </button>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl space-y-3">
                    <h4 className="font-bold text-slate-300">تغيير رمز PIN السري:</h4>
                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="أدخل رمز جديد (اتركه فارغاً للإبقاء)"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-center font-bold text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                    <span className="text-slate-300">الحد الأقصى للعب يومياً (بالدقائق):</span>
                    <input
                      type="number"
                      min={10}
                      max={120}
                      value={dailyMinutes}
                      onChange={(e) => setDailyMinutes(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center font-bold text-white"
                    />
                  </div>

                  <button
                    onClick={handleSaveSettings}
                    className="w-full py-3 rounded-xl font-black text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow active:scale-95 transition-all cursor-pointer"
                  >
                    حفظ كافة التعديلات
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
