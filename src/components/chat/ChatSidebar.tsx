import { MessageSquarePlus, Trash2 } from 'lucide-react';
import { topics } from '@/lib/mock/data';
import type { ConversationSummary } from '@/lib/types/api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const topicIcons: Record<string, string> = {
  governance: '🏛️', 'crop-insurance': '🌾', pacs: '🏦', 'financial-literacy': '💰',
  schemes: '📋', legal: '⚖️', grievance: '📢',
};

export function ChatSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onTopic,
}: {
  conversations: ConversationSummary[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onTopic: (q: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <aside className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
      <button
        type="button"
        onClick={onNew}
        className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
        {t('chat.new')}
      </button>

      {conversations.length > 0 && (
        <nav aria-label="Previous conversations">
          <ul className="space-y-1">
            {conversations.map((c) => (
              <li key={c.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={c.id === activeId}
                  className={cn(
                    'min-w-0 flex-1 truncate rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
                    c.id === activeId && 'bg-secondary font-medium text-foreground',
                  )}
                >
                  {c.title}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c.id)}
                  aria-label={`Delete ${c.title}`}
                  className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <section aria-label={t('chat.topics')} className="mt-auto">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('chat.topics')}</p>
        <ul className="space-y-1">
          {topics.map((tp) => (
            <li key={tp.id}>
              <button
                type="button"
                onClick={() => onTopic(tp.exampleQuestions[0])}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <span aria-hidden="true">{topicIcons[tp.id]}</span>
                <span className="truncate">{tp.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
