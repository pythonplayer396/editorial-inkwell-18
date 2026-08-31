import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LOCALES = [
  { code: "en", label: "English", native: "English", rtl: false },
  { code: "bn", label: "Bangla", native: "বাংলা", rtl: false },
  { code: "es", label: "Spanish", native: "Español", rtl: false },
  { code: "hi", label: "Hindi", native: "हिन्दी", rtl: false },
  { code: "ar", label: "Arabic", native: "العربية", rtl: true },
  { code: "fr", label: "French", native: "Français", rtl: false },
  { code: "pt", label: "Portuguese", native: "Português", rtl: false },
  { code: "zh", label: "Chinese", native: "中文", rtl: false },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

/** English is the source of truth; other locales fall back key-by-key. */
const en = {
  "brand.newsroom": "Newsroom",
  "brand.tagline": "Independent reporting, carefully told.",

  "nav.home": "Home",
  "nav.latest": "Latest",
  "nav.search": "Search",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.join": "Join The Dispatch",
  "nav.dashboard": "Dashboard",
  "nav.stories": "My Stories",
  "nav.write": "Write a Story",
  "nav.submissions": "Pending Submissions",
  "nav.oversight": "Oversight",
  "nav.audit": "Audit Log",
  "nav.staff": "Staff & Roles",
  "nav.applications": "Applications",
  "nav.profile": "Profile",
  "nav.notifications": "Notifications",
  "nav.signout": "Sign out",
  "nav.signin": "Sign in",
  "nav.viewsite": "View website",

  "action.save": "Save",
  "action.saving": "Saving…",
  "action.saved": "Saved",
  "action.cancel": "Cancel",
  "action.submit": "Submit for review",
  "action.resubmit": "Resubmit",
  "action.review": "Review",
  "action.edit": "Edit",
  "action.preview": "Preview",
  "action.approve": "Approve",
  "action.reject": "Reject",
  "action.requestChanges": "Request changes",
  "action.schedule": "Schedule",
  "action.publish": "Publish",
  "action.next": "Next submission",
  "action.previous": "Previous",
  "action.viewFeedback": "View feedback",
  "action.tryAgain": "Try again",
  "action.restore": "Restore",
  "action.discard": "Discard",
  "action.remove": "Remove",
  "action.replace": "Replace",
  "action.apply": "Apply to join",

  "status.draft": "Draft",
  "status.submitted": "Submitted",
  "status.under_review": "Under Review",
  "status.changes_requested": "Changes Requested",
  "status.rejected": "Rejected",
  "status.approved": "Approved",
  "status.in_review": "In Review",
  "status.scheduled": "Scheduled",
  "status.published": "Published",
  "status.archived": "Archived",

  "journalist.title": "Your stories",
  "journalist.subtitle": "Everything you're working on, and what needs your attention.",
  "journalist.drafts": "Drafts",
  "journalist.underReview": "Under Review",
  "journalist.changesRequested": "Changes Requested",
  "journalist.approved": "Approved",
  "journalist.published": "Published",
  "journalist.recentSubmissions": "Recent submissions",
  "journalist.recentFeedback": "Recent feedback",
  "journalist.recentlyPublished": "Recently published",
  "journalist.needsAttention": "Needs your attention",

  "staff.queue": "Pending submissions",
  "staff.queueEmpty": "You're all caught up.",
  "staff.reviewWorkspace": "Review workspace",
  "staff.internalNotes": "Internal editorial notes",
  "staff.feedbackToJournalist": "Feedback to the journalist",

  "admin.oversight": "Oversight",
  "admin.whoDidWhat": "Who did what",
  "admin.pendingSubmissions": "Pending submissions",
  "admin.publishedToday": "Published today",
  "admin.activeJournalists": "Active journalists",
  "admin.activeStaff": "Active staff",

  "empty.stories": "No stories yet.",
  "empty.storiesHint": "Your submitted stories will appear here.",
  "empty.reviews": "No pending reviews.",
  "empty.notifications": "Nothing new right now.",

  "common.language": "Language",
  "common.timeline": "Editorial timeline",
  "common.wordCount": "Word count",
  "common.readingTime": "Reading time",
  "common.minRead": "min read",
  "common.reason": "Reason",
  "common.note": "Note",
  "common.by": "by",
} as const;

export type TranslationKey = keyof typeof en;

type Dict = Partial<Record<TranslationKey, string>>;

const bn: Dict = {
  "brand.newsroom": "নিউজরুম",
  "nav.home": "হোম", "nav.latest": "সর্বশেষ", "nav.search": "খুঁজুন", "nav.about": "পরিচিতি",
  "nav.contact": "যোগাযোগ", "nav.join": "দ্য ডিসপ্যাচে যোগ দিন", "nav.dashboard": "ড্যাশবোর্ড",
  "nav.stories": "আমার প্রতিবেদন", "nav.write": "নতুন প্রতিবেদন", "nav.submissions": "জমা পড়া প্রতিবেদন",
  "nav.oversight": "তদারকি", "nav.audit": "কার্যবিবরণী", "nav.staff": "কর্মী ও ভূমিকা",
  "nav.applications": "আবেদনসমূহ", "nav.profile": "প্রোফাইল", "nav.notifications": "বিজ্ঞপ্তি",
  "nav.signout": "সাইন আউট", "nav.signin": "সাইন ইন", "nav.viewsite": "ওয়েবসাইট দেখুন",
  "action.save": "সংরক্ষণ", "action.saving": "সংরক্ষণ হচ্ছে…", "action.saved": "সংরক্ষিত",
  "action.cancel": "বাতিল", "action.submit": "পর্যালোচনার জন্য জমা দিন", "action.resubmit": "পুনরায় জমা দিন",
  "action.review": "পর্যালোচনা", "action.edit": "সম্পাদনা", "action.preview": "প্রিভিউ",
  "action.approve": "অনুমোদন", "action.reject": "প্রত্যাখ্যান", "action.requestChanges": "পরিবর্তন চান",
  "action.schedule": "সময় নির্ধারণ", "action.publish": "প্রকাশ", "action.apply": "যোগ দিতে আবেদন করুন",
  "status.draft": "খসড়া", "status.submitted": "জমা দেওয়া", "status.under_review": "পর্যালোচনাধীন",
  "status.changes_requested": "পরিবর্তন চাওয়া হয়েছে", "status.rejected": "প্রত্যাখ্যাত",
  "status.approved": "অনুমোদিত", "status.scheduled": "নির্ধারিত", "status.published": "প্রকাশিত",
  "status.archived": "সংরক্ষিত",
  "journalist.title": "আপনার প্রতিবেদন", "journalist.drafts": "খসড়া", "journalist.underReview": "পর্যালোচনাধীন",
  "journalist.changesRequested": "পরিবর্তন চাওয়া হয়েছে", "journalist.approved": "অনুমোদিত",
  "journalist.published": "প্রকাশিত", "staff.queue": "জমা পড়া প্রতিবেদন",
  "common.language": "ভাষা", "common.timeline": "সম্পাদকীয় সময়রেখা", "common.minRead": "মিনিট পড়া",
};

const es: Dict = {
  "brand.newsroom": "Redacción",
  "nav.home": "Inicio", "nav.latest": "Lo último", "nav.search": "Buscar", "nav.about": "Acerca de",
  "nav.contact": "Contacto", "nav.join": "Únete a The Dispatch", "nav.dashboard": "Panel",
  "nav.stories": "Mis historias", "nav.write": "Escribir una historia", "nav.submissions": "Envíos pendientes",
  "nav.oversight": "Supervisión", "nav.audit": "Registro de actividad", "nav.staff": "Equipo y roles",
  "nav.applications": "Solicitudes", "nav.profile": "Perfil", "nav.notifications": "Notificaciones",
  "nav.signout": "Cerrar sesión", "nav.signin": "Iniciar sesión", "nav.viewsite": "Ver el sitio",
  "action.save": "Guardar", "action.submit": "Enviar a revisión", "action.resubmit": "Reenviar",
  "action.review": "Revisar", "action.approve": "Aprobar", "action.reject": "Rechazar",
  "action.requestChanges": "Solicitar cambios", "action.schedule": "Programar", "action.publish": "Publicar",
  "action.apply": "Solicitar unirse",
  "status.draft": "Borrador", "status.submitted": "Enviado", "status.under_review": "En revisión",
  "status.changes_requested": "Cambios solicitados", "status.rejected": "Rechazado",
  "status.approved": "Aprobado", "status.scheduled": "Programado", "status.published": "Publicado",
  "status.archived": "Archivado", "common.language": "Idioma", "common.minRead": "min de lectura",
};

const hi: Dict = {
  "brand.newsroom": "न्यूज़रूम",
  "nav.home": "होम", "nav.latest": "ताज़ा", "nav.search": "खोजें", "nav.about": "परिचय",
  "nav.contact": "संपर्क", "nav.join": "द डिस्पैच से जुड़ें", "nav.dashboard": "डैशबोर्ड",
  "nav.stories": "मेरी रिपोर्ट", "nav.write": "नई रिपोर्ट", "nav.submissions": "लंबित प्रस्तुतियाँ",
  "nav.oversight": "निगरानी", "nav.audit": "गतिविधि लॉग", "nav.staff": "स्टाफ़ और भूमिकाएँ",
  "nav.applications": "आवेदन", "nav.profile": "प्रोफ़ाइल", "nav.notifications": "सूचनाएँ",
  "nav.signout": "साइन आउट", "nav.signin": "साइन इन",
  "action.submit": "समीक्षा के लिए भेजें", "action.approve": "स्वीकृत करें", "action.reject": "अस्वीकार करें",
  "action.requestChanges": "बदलाव मांगें", "action.publish": "प्रकाशित करें",
  "status.draft": "ड्राफ़्ट", "status.submitted": "भेजा गया", "status.under_review": "समीक्षाधीन",
  "status.changes_requested": "बदलाव मांगे गए", "status.rejected": "अस्वीकृत", "status.approved": "स्वीकृत",
  "status.scheduled": "निर्धारित", "status.published": "प्रकाशित", "common.language": "भाषा",
};

const ar: Dict = {
  "brand.newsroom": "غرفة الأخبار",
  "nav.home": "الرئيسية", "nav.latest": "الأحدث", "nav.search": "بحث", "nav.about": "من نحن",
  "nav.contact": "اتصل بنا", "nav.join": "انضم إلى الديسباتش", "nav.dashboard": "لوحة التحكم",
  "nav.stories": "قصصي", "nav.write": "اكتب قصة", "nav.submissions": "الطلبات المعلقة",
  "nav.oversight": "الإشراف", "nav.audit": "سجل النشاط", "nav.staff": "الفريق والأدوار",
  "nav.applications": "الطلبات", "nav.profile": "الملف الشخصي", "nav.notifications": "الإشعارات",
  "nav.signout": "تسجيل الخروج", "nav.signin": "تسجيل الدخول",
  "action.submit": "إرسال للمراجعة", "action.approve": "اعتماد", "action.reject": "رفض",
  "action.requestChanges": "طلب تعديلات", "action.publish": "نشر",
  "status.draft": "مسودة", "status.submitted": "مُرسل", "status.under_review": "قيد المراجعة",
  "status.changes_requested": "مطلوب تعديلات", "status.rejected": "مرفوض", "status.approved": "معتمد",
  "status.scheduled": "مجدول", "status.published": "منشور", "common.language": "اللغة",
};

const fr: Dict = {
  "brand.newsroom": "Rédaction",
  "nav.home": "Accueil", "nav.latest": "Dernières", "nav.search": "Recherche", "nav.about": "À propos",
  "nav.contact": "Contact", "nav.join": "Rejoindre The Dispatch", "nav.dashboard": "Tableau de bord",
  "nav.stories": "Mes articles", "nav.write": "Écrire un article", "nav.submissions": "Soumissions en attente",
  "nav.oversight": "Supervision", "nav.audit": "Journal d'activité", "nav.staff": "Équipe et rôles",
  "nav.applications": "Candidatures", "nav.profile": "Profil", "nav.notifications": "Notifications",
  "nav.signout": "Se déconnecter", "nav.signin": "Se connecter",
  "action.submit": "Soumettre pour relecture", "action.approve": "Approuver", "action.reject": "Refuser",
  "action.requestChanges": "Demander des modifications", "action.publish": "Publier",
  "status.draft": "Brouillon", "status.submitted": "Soumis", "status.under_review": "En relecture",
  "status.changes_requested": "Modifications demandées", "status.rejected": "Refusé", "status.approved": "Approuvé",
  "status.scheduled": "Programmé", "status.published": "Publié", "common.language": "Langue",
};

const pt: Dict = {
  "brand.newsroom": "Redação",
  "nav.home": "Início", "nav.latest": "Últimas", "nav.search": "Buscar", "nav.about": "Sobre",
  "nav.contact": "Contato", "nav.join": "Junte-se ao The Dispatch", "nav.dashboard": "Painel",
  "nav.stories": "Minhas matérias", "nav.write": "Escrever matéria", "nav.submissions": "Envios pendentes",
  "nav.oversight": "Supervisão", "nav.audit": "Registro de atividade", "nav.staff": "Equipe e funções",
  "nav.applications": "Candidaturas", "nav.profile": "Perfil", "nav.notifications": "Notificações",
  "nav.signout": "Sair", "nav.signin": "Entrar",
  "action.submit": "Enviar para revisão", "action.approve": "Aprovar", "action.reject": "Rejeitar",
  "action.requestChanges": "Solicitar alterações", "action.publish": "Publicar",
  "status.draft": "Rascunho", "status.submitted": "Enviado", "status.under_review": "Em revisão",
  "status.changes_requested": "Alterações solicitadas", "status.rejected": "Rejeitado", "status.approved": "Aprovado",
  "status.scheduled": "Agendado", "status.published": "Publicado", "common.language": "Idioma",
};

const zh: Dict = {
  "brand.newsroom": "编辑部",
  "nav.home": "首页", "nav.latest": "最新", "nav.search": "搜索", "nav.about": "关于",
  "nav.contact": "联系", "nav.join": "加入 The Dispatch", "nav.dashboard": "仪表板",
  "nav.stories": "我的稿件", "nav.write": "撰写稿件", "nav.submissions": "待审稿件",
  "nav.oversight": "监督", "nav.audit": "操作日志", "nav.staff": "员工与角色",
  "nav.applications": "申请", "nav.profile": "个人资料", "nav.notifications": "通知",
  "nav.signout": "退出", "nav.signin": "登录",
  "action.submit": "提交审核", "action.approve": "批准", "action.reject": "退稿",
  "action.requestChanges": "要求修改", "action.publish": "发布",
  "status.draft": "草稿", "status.submitted": "已提交", "status.under_review": "审核中",
  "status.changes_requested": "需要修改", "status.rejected": "已退稿", "status.approved": "已批准",
  "status.scheduled": "已排期", "status.published": "已发布", "common.language": "语言",
};

const DICTS: Record<LocaleCode, Dict> = { en, bn, es, hi, ar, fr, pt, zh };

const STORAGE_KEY = "dispatch.locale";

interface I18nValue {
  locale: LocaleCode;
  setLocale: (next: LocaleCode) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  rtl: boolean;
}

const I18nContext = createContext<I18nValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => en[key],
  rtl: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
    if (stored && stored in DICTS) setLocaleState(stored);
  }, []);

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the choice still applies for this session */
    }
  }, []);

  const rtl = LOCALES.find((l) => l.code === locale)?.rtl ?? false;

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, [locale, rtl]);

  const t = useCallback(
    (key: TranslationKey, fallback?: string) => DICTS[locale]?.[key] ?? en[key] ?? fallback ?? key,
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t, rtl }), [locale, setLocale, t, rtl]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

export function useT() {
  return useI18n().t;
}
