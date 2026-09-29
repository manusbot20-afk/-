import { AcademicBadge } from '../types';

export const ACADEMIC_BADGES: AcademicBadge[] = [
  {
    id: 'badge_excellent_mastery',
    title: 'فهم ممتاز (90%+)',
    description: 'أجبت عن تحديات الدرس بنسبة دقة فائقة 90% أو أكثر من المحاولة الأولى.',
    icon: 'Award',
    criteria: 'دقة 90% فأكثر في أي درس',
    category: 'mastery'
  },
  {
    id: 'badge_hard_worker',
    title: 'الطالب المجتهد',
    description: 'أتممت جميع تحديات ومراحل المنطقة الدراسية كاملة.',
    icon: 'CheckCircle',
    criteria: 'إنهاء كل مراحل أي منطقة',
    category: 'completion'
  },
  {
    id: 'badge_quick_witted',
    title: 'سريع البديهة',
    description: 'حللت التحديات في وقت قياسي وبدون تردد.',
    icon: 'Zap',
    criteria: 'سرعة ودقة عالية في التفاعل',
    category: 'speed'
  },
  {
    id: 'badge_no_hints',
    title: 'المستكشف المستقل',
    description: 'اجتزت الدرس بالكامل دون استخدام أي تلميح (No Hints).',
    icon: 'ShieldCheck',
    criteria: 'إنهاء درس كامل بدون طلب مساعدة أو تلميحات',
    category: 'nohints'
  },
  {
    id: 'badge_smart_review',
    title: 'المثابر الذكي',
    description: 'راجعت درساً تعثرت فيه سابقاً وأتقنته بدرجة امتياز.',
    icon: 'RefreshCw',
    criteria: 'إتقان موضوع كان مسجلاً في المراجعة',
    category: 'review'
  },
  {
    id: 'badge_history_expert',
    title: 'خبير التاريخ المصري',
    description: 'أتقنت جميع دروس تاريخ الصف الثالث الإعدادي (المماليك، بونابرت، محمد علي، عرابي).',
    icon: 'BookOpen',
    criteria: 'إتقان وحدات التاريخ بالكامل',
    category: 'mastery'
  },
  {
    id: 'badge_geography_expert',
    title: 'خبير الجغرافيا العالمية',
    description: 'أتقنت تضاريس وقارات ومناخ العالم وأسئلة سقف العالم والأنهار.',
    icon: 'Globe',
    criteria: 'إتقان وحدة الجغرافيا بالكامل',
    category: 'mastery'
  },
  {
    id: 'badge_egypt_explorer',
    title: 'مستكشف مصر الكبير',
    description: 'فتحت كل مناطق المنهج المصري واستعدت خريطة المعرفة كاملة.',
    icon: 'Trophy',
    criteria: 'إنهاء كافة مناطق وخريطة اللعبة',
    category: 'completion'
  }
];
