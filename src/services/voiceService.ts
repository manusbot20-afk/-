/**
 * Multi-layer Voice Narrator Engine (عم رشيد - صوت رجل حكيم في الخمسين)
 * 
 * Layer 1: Dedicated Pre-recorded MP3 Files (/audio/narrator/*.mp3)
 * Layer 2: Real-time Audio Stream via HTML5 Audio element
 * Layer 3: Web Speech API (with pitch: 0.72 & rate: 0.85 calibrated for mature male voice)
 * Layer 4: Real-time Visual Subtitles Bar (VoiceNarrationBar)
 */

type VoiceStatusListener = (isSpeaking: boolean, currentText?: string) => void;

// Clean and polish Arabic text for smooth spoken phonetics
export function polishArabicForSpeech(rawText: string): string {
  let text = rawText
    .replace(/[#*`_~]/g, '')
    .replace(/[\(\)\[\]\{\}]/g, '، ')
    .replace(/\s*[-–—]\s*/g, '، ')
    .replace(/[\/\\|]/g, ' أو ')
    .replace(/\b1881\b/g, 'عام ألف وثمانمائة وواحد وثمانين')
    .replace(/\b1882\b/g, 'عام ألف وثمانمائة واثنين وثمانين')
    .replace(/\b1919\b/g, 'عام ألف وتسعمائة وتسعة عشر')
    .replace(/\b1922\b/g, 'عام ألف وتسعمائة واثنين وعشرين')
    .replace(/\b1923\b/g, 'عام ألف وتسعمائة وثلاثة وعشرين')
    .replace(/\b1516\b/g, 'عام ألف وخمسمائة وستة عشر')
    .replace(/\b1517\b/g, 'عام ألف وخمسمائة وسبعة عشر')
    .replace(/\b1798\b/g, 'عام ألف وسبعمائة وثمانية وتسعين')
    .replace(/\b1805\b/g, 'عام ألف وثمانمائة وخمسة')
    .replace(/\b1840\b/g, 'عام ألف وثمانمائة وأربعين')
    .replace(/\b1000\b/g, 'ألف')
    .replace(/\b500\b/g, 'خمسمائة')
    .replace(/\b200\b/g, 'مائتين')
    .replace(/\b100\b/g, 'مائة')
    .replace(/\b50\b/g, 'خمسين')
    .replace(/\b25\b/g, 'خمسة وعشرين')
    .replace(/\b20\b/g, 'عشرين')
    .replace(/\b10\b/g, 'عشرة')
    .replace(/\b5\b/g, 'خمسة')
    .replace(/\b7\b/g, 'سبعة')
    .replace(/\b3\b/g, 'ثلاثة')
    .replace(/،+/g, '،')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

// Stage ID to pre-recorded narrative MP3 file mapping
const STAGE_AUDIO_FILES: Record<string, { file: string; text: string }> = {
  geo_stage_1: {
    file: '/audio/narrator/story_geo_1.mp3',
    text: 'اسمع يا بطل.. الأرض فيها سبع قارات، أكبرها آسيا وأصغرها أستراليا. والمحيط الهادي هو الأكبر في العالم! يلا نبدأ استكشاف الخريطة!'
  },
  geo_stage_2: {
    file: '/audio/narrator/story_geo_2.mp3',
    text: 'ركز معايا.. جبال الهيمالايا في آسيا فيها أعلى قمة بالعالم، قمة إيفرست. ونهر النيل في مصر وأفريقيا هو أطول أنهار كوكب الأرض!'
  },
  geo_stage_3: {
    file: '/audio/narrator/story_geo_3.mp3',
    text: 'أقاليم المناخ مقسمة لأقاليم حارة ومعتدلة وباردة. إقليم البحر المتوسط حار جاف صيفاً، دافئ ممطر شتاءً. يلا نكتشف أسرار الطقس!'
  },
  hist_stage_1: {
    file: '/audio/narrator/story_hist_1.mp3',
    text: 'سنة ألف وخمسمائة وسبعة عشر في معركة الريدانية، انتصر السلطان العثماني سليم الأول على المماليك، وأصبحت مصر ولاية عثمانية.'
  },
  hist_stage_2: {
    file: '/audio/narrator/story_hist_2.mp3',
    text: 'في يوليو ألف وسبعمائة وثمانية وتسعين، نزلت الحملة الفرنسية بقيادة نابليون بونابرت على الإسكندرية، وواجههم البطل محمد كريم بكل شجاعة!'
  },
  hist_stage_3: {
    file: '/audio/narrator/story_hist_3.mp3',
    text: 'في دار المحكمة سنة ألف وثمانمائة وخمسة، اجتمع زعماء الشعب المصري بقيادة عمر مكرم، وقرروا تولية محمد علي والياً على مصر!'
  },
  hist_stage_4_boss: {
    file: '/audio/narrator/story_hist_4.mp3',
    text: 'في ساحة عابدين سنة ألف وثمانمائة وواحد وثمانين، وقف أحمد عرابي أمام الخديوي توفيق وقال كلمته التاريخية: لقد خلقنا الله أحراراً ولن نستعبد بعد اليوم!'
  }
};

class VoiceService {
  private currentAudio: HTMLAudioElement | null = null;
  private synth: SpeechSynthesis | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;
  private listeners: VoiceStatusListener[] = [];
  private currentSpokenText: string = '';
  private isAudioUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  public unlockAudio() {
    this.isAudioUnlocked = true;
    if (typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const dummyCtx = new AudioCtx();
          if (dummyCtx.state === 'suspended') {
            dummyCtx.resume();
          }
        }
      } catch {}
    }
  }

  private initVoices() {
    if (!this.synth) return;
    try {
      const voices = this.synth.getVoices();
      if (!voices || voices.length === 0) return;

      const isArabic = (v: SpeechSynthesisVoice) =>
        /^(ar|ara)/i.test(v.lang) || /arabic|عربي|عربية/i.test(v.name);

      const arabicVoices = voices.filter(isArabic);

      if (arabicVoices.length > 0) {
        const best =
          arabicVoices.find(v => /shakir/i.test(v.name)) ||
          arabicVoices.find(v => /maged|tarik|naayf|hamed/i.test(v.name)) ||
          arabicVoices.find(v => /male/i.test(v.name) && /ar/i.test(v.lang)) ||
          arabicVoices.find(v => /ar[-_]eg/i.test(v.lang) && /natural|online/i.test(v.name)) ||
          arabicVoices.find(v => /ar[-_]eg/i.test(v.lang)) ||
          arabicVoices.find(v => /google/i.test(v.name)) ||
          arabicVoices[0];

        this.selectedVoice = best;
      }
    } catch {}
  }

  public subscribe(listener: VoiceStatusListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(isSpeaking: boolean, text?: string) {
    this.currentSpokenText = isSpeaking ? (text || '') : '';
    this.listeners.forEach(l => l(isSpeaking, text));
  }

  public getCurrentSpokenText(): string {
    return this.currentSpokenText;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }

    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }

    this.notify(false);
  }

  public isSpeaking(): boolean {
    if (this.currentAudio && !this.currentAudio.paused && !this.currentAudio.ended) {
      return true;
    }
    return this.synth ? this.synth.speaking : false;
  }

  /**
   * LAYER 1: Play pre-recorded MP3 file
   */
  public playAudioFile(filePath: string, subtitleText: string, onEnd?: () => void): boolean {
    if (!this.isEnabled) {
      if (onEnd) onEnd();
      return false;
    }

    this.stop();

    try {
      const audio = new Audio(filePath);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.notify(true, subtitleText);
      };

      audio.onended = () => {
        this.notify(false);
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        // Fallback to streaming/speechSynthesis
        this.fallbackSpeech(subtitleText, onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocked autoplay, fall back gracefully
          this.fallbackSpeech(subtitleText, onEnd);
        });
      }
      return true;
    } catch {
      this.fallbackSpeech(subtitleText, onEnd);
      return false;
    }
  }

  /**
   * Welcome Audio played on launch or when pressing "استمع للراوي"
   */
  public playWelcomeAudio(onEnd?: () => void) {
    const text = 'أهلاً يا بطل! جاهز للمغامرة؟ أنا عم رشيد، وهكون معاك في رحلة إنقاذ المعرفة في الدراسات الاجتماعية!';
    this.playAudioFile('/audio/narrator/welcome.mp3', text, onEnd);
  }

  /**
   * Test audio functionality for testing 50yo mentor voice
   */
  public testAudio(onEnd?: () => void) {
    const text = 'صوت الراوي عم رشيد يعمل بنجاح وكفاءة تامة! استعد للتحدي وجمع العملات يا بطل!';
    this.playAudioFile('/audio/narrator/test_voice.mp3', text, onEnd);
  }

  /**
   * Spoken feedback strictly conforming to +5 / -10 system
   */
  public speakAnswerFeedback(isCorrect: boolean, isFirstTryNoHint: boolean = false, coinsLeft: number = 10, onEnd?: () => void) {
    if (isCorrect) {
      if (isFirstTryNoHint) {
        const text = 'برافو يا بطل! إجابة ممتازة من أول مرة! +7 عملات كاملة!';
        this.playAudioFile('/audio/narrator/correct_7.mp3', text, onEnd);
      } else {
        const text = 'برافو يا بطل! +5 عملات في رصيدك!';
        this.playAudioFile('/audio/narrator/correct_5.mp3', text, onEnd);
      }
    } else {
      if (coinsLeft <= 0) {
        const text = 'خلاص يا بطل، عملاتك خلصت. حاول تجاوب صح عشان تجمع تاني!';
        this.playAudioFile('/audio/narrator/coins_zero.mp3', text, onEnd);
      } else {
        const text = 'أوه! -10 عملات. ركز أكتر يا بطل!';
        this.playAudioFile('/audio/narrator/wrong_10.mp3', text, onEnd);
      }
    }
  }

  /**
   * Boss Battle Audio Effects
   */
  public playBossHit(onEnd?: () => void) {
    const text = 'ضربة أسطورية في درع الزعيم! كسبت +20 عملة!';
    this.playAudioFile('/audio/narrator/boss_hit.mp3', text, onEnd);
  }

  public playBossWrong(onEnd?: () => void) {
    const text = 'تصدى الزعيم للهجوم! -10 عملات وفقدت قلباً، ركز يا بطل!';
    this.playAudioFile('/audio/narrator/boss_wrong.mp3', text, onEnd);
  }

  public playBossWin(onEnd?: () => void) {
    const text = 'انتصار ساحق! تم هزيمة الزعيم واسترجاع جزء من خريطة المعرفة!';
    this.playAudioFile('/audio/narrator/boss_win.mp3', text, onEnd);
  }

  /**
   * Narrate Stage Story: Uses pre-recorded audio file if available
   */
  public speakLesson(title: string, story: string, stageId?: string, onEnd?: () => void) {
    if (stageId && STAGE_AUDIO_FILES[stageId]) {
      const item = STAGE_AUDIO_FILES[stageId];
      this.playAudioFile(item.file, `${title}. ${item.text}`, onEnd);
      return;
    }

    const fullNarration = `${title}. ركز معايا يا بطل.. ${story}`;
    this.speak(fullNarration, onEnd);
  }

  /**
   * General speak method (Pre-recorded match -> Audio Stream -> Web Speech API)
   */
  public speak(text: string, onEnd?: () => void, priority: boolean = true) {
    if (!this.isEnabled) {
      if (onEnd) onEnd();
      return;
    }

    if (priority) {
      this.stop();
    }

    const polishedText = polishArabicForSpeech(text);

    // Check if it matches any pre-recorded lines
    if (text.includes('أهلاً يا بطل')) {
      this.playAudioFile('/audio/narrator/welcome.mp3', polishedText, onEnd);
      return;
    }
    if (text.includes('+5') || text.includes('خمسة عملات')) {
      this.playAudioFile('/audio/narrator/correct_5.mp3', polishedText, onEnd);
      return;
    }
    if (text.includes('+7') || text.includes('سبعة عملات')) {
      this.playAudioFile('/audio/narrator/correct_7.mp3', polishedText, onEnd);
      return;
    }
    if (text.includes('-10') || text.includes('ناقص عشرة')) {
      this.playAudioFile('/audio/narrator/wrong_10.mp3', polishedText, onEnd);
      return;
    }
    if (text.includes('عملاتك خلصت')) {
      this.playAudioFile('/audio/narrator/coins_zero.mp3', polishedText, onEnd);
      return;
    }
    if (text.includes('ضربة أسطورية') || text.includes('+20')) {
      this.playAudioFile('/audio/narrator/boss_hit.mp3', polishedText, onEnd);
      return;
    }

    // LAYER 2: Try streaming TTS audio via HTML5 Audio
    try {
      const encoded = encodeURIComponent(polishedText.slice(0, 180));
      const streamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encoded}`;
      const audio = new Audio(streamUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        this.notify(true, polishedText);
      };

      audio.onended = () => {
        this.notify(false);
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.currentAudio = null;
        this.fallbackSpeech(polishedText, onEnd);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.fallbackSpeech(polishedText, onEnd);
        });
      }
    } catch {
      this.fallbackSpeech(polishedText, onEnd);
    }
  }

  /**
   * LAYER 3: Web Speech API with 50yo man pitch & rate
   */
  private fallbackSpeech(polishedText: string, onEnd?: () => void) {
    if (!this.synth) {
      this.visualFallback(polishedText, onEnd);
      return;
    }

    if (!this.selectedVoice) {
      this.initVoices();
    }

    try {
      const utterance = new SpeechSynthesisUtterance(polishedText);
      utterance.lang = 'ar-EG';
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      utterance.pitch = 0.72; // Deep warm mature 50yo timbre
      utterance.rate = 0.85;  // Deliberate mentor storytelling pace

      utterance.onstart = () => {
        this.notify(true, polishedText);
      };

      utterance.onend = () => {
        this.notify(false);
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        this.notify(false);
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    } catch {
      this.visualFallback(polishedText, onEnd);
    }
  }

  private visualFallback(text: string, onEnd?: () => void) {
    this.notify(true, text);
    const duration = Math.min(5000, Math.max(1500, text.length * 50));
    setTimeout(() => {
      this.notify(false);
      if (onEnd) onEnd();
    }, duration);
  }

  /**
   * Voice Recognition for answering out loud
   */
  public listen(
    onResult: (transcript: string) => void,
    onError: (err: string) => void,
    onStart?: () => void
  ): (() => void) {
    if (typeof window === 'undefined') {
      onError('الصوت غير مدعوم');
      return () => {};
    }

    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
                              (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError('خاصية التعرف الصوتي غير مدعومة في هذا المتصفح');
      return () => {};
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        if (onStart) onStart();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      recognition.onerror = (event: any) => {
        onError(event.error || 'لم يتم التعرف على الصوت');
      };

      recognition.start();

      return () => {
        try {
          recognition.stop();
        } catch {}
      };
    } catch {
      onError('تعذر تشغيل الميكروفون');
      return () => {};
    }
  }
}

export const voice = new VoiceService();
