import { useLanguage } from '@/lib/i18n';

export function TypingIndicator() {
  const { t } = useLanguage();
  return (
    <div className="flex justify-start" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3.5 shadow-xs">
        <span className="flex gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-accent"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
        <span className="text-sm text-muted-foreground">{t('chat.typing')}</span>
      </div>
    </div>
  );
}
