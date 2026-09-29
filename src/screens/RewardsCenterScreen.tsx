import React, { useState } from 'react';
import { PlayerProfile, ParentReward, ParentConfig } from '../types';
import { GameStorage } from '../services/storageService';
import { sound } from '../services/audioService';
import { voice } from '../services/voiceService';
import { SHOP_ITEMS } from '../data/curriculumData';
import { Gift, Coins, Banknote, Trophy, Sparkles, CheckCircle2, User, Gamepad2, Utensils, Award, ArrowLeft, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RewardsCenterScreenProps {
  profile: PlayerProfile;
  parentRewards: ParentReward[];
  parentConfig: ParentConfig;
  onRefreshProfile: () => void;
  onOpenExchangeModal: () => void;
}

export const RewardsCenterScreen: React.FC<RewardsCenterScreenProps> = ({
  profile,
  parentRewards,
  parentConfig,
  onRefreshProfile,
  onOpenExchangeModal
}) => {
  const [activeTab, setActiveTab] = useState<'exchange' | 'parent' | 'shop'>('exchange');
  const [claimSuccessMsg, setClaimSuccessMsg] = useState<string | null>(null);

  const { coinsPerPound, minCoinsToExchange, enabled } = parentConfig.exchangeConfig;
  const cashEquivalent = Math.floor(profile.exchangeCoins / coinsPerPound);

  const handleClaimParentReward = (reward: ParentReward) => {
    if (profile.rewardPoints < reward.pointsCost) {
      sound.playWrong();
      return;
    }

    sound.playLevelUp();
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    voice.speak(`تم إرسال طلب استبدال ${reward.title} إلى ولي أمرك!`);

    GameStorage.addRewardPoints(-reward.pointsCost);

    const config = GameStorage.getParentConfig();
    const updatedRewards = config.rewards.map(r => 
      r.id === reward.id ? { ...r, isClaimed: true, claimedAt: new Date().toLocaleDateString('ar-EG') } : r
    );
    GameStorage.saveParentConfig({ ...config, rewards: updatedRewards });

    setClaimSuccessMsg(`رائع! تم تسجيل طلب مكافأة "${reward.title}" في لوحة ولي الأمر!`);
    onRefreshProfile();

    setTimeout(() => {
      setClaimSuccessMsg(null);
    }, 5000);
  };

  const handleBuyOrEquipItem = (itemId: string) => {
    sound.playClick();
    const result = GameStorage.buyShopItem(itemId);
    if (result.success) {
      sound.playCoin();
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.7 } });
      voice.speak(result.message);
      onRefreshProfile();
    } else {
      sound.playWrong();
      alert(result.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 space-y-5 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Gift className="w-6 h-6 text-emerald-400" />
          <span>مركز المكافآت وتبديل العملات</span>
        </h2>
        <p className="text-xs text-slate-300">
          بدّل عملاتك بنقود حقيقية مع ولي أمرك، أو اطلب جوائز عائلية، أو طوّر شخصيتك!
        </p>
      </div>

      {/* Segmented Control with 3 Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        {/* TAB 1: Real Cash Exchange */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('exchange');
          }}
          className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'exchange'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>تبديل بفلوس حقيقية 💵</span>
        </button>

        {/* TAB 2: Parent Wishlist */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('parent');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'parent'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>مكافآت الأسرة 🎁</span>
        </button>

        {/* TAB 3: In-Game Skins Shop */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('shop');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'shop'
              ? 'bg-amber-500 text-slate-950 shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>متجر اللعبة 🛒</span>
        </button>
      </div>

      {claimSuccessMsg && (
        <div className="bg-emerald-950/70 border border-emerald-500/70 p-3 rounded-2xl text-center text-xs font-black text-emerald-200 animate-fadeIn">
          {claimSuccessMsg}
        </div>
      )}

      {/* TAB 1: REAL CASH EXCHANGE HERO */}
      {activeTab === 'exchange' && (
        <div className="space-y-4 text-right animate-fadeIn">
          {/* Main Hero Card for Real Cash Exchange */}
          <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/80 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  نظام التبديل المالي المعتمد
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  تبديل عملات التبديل بفلوس حقيقية
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  كل ما تجاوب صح وتتقدم في الدراسات الاجتماعية، بتكسب عملات تبديل تقدر تحولها لجنيهات كاش من ولي أمرك!
                </p>
              </div>

              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                <Banknote className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            {/* Exchange Stats Box */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950/80 border border-emerald-500/30 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 block font-medium">رصيدك الحالي</span>
                <span className="text-xl font-black text-emerald-400 tabular-nums">{profile.exchangeCoins} عملة تبديل</span>
              </div>

              <div className="bg-slate-950/80 border border-emerald-500/30 p-3 rounded-2xl">
                <span className="text-[11px] text-slate-400 block font-medium">القيمة النقدية المقابلة</span>
                <span className="text-xl font-black text-amber-300 tabular-nums">~ {cashEquivalent} جنيه مصري</span>
              </div>
            </div>

            {/* Exchange Button */}
            <button
              onClick={() => {
                sound.playClick();
                onOpenExchangeModal();
              }}
              className="w-full py-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 shadow-xl shadow-emerald-500/30 active:scale-98 transition-all flex items-center justify-between px-5 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5" />
                <span>ابدأ تبديل العملات بفلوس حقيقية الآن</span>
              </div>
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Security note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>التبديل مقفول برمز PIN سري خاص بولي الأمر لضمان التسليم المالي</span>
            </div>
          </div>

          {/* How it works simple guide */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
            <h4 className="font-bold text-slate-200">كيف يعمل نظام التبديل؟</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-400">
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                <span className="font-bold text-amber-400 block mb-0.5">1. جاوب صح وتقدّم</span>
                <span>كل درس تحله يمنحك عملات تبديل مباشرة.</span>
              </div>
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                <span className="font-bold text-amber-400 block mb-0.5">2. سلّم الهاتف لولي أمرك</span>
                <span>يدخل ولي الأمر الرمز السري لتأكيد التسليم.</span>
              </div>
              <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                <span className="font-bold text-amber-400 block mb-0.5">3. استلم نقودك كاش</span>
                <span>تتخصم العملات وتستلم الفلوس الحقيقية في يدك!</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PARENT WISHLIST */}
      {activeTab === 'parent' && (
        <div className="space-y-4 animate-fadeIn text-right">
          <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-300 font-medium block">رصيد نقاط مكافآت ولي الأمر</span>
              <span className="text-2xl font-black text-indigo-400 tabular-nums">{profile.rewardPoints} نقطة</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Gift className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400">المكافآت العائلية المتاحة:</h3>

            {parentRewards.map((reward) => {
              const canAfford = profile.rewardPoints >= reward.pointsCost;

              return (
                <div
                  key={reward.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-md"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">
                      {reward.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {reward.description}
                    </p>
                    <span className="text-[11px] font-black text-indigo-400 inline-block mt-0.5">
                      التكلفة: {reward.pointsCost} نقطة
                    </span>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => handleClaimParentReward(reward)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-black shrink-0 transition-all ${
                      canAfford
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {canAfford ? 'استبدال الآن' : `ينقصك ${reward.pointsCost - profile.rewardPoints}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: IN-GAME SKINS & TITLES */}
      {activeTab === 'shop' && (
        <div className="space-y-4 animate-fadeIn text-right">
          <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/40 rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs text-slate-300 font-medium block">رصيد عملات اللعبة (Game Coins)</span>
              <span className="text-2xl font-black text-amber-400 tabular-nums">{profile.coins} عملة</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Coins className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400">الشخصيات والألقاب داخل اللعبة:</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHOP_ITEMS.map((item) => {
                const isOwned = profile.inventoryItems.includes(item.id);
                const isActive = item.category === 'avatar' 
                  ? profile.selectedAvatar === item.value
                  : profile.activeTitle === item.value;
                const canAfford = profile.coins >= item.cost;

                return (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      {item.category === 'avatar' && (
                        <img
                          src={item.value}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-full border-2 border-amber-500 object-cover bg-slate-800 mb-2 shadow"
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-white">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                          {item.cost === 0 ? 'مجاني' : `${item.cost} عملة`}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 leading-snug">
                        {item.description}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyOrEquipItem(item.id)}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-all ${
                        isActive
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : isOwned
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow active:scale-95 cursor-pointer'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow active:scale-95 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isActive ? 'مُفعّل حالياً ✓' : isOwned ? 'تفعيل' : canAfford ? 'شراء وتفعيل' : `ينقصك ${item.cost - profile.coins} عملة`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
