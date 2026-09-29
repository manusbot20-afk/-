import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { sound } from '../services/audioService';
import { voice } from '../services/voiceService';
import { GameStorage } from '../services/storageService';
import { Volume2, Mic, CheckCircle2, AlertCircle, Sparkles, HelpCircle, ArrowLeft, Lightbulb, RotateCcw } from 'lucide-react';

interface VoiceQuestionChallengeViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  playerCoins: number;
  onAnswer: (isCorrect: boolean, masteryEarned: number, usedHint: boolean) => void;
  onNext: () => void;
}

export const VoiceQuestionChallengeView: React.FC<VoiceQuestionChallengeViewProps> = ({
  question,
  questionNumber,
  totalQuestions,
  playerCoins,
  onAnswer,
  onNext
}) => {
  // STRICT QUESTION-LOCAL STATE: Completely independent for every single question!
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(1);
  const [usedHint, setUsedHint] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [earnedCoinsText, setEarnedCoinsText] = useState<string>('');

  // HINT COST: -3 coins according to the new economy
  const HINT_COST = 3;

  // Strict state reset upon any question change
  useEffect(() => {
    setSelectedOption(null);
    setAnswered(false);
    setIsCorrect(false);
    setAttemptCount(1);
    setUsedHint(false);
    setShowHint(false);
    setIsListening(false);
    setSpeechFeedback(null);
    setEarnedCoinsText('');
  }, [question.id]);

  // Narrator speaks the question automatically upon mounting
  useEffect(() => {
    const questionSpeech = `التحدي رقم ${questionNumber}. ${question.question}`;
    voice.speak(questionSpeech);

    return () => {
      voice.stop();
    };
  }, [question.id, questionNumber]);

  const handleReplayQuestion = () => {
    sound.playClick();
    const optionsText = question.options.slice(0, 3).join('، أو ');
    voice.speak(`${question.question}. الخيارات هي: ${optionsText}`);
  };

  const handleUseHint = () => {
    if (showHint) return;
    if (playerCoins < HINT_COST) {
      sound.playWrong();
      voice.speak('تحتاج لـ 3 عملات لطلب تلميح من عم رشيد!');
      return;
    }
    sound.playCoin();
    GameStorage.addCoins(-HINT_COST);
    GameStorage.addExchangeCoins(-HINT_COST);
    setUsedHint(true);
    setShowHint(true);
    voice.speak(`تلميح من عم رشيد: ${question.hint}`);
  };

  const calculateMasteryPoints = (correct: boolean): number => {
    if (!correct) return 0;
    let base = 10;
    if (attemptCount === 2) base = 7;
    else if (attemptCount >= 3) base = 5;
    if (usedHint) base = Math.max(2, base - 3);
    return base;
  };

  const handleSelectOption = (idx: number) => {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);

    const correct = idx === question.correctAnswer;
    setIsCorrect(correct);
    const masteryPoints = calculateMasteryPoints(correct);

    if (correct) {
      sound.playCorrect();
      sound.playCoin();
      sound.playExchangeCoin();

      // Bonus rule: +5 standard, +2 bonus if 1st try without hints = +7
      const isFirstTryNoHint = attemptCount === 1 && !usedHint;
      const coinDelta = isFirstTryNoHint ? 7 : 5;

      setEarnedCoinsText(isFirstTryNoHint ? '+7 عملات (إجابة من أول مرة!)' : '+5 عملات');

      // Update storage: both Game Coins and Exchange Coins
      GameStorage.addCoins(coinDelta);
      GameStorage.addExchangeCoins(coinDelta);
      GameStorage.addMasteryPoints(masteryPoints);

      // Voice feedback
      voice.speakAnswerFeedback(true, isFirstTryNoHint);
    } else {
      sound.playWrong();

      // Penalty rule: -10 coins (minimum 0)
      const currentCoins = GameStorage.getProfile().coins;
      const updatedProfile = GameStorage.addCoins(-10);
      GameStorage.addExchangeCoins(-10);

      setEarnedCoinsText('-10 عملات');
      GameStorage.recordMistake(question.id, question.question, question.sourceLesson);
      setAttemptCount(prev => prev + 1);

      // Voice feedback announcing -10 or 0 coins
      voice.speakAnswerFeedback(false, false, updatedProfile.coins);
    }

    onAnswer(correct, masteryPoints, usedHint);
  };

  const handleStartListening = () => {
    setIsListening(true);
    setSpeechFeedback('تحدث الآن باسم الإجابة...');

    voice.listen(
      (transcript) => {
        setIsListening(false);
        setSpeechFeedback(`سمعتك تقول: "${transcript}"`);

        // Match transcript with options
        const matchIdx = question.options.findIndex(opt =>
          transcript.includes(opt) || opt.includes(transcript)
        );

        if (matchIdx !== -1) {
          handleSelectOption(matchIdx);
        } else {
          setSpeechFeedback('لم أتعرف على الاختيار بدقة، اضغط بيدك على الإجابة.');
        }
      },
      () => {
        setIsListening(false);
        setSpeechFeedback('اضغط على الإجابة بيدك مباشرة.');
      }
    );
  };

  // Limit choices to max 3 as requested by the user
  const visibleOptions = question.options.slice(0, 3);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-slate-100 space-y-4 shadow-2xl relative animate-fadeIn">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-amber-400 bg-amber-950/70 border border-amber-500/40 px-3 py-1 rounded-full">
          تحدي {questionNumber} من {totalQuestions}
        </span>

        {/* Audio buttons: Listen Again & Test Voice */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReplayQuestion}
            className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-950/50 border border-sky-500/40 px-3 py-1 rounded-full transition-all active:scale-95 cursor-pointer"
            title="إعادة سماع السؤال بصوت عم رشيد"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة الشرح</span>
          </button>

          <button
            onClick={() => voice.speak(`السؤال: ${question.question}`)}
            className="p-1.5 text-amber-400 hover:text-amber-300 bg-amber-950/50 border border-amber-500/40 rounded-full transition-all active:scale-95 cursor-pointer"
            title="تشغيل الصوت"
          >
            <Volume2 className="w-4 h-4 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Main Question Display */}
      <div className="text-right space-y-1">
        <h3 className="text-base sm:text-lg font-black text-white leading-snug">
          {question.question}
        </h3>
        <span className="text-[11px] text-slate-400">
          المصدر: {question.sourceLesson}
        </span>
      </div>

      {/* Hint Banner if shown */}
      {showHint && (
        <div className="bg-amber-950/50 border border-amber-500/50 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-amber-200 animate-fadeIn">
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">تلميح عم رشيد الصوتي:</span>
            <span>{question.hint}</span>
          </div>
        </div>
      )}

      {/* Options List (Max 3, clean touch targets) */}
      <div className="space-y-2.5 pt-1">
        {visibleOptions.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isThisCorrect = idx === question.correctAnswer;

          let btnStyle = 'bg-slate-800/90 border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-slate-600 active:scale-98';
          if (answered) {
            if (isThisCorrect) {
              btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/40 shadow-lg';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-200 animate-shake';
            } else {
              btnStyle = 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-50';
            }
          }

          return (
            <button
              key={`${question.id}-opt-${idx}`}
              disabled={answered}
              onClick={() => handleSelectOption(idx)}
              className={`w-full p-4 rounded-2xl border text-right text-xs sm:text-sm font-bold transition-all min-h-[56px] flex items-center justify-between cursor-pointer ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-950/80 border border-slate-700 text-xs flex items-center justify-center font-black text-slate-300 shrink-0">
                  {idx + 1}
                </span>
                <span>{opt}</span>
              </div>

              {answered && isThisCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Voice Answer button & Hint Action */}
      {!answered && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartListening}
              className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-750 text-indigo-300 border-indigo-500/30'
              }`}
              title="تحدث بالإجابة صوتياً"
            >
              <Mic className="w-4 h-4" />
              <span>{isListening ? 'أنصت إليك...' : 'إجابة صوتية'}</span>
            </button>

            {!showHint && (
              <button
                onClick={handleUseHint}
                disabled={playerCoins < HINT_COST}
                className="flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1.5 rounded-xl cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>تلميح ({HINT_COST} عملات)</span>
              </button>
            )}
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-amber-400 block">
              +5 عملات للصح / -10 للغلط
            </span>
            <span className="text-[10px] text-emerald-400">
              +{calculateMasteryPoints(true)} إتقان
            </span>
          </div>
        </div>
      )}

      {speechFeedback && !answered && (
        <p className="text-[11px] text-center text-slate-400 animate-fadeIn">
          {speechFeedback}
        </p>
      )}

      {/* Answer Explanation & Spoken feedback */}
      {answered && (
        <div className="space-y-3 pt-2 animate-fadeIn">
          {/* Result banner highlighting coin delta */}
          <div className={`p-3 rounded-2xl text-center text-xs font-black flex items-center justify-center gap-2 ${
            isCorrect
              ? 'bg-emerald-950/60 border border-emerald-500/60 text-emerald-300'
              : 'bg-rose-950/60 border border-rose-500/60 text-rose-300'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span>
              {isCorrect
                ? `برافو يا بطل! ${earnedCoinsText}`
                : `أوه! ${earnedCoinsText} (الحد الأدنى 0 عملة)`}
            </span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-2xl text-xs space-y-1">
            <span className="font-bold text-amber-400 block">شرح كبسولة المنهج:</span>
            <p className="text-slate-300 leading-relaxed">{question.explanation}</p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onNext();
            }}
            className="w-full py-3.5 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{questionNumber === totalQuestions ? 'إنهاء وحساب التقييم الأكاديمي' : 'التحدي التالي'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
