import { Globe } from "lucide-react";

import { LOCALES, useI18n, type LocaleCode } from "@/lib/i18n";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Globe className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleCode)}
        className={`rounded-sm border border-border bg-background px-1.5 py-1 text-xs outline-none transition-colors hover:bg-muted focus-visible:border-secondary-accent ${
          compact ? "" : "min-w-24"
        }`}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}
