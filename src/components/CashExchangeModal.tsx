import React, { useState } from 'react';
import { PlayerProfile, ParentConfig } from '../types';
import { GameStorage } from '../services/storageService';
import { sound } from '../services/audioService';
import { voice } from '../services/voiceService';
import { Banknote, Lock, X, CheckCircle2, ShieldCheck, ArrowRight, Sparkles, RefreshCw, KeyRound, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CashExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PlayerProfile;
  parentConfig: ParentConfig;
  onExchangeSuccess: () => void;
}

export const CashExchangeModal: React.FC<CashExchangeModalProps> = ({
  isOpen,
  onClose,
  profile,
  parentConfig,
  onExchangeSuccess
}) => {
  // Steps follow user's exact specification:
  // 1. PIN entry first (locked by parent PIN)
  // 2. Display: "عندك 1000 عملة = 50 جنيه" + Confirm
  // 3. Coins reset to 0 + Parent gives real cash + Receipt
  const [step, setStep] = useState<'pin' | 'confirm' | 'receipt'>('pin');
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // By default, exchange all coins (zero-out) as requested
  const [exchangeAll, setExchangeAll] = useState<boolean>(true);
  const [customCoins, setCustomCoins] = useState<number>(profile.exchangeCoins);
  const [receiptData, setReceiptData] = useState<{ coins: number; cash: number } | null>(null);

  if (!isOpen) return null;

  const { coinsPerPound, minCoinsToExchange, enabled } = parentConfig.exchangeConfig;
  const coinsToExchange = exchangeAll ? profile.exchangeCoins : customCoins;
  const cashAmountEGP = Math.floor(coinsToExchange / coinsPerPound);
  const OFFICIAL_PIN = '2612002';

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    if (!enabled) {
      setErrorMsg('نظام التبديل المالي معطل حالياً من إعدادات ولي الأمر.');
      return;
    }

    if (pinInput.trim() === parentConfig.parentPin || pinInput.trim() === OFFICIAL_PIN) {
      sound.playCorrect();
      setErrorMsg(null);
      setCustomCoins(profile.exchangeCoins);
      setStep('confirm');
      voice.speak(`أهلاً بولي الأمر! رصيد الطالب الحالي ${profile.exchangeCoins} عملة تبديل، تعادل ${Math.floor(profile.exchangeCoins / coinsPerPound)} جنيه مصري نقداً.`);
    } else {
      sound.playWrong();
      setErrorMsg('كلمة السر غير صحيحة. الرقم السري الرسمي هو 2612002');
      setPinInput('');
    }
  };

  const handleExecuteExchange = () => {
    sound.playClick();

    if (coinsToExchange <= 0) {
      setErrorMsg('لا يوجد رصيد كافٍ من عملات التبديل حالياً.');
      return;
    }

    if (coinsToExchange < minCoinsToExchange) {
      setErrorMsg(`الحد الأدنى للتبديل هو ${minCoinsToExchange} عملة.`);
      return;
    }

    const result = GameStorage.exchangeCoinsForCash(
      coinsToExchange,
      cashAmountEGP,
      pinInput.trim() || OFFICIAL_PIN,
      exchangeAll ? `تصفير كامل للعملات واستلام ${cashAmountEGP} ج.م نقداً` : `تبديل ${coinsToExchange} عملة واستلام ${cashAmountEGP} ج.م نقداً`
    );

    if (result.success) {
      sound.playExchangeCoin();
      sound.playLevelUp();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      voice.speak(`مبروك يا بطل! تم تأكيد التبديل بنجاح، واستحققت ${cashAmountEGP} جنيهاً مصرياً نقداً في يدك من ولي أمرك!`);
      setReceiptData({ coins: coinsToExchange, cash: cashAmountEGP });
      setStep('receipt');
      onExchangeSuccess();
    } else {
      sound.playWrong();
      setErrorMsg(result.message);
    }
  };

  const handleClose = () => {
    setStep('pin');
    setPinInput('');
    setErrorMsg(null);
    setReceiptData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fadeIn text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Banknote className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">تبديل العملات بفلوس حقيقية 💵</h3>
              <span className="text-[10px] text-slate-400">نظام المكافآت المالية بإشراف ولي الأمر</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* STEP 1: PIN PROMPT */}
          {step === 'pin' && (
            <form onSubmit={handleVerifyPin} className="space-y-4 text-center max-w-sm mx-auto py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-lg shadow-emerald-500/10">
                <Lock className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h4 className="font-black text-base text-white">🔐 منطقة خاصة بولي الأمر</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  هذه الخاصية مقفولة بكلمة سر للتأكد من موافقة ولي الأمر وتسليم المبلغ النقدي للطالب يداً بيد.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <input
                  type="password"
                  maxLength={10}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="أدخل كلمة السر (PIN)"
                  className="w-full text-center tracking-widest text-xl font-black bg-slate-950 border border-slate-700 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  autoFocus
                />
                <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2 text-[11px] text-amber-300 flex items-center justify-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>الرقم السري الرسمي المعتمد: <strong className="text-amber-200 tracking-wider">2612002</strong></span>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-rose-950/60 border border-rose-500/50 p-2.5 rounded-xl text-xs text-rose-300 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>دخول وتأكيد التبديل المالي</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </form>
          )}

          {/* STEP 2: CONFIRMATION SCREEN: "عندك 1000 عملة = 50 جنيه" */}
          {step === 'confirm' && (
            <div className="space-y-4 text-right animate-fadeIn">
              <div className="bg-emerald-950/50 border border-emerald-500/40 p-4 rounded-2xl text-center space-y-2">
                <span className="text-xs text-emerald-300 font-bold block">
                  ✨ رصيد الطالب الجاهز للتبديل:
                </span>

                {/* The exact requested headline display */}
                <div className="text-2xl sm:text-3xl font-black text-white bg-slate-950/80 border border-emerald-500/30 py-3 px-4 rounded-2xl shadow-inner">
                  عندك <span className="text-emerald-400">{coinsToExchange}</span> عملة = <span className="text-amber-300">{cashAmountEGP}</span> جنيه
                </div>

                <p className="text-[11px] text-slate-300">
                  سعر الصرف المحدد من ولي الأمر: ({coinsPerPound} عملة = 1 جنيه مصري)
                </p>
              </div>

              {/* Exchange Type Selection */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block">طريقة التبديل:</span>
                
                {/* Option 1: Zero out all coins */}
                <button
                  type="button"
                  onClick={() => setExchangeAll(true)}
                  className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                    exchangeAll
                      ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-xs">
                      ✓
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm text-white block">
                        تصفير كل العملات واستلام المبلغ بالكامل ({Math.floor(profile.exchangeCoins / coinsPerPound)} ج.م)
                      </span>
                      <span className="text-[10px] text-slate-400">
                        العملات ترجع لصفر ({profile.exchangeCoins} عملة)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400">تصفير 0</span>
                </button>

                {/* Option 2: Choose specific amount if balance > 200 */}
                {profile.exchangeCoins > minCoinsToExchange && (
                  <button
                    type="button"
                    onClick={() => {
                      setExchangeAll(false);
                      setCustomCoins(Math.min(profile.exchangeCoins, 200));
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between cursor-pointer ${
                      !exchangeAll
                        ? 'bg-emerald-950/80 border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                        ⚙️
                      </div>
                      <div>
                        <span className="font-black text-xs sm:text-sm text-white block">
                          تحديد جزء من العملات للتبديل
                        </span>
                        <span className="text-[10px] text-slate-400">
                          تبديل كمية محددة والاحتفاظ بالباقي
                        </span>
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Slider for custom amount */}
              {!exchangeAll && (
                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>حدد عدد العملات:</span>
                    <span className="font-black text-emerald-400">{customCoins} عملة ({Math.floor(customCoins / coinsPerPound)} جنيه)</span>
                  </div>
                  <input
                    type="range"
                    min={minCoinsToExchange}
                    max={profile.exchangeCoins}
                    step={coinsPerPound}
                    value={customCoins}
                    onChange={(e) => setCustomCoins(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>الحد الأدنى: {minCoinsToExchange}</span>
                    <span>الحد الأقصى: {profile.exchangeCoins}</span>
                  </div>
                </div>
              )}

              {/* Confirmation Notice */}
              <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl text-xs space-y-1">
                <span className="font-bold text-amber-400 block">خطوة التسليم المالي:</span>
                <p className="text-slate-300 leading-relaxed">
                  بالضغط على "تأكيد"، ستعود العملات لصفر ({exchangeAll ? '0 عملة' : `${profile.exchangeCoins - customCoins} عملة متبقية`})، ويقوم ولي الأمر بإعطاء الطالب مبلغ <strong className="text-emerald-400 font-black">{cashAmountEGP} جنيه نقداً كاش</strong>.
                </p>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-400 font-medium text-center">{errorMsg}</p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('pin')}
                  className="px-4 py-3 rounded-2xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  تغيير الرمز
                </button>

                <button
                  type="button"
                  disabled={coinsToExchange < minCoinsToExchange || cashAmountEGP <= 0}
                  onClick={handleExecuteExchange}
                  className={`flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    coinsToExchange >= minCoinsToExchange && cashAmountEGP > 0
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/30 active:scale-95 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>تأكيد وتسليم {cashAmountEGP} جنيه للطالب الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & RECEIPT */}
          {step === 'receipt' && receiptData && (
            <div className="space-y-4 text-center py-2 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block mb-1">
                  عملية معتمدة ومسجلة
                </span>
                <h4 className="text-xl font-black text-white">تم التبديل وتصفير العملات بنجاح!</h4>
                
                <div className="bg-slate-950/80 border border-emerald-500/40 p-4 rounded-2xl my-3 text-center">
                  <span className="text-xs text-slate-400 block mb-1">المبلغ المطلوب تسليمه للطالب نقداً:</span>
                  <span className="text-3xl font-black text-emerald-400">{receiptData.cash} جنيه مصري</span>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    (تم خصم {receiptData.coins} عملة تبديل وأصبح رصيدها 0 عملة)
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  تم تسجيل هذه المعاملة بالوقت والتاريخ في لوحة تحكم ولي الأمر.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-2xl font-black text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl active:scale-95 transition-all cursor-pointer"
              >
                تم الاستلام ومتابعة المغامرة 🎮
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
