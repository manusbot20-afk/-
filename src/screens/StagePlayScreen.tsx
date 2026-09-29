import React, { useState, useEffect } from 'react';
import { LessonStage, AcademicGrade } from '../types';
import { sound } from '../services/audioService';
import { voice } from '../services/voiceService';
import { GameStorage } from '../services/storageService';
import { InteractiveMapMiniGame } from '../components/minigames/InteractiveMapMiniGame';
import { TapDiscoverMiniGame } from '../components/minigames/TapDiscoverMiniGame';
import { WaterHarvestActionMiniGame } from '../components/minigames/WaterHarvestActionMiniGame';
import { TimelineMiniGame } from '../components/minigames/TimelineMiniGame';
import { MatchingPairsMiniGame } from '../components/minigames/MatchingPairsMiniGame';
import { MemoryCardsMiniGame } from '../components/minigames/MemoryCardsMiniGame';
import { CluePuzzleMiniGame } from '../components/minigames/CluePuzzleMiniGame';
import { BossDuelMiniGame } from '../components/minigames/BossDuelMiniGame';
import { VoiceQuestionChallengeView } from '../components/VoiceQuestionChallengeView';
import { Volume2, VolumeX, BookOpen, Star, Trophy, Coins, Banknote, Award, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Headphones } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StagePlayScreenProps {
  stage: LessonStage;
  playerCoins: number;
  onFinishStage: () => void;
  onExit: () => void;
}

type StagePhase = 'audio_story' | 'audio_lesson' | 'mini_game' | 'quiz' | 'boss_duel' | 'summary';

export const StagePlayScreen: React.FC<StagePlayScreenProps> = ({
  stage,
  playerCoins,
  onFinishStage,
  onExit
}) => {
  const [phase, setPhase] = useState<StagePhase>('audio_story');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [hintsUsedCount, setHintsUsedCount] = useState<number>(0);
  const [totalMasteryEarned, setTotalMasteryEarned] = useState<number>(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [academicGrade, setAcademicGrade] = useState<AcademicGrade>('good');
  const [isSpeakingNarration, setIsSpeakingNarration] = useState<boolean>(false);

  // Subscribe to voice status
  useEffect(() => {
    const unsubscribe = voice.subscribe((speaking) => {
      setIsSpeakingNarration(speaking);
    });
    return () => unsubscribe();
  }, []);

  // Trigger audio story on entry
  useEffect(() => {
    if (phase === 'audio_story') {
      const storyText = stage.audioStory || stage.npcDialogue.lines.join(' ');
      voice.speakLesson(stage.title, storyText, stage.id);
    } else if (phase === 'audio_lesson') {
      const lessonText = stage.audioLessonSummary || stage.knowledgeCard.summaryPoints.join('. ');
      voice.speak(`ملخص كبسولة الدرس: ${lessonText}`);
    }

    return () => {
      voice.stop();
    };
  }, [phase, stage.id]);

  const handleNextPhase = (next: StagePhase) => {
    sound.playClick();
    voice.stop();
    setPhase(next);
  };

  const handleStartMiniGame = () => {
    sound.playClick();
    voice.stop();
    if (stage.isBossStage) {
      setPhase('boss_duel');
    } else {
      setPhase('mini_game');
    }
  };

  const handleMiniGameComplete = () => {
    sound.playCorrect();
    voice.stop();
    setPhase('quiz');
  };

  const handleQuestionAnswer = (isCorrect: boolean, masteryEarned: number, usedHint: boolean) => {
    if (isCorrect) {
      setCorrectAnswersCount(prev => prev + 1);
    }
    if (usedHint) {
      setHintsUsedCount(prev => prev + 1);
    }
    setTotalMasteryEarned(prev => prev + masteryEarned);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < stage.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleCompleteStage();
    }
  };

  const handleCompleteStage = () => {
    sound.playLevelUp();
    confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });

    const totalQ = stage.questions.length;
    const accuracy = totalQ > 0 ? Math.round((correctAnswersCount / totalQ) * 100) : 100;
    const stars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : 1;

    // Record academic evaluation
    const { evaluation, newBadges } = GameStorage.recordLessonEvaluation(
      stage.id,
      stage.title,
      stage.subject,
      accuracy,
      hintsUsedCount,
      1,
      totalMasteryEarned
    );

    setAcademicGrade(evaluation.grade);
    setEarnedBadges(newBadges);

    // Save completion & awards with bonus coins (+15 for lesson, +50 for boss zone)
    const stageBonus = stage.isBossStage ? 50 : 15;
    GameStorage.completeStage(
      stage.id,
      stage.zoneId,
      stars,
      stage.xpReward,
      stage.coinsReward + stageBonus,
      (stage.exchangeCoinsReward || 25) + stageBonus,
      stage.rewardPoints
    );

    voice.speak(`ألف مبروك يا بطل! أنهيت المهمة بنجاح، وتقديرك الأكاديمي: ${
      evaluation.grade === 'excellent' ? 'ممتاز' : evaluation.grade === 'good' ? 'جيد جداً' : 'متوسط'
    }! وكسبت ${stageBonus} عملة بونص إضافية مع نقاط التبديل والخبرة!`);

    setPhase('summary');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 pb-28 space-y-4">
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sound.playClick();
            voice.stop();
            onExit();
          }}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl active:scale-95 transition-all cursor-pointer"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>خروج للخريطة</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-400 bg-amber-950/70 px-2.5 py-0.5 rounded-lg border border-amber-500/40">
            {stage.subject === 'geography' ? 'جغرافيا' : 'تاريخ'} · درس {stage.lessonNumber}
          </span>

          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-500/40 flex items-center gap-1">
            <Headphones className="w-3 h-3" />
            درس مسموع
          </span>
        </div>
      </div>

      {/* PHASE 1: AUDIO STORY */}
      {phase === 'audio_story' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl animate-fadeIn text-right">
          {/* Narrator Identity */}
          <div className="flex items-center gap-3.5 border-b border-slate-800 pb-3">
            <div className="relative">
              <img
                src={stage.npcDialogue.avatar}
                alt={stage.npcDialogue.characterName}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full border-2 border-amber-500 object-cover bg-slate-800 shadow"
              />
              {isSpeakingNarration && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-slate-900 animate-ping" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-base text-amber-300">
                  {stage.npcDialogue.characterName}
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                  الراوي الصوتي
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {stage.title}
              </p>
            </div>
          </div>

          {/* Audio Story Wave / Visual Card */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl relative space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Volume2 className="w-4 h-4 animate-pulse" />
                استمع للقصة المشوقة:
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  voice.speakLesson(stage.title, stage.audioStory || stage.npcDialogue.lines.join(' '), stage.id);
                }}
                className="text-[11px] text-sky-400 hover:text-sky-300 bg-sky-950/40 border border-sky-500/30 px-2.5 py-1 rounded-lg cursor-pointer"
              >
                إعادة الاستماع ↻
              </button>
            </div>

            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
              "{stage.audioStory || stage.npcDialogue.lines.join(' ')}"
            </p>

            {/* Speaking equalizer waves visual */}
            {isSpeakingNarration && (
              <div className="flex items-center justify-center gap-1 pt-2">
                {[12, 24, 16, 28, 20, 14, 26, 18].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}px` }}
                    className="w-1 bg-amber-400 rounded-full animate-pulse"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => handleNextPhase('audio_lesson')}
            className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:opacity-95 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>استمعت للقصة! اعرض الشرح الصوتي السريع</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PHASE 2: SPOKEN LESSON SUMMARY (LOW TEXT) */}
      {phase === 'audio_lesson' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-fadeIn text-right">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-black text-base text-emerald-300">
                كبسولة الدرس المسموعة (بدون قراءة طويلة)
              </h3>
            </div>
            <button
              onClick={() => voice.speak(`ملخص كبسولة الدرس: ${stage.audioLessonSummary || stage.knowledgeCard.summaryPoints.join('. ')}`)}
              className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              استمع ثانية
            </button>
          </div>

          {/* Quick Headlines Only */}
          <div className="space-y-2">
            {stage.knowledgeCard.summaryPoints.slice(0, 3).map((point, idx) => (
              <div
                key={idx}
                onClick={() => voice.speak(point)}
                className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 p-3 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-slate-200 cursor-pointer active:scale-98 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <span className="flex-1 font-medium leading-relaxed">{point}</span>
                <Volume2 className="w-4 h-4 text-emerald-400/60 shrink-0" />
              </div>
            ))}
          </div>

          {/* Term Spotlight */}
          {stage.knowledgeCard.keyTerm && (
            <div
              onClick={() => voice.speak(`${stage.knowledgeCard.keyTerm?.term}: ${stage.knowledgeCard.keyTerm?.definition}`)}
              className="bg-indigo-950/40 border border-indigo-500/40 p-3.5 rounded-2xl space-y-1 cursor-pointer"
            >
              <span className="text-[11px] font-black text-indigo-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                المصطلح الأساسي: {stage.knowledgeCard.keyTerm.term}
              </span>
              <p className="text-xs text-slate-300 leading-snug">
                {stage.knowledgeCard.keyTerm.definition}
              </p>
            </div>
          )}

          <button
            onClick={handleStartMiniGame}
            className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{stage.isBossStage ? 'بدء مواجهة الـ BOSS الأكبر!' : 'بدء التحدي الحركي البصري (Mini Game)'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PHASE 3: INTERACTIVE MINI-GAME */}
      {phase === 'mini_game' && (
        <div className="animate-fadeIn">
          {stage.miniGame.type === 'map_explore' && stage.miniGame.mapPins && (
            <InteractiveMapMiniGame
              pins={stage.miniGame.mapPins}
              instructions={stage.miniGame.instructions}
              onComplete={handleMiniGameComplete}
            />
          )}

          {stage.miniGame.type === 'timeline_order' && stage.miniGame.timelineItems && (
            <TimelineMiniGame
              items={stage.miniGame.timelineItems}
              instructions={stage.miniGame.instructions}
              onComplete={handleMiniGameComplete}
            />
          )}

          {stage.miniGame.type === 'matching_pairs' && stage.miniGame.matchingPairs && (
            <MatchingPairsMiniGame
              pairs={stage.miniGame.matchingPairs}
              instructions={stage.miniGame.instructions}
              onComplete={handleMiniGameComplete}
            />
          )}

          {stage.miniGame.type === 'memory_cards' && stage.miniGame.memoryCards && (
            <MemoryCardsMiniGame
              cards={stage.miniGame.memoryCards}
              instructions={stage.miniGame.instructions}
              onComplete={handleMiniGameComplete}
            />
          )}

          {stage.miniGame.type === 'clue_puzzle' && stage.miniGame.puzzleClues && (
            <CluePuzzleMiniGame
              clues={stage.miniGame.puzzleClues}
              answer={stage.miniGame.puzzleAnswer || ''}
              options={stage.miniGame.puzzleOptions || []}
              instructions={stage.miniGame.instructions}
              onComplete={handleMiniGameComplete}
            />
          )}

          {stage.miniGame.type === 'tap_discover' && (
            <TapDiscoverMiniGame
              instructions={stage.miniGame.instructions}
              onComplete={handleMiniGameComplete}
            />
          )}

          {stage.miniGame.type === 'water_harvest' && (
            <WaterHarvestActionMiniGame
              instructions={stage.miniGame.instructions}
              onComplete={handleMiniGameComplete}
            />
          )}
        </div>
      )}

      {/* PHASE 4: QUIZ QUESTIONS (AUDIO & TOUCH) */}
      {phase === 'quiz' && stage.questions.length > 0 && (
        <div className="animate-fadeIn">
          <VoiceQuestionChallengeView
            key={stage.questions[currentQuestionIndex].id}
            question={stage.questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={stage.questions.length}
            playerCoins={playerCoins}
            onAnswer={handleQuestionAnswer}
            onNext={handleNextQuestion}
          />
        </div>
      )}

      {/* PHASE BOSS DUEL */}
      {phase === 'boss_duel' && (
        <div className="animate-fadeIn">
          <BossDuelMiniGame
            bossName={stage.title}
            questions={stage.questions}
            onDefeatBoss={handleCompleteStage}
          />
        </div>
      )}

      {/* PHASE 5: SUMMARY & ACADEMIC EVALUATION */}
      {phase === 'summary' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-5 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/25">
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
              مهمة ناجحة ومكتملة!
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {stage.title}
            </h3>

            {/* Academic Grade Badge */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-950 text-indigo-300 border border-indigo-500/40">
              <Award className="w-3.5 h-3.5" />
              <span>التقييم الأكاديمي: {academicGrade === 'excellent' ? 'ممتاز (90%+)' : academicGrade === 'good' ? 'جيد جداً' : 'متوسط'}</span>
            </div>
          </div>

          {/* Rewards Grid: XP, Game Coins, Exchange Coins, Mastery */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center">
              <span className="text-[10px] text-slate-400">الخبرة</span>
              <span className="text-xs font-black text-amber-400">+{stage.xpReward} XP</span>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-2xl flex flex-col items-center">
              <Coins className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
              <span className="text-xs font-black text-amber-300">+{stage.coinsReward} عملة</span>
            </div>

            {/* 💵 Exchange Coins Reward */}
            <div className="bg-emerald-950/50 border border-emerald-500/40 p-2.5 rounded-2xl flex flex-col items-center">
              <Banknote className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
              <span className="text-xs font-black text-emerald-300">+{stage.exchangeCoinsReward || 50} تبديل</span>
            </div>

            <div className="bg-indigo-950/50 border border-indigo-500/40 p-2.5 rounded-2xl flex flex-col items-center">
              <Award className="w-3.5 h-3.5 text-indigo-400 mb-0.5" />
              <span className="text-xs font-black text-indigo-300">+{totalMasteryEarned} إتقان</span>
            </div>
          </div>

          {/* New Badges if unlocked */}
          {earnedBadges.length > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-2xl text-xs text-amber-300 font-bold flex items-center justify-center gap-1.5 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>مبروك! حصلت على شارة أكاديمية جديدة!</span>
            </div>
          )}

          {/* Continue button */}
          <button
            onClick={() => {
              sound.playClick();
              voice.stop();
              onFinishStage();
            }}
            className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>متابعة الرحلة للخريطة</span>
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
