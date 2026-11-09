import { Sprout } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { SuggestedQuestions } from './SuggestedQuestions';

export function EmptyState({ onPick }: { onPick: (q: string) => void }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-10 text-center sm:py-16">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Sprout className="h-7 w-7 text-foreground" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-2xl font-semibold sm:text-3xl">{t('chat.empty.title')}</h2>
      <p className="mt-2 max-w-md text-[15px] text-muted-foreground">{t('chat.empty.sub')}</p>
      <div className="mt-8 w-full">
        <SuggestedQuestions onPick={onPick} />
      </div>
    </div>
  );
}
