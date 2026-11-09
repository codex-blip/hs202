import { MessageCircleQuestionMark } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { suggestedQuestions } from '@/lib/mock/data';

export function SuggestedQuestions({ onPick }: { onPick: (q: string) => void }) {
  const { t } = useLanguage();
  return (
    <section aria-label={t('chat.suggested')}>
      <p className="mb-3 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <MessageCircleQuestionMark className="h-3.5 w-3.5" aria-hidden="true" />
        {t('chat.suggested')}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => onPick(q)}
            className="rounded-full border border-border bg-card px-4 py-2 text-left text-sm font-medium text-foreground shadow-xs transition-colors hover:border-accent hover:bg-secondary"
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
