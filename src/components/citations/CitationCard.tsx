import { useState } from 'react';
import { BookOpenCheck, ChevronDown, ExternalLink, Landmark, CalendarDays } from 'lucide-react';
import type { SourceCitation } from '@/lib/types/api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/**
 * Citation card — the trust core of the product.
 * Compact by default, expands to show issuing authority, section,
 * date and last-checked metadata.
 */
export function CitationCard({ citation, index }: { citation: SourceCitation; index: number }) {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-border bg-cream text-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-foreground">
          {index + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-foreground">{citation.title}</span>
          <span className="block truncate text-xs text-muted-foreground">{citation.authority}</span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="space-y-2 border-t border-border/70 px-4 py-3 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{citation.authority}</span>
          </p>
          {citation.section && (
            <p className="flex items-start gap-2">
              <BookOpenCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {t('chat.section')}: {citation.section}
                {citation.page != null && ` · p. ${citation.page}`}
              </span>
            </p>
          )}
          {(citation.date || citation.lastChecked) && (
            <p className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {citation.date}
                {citation.lastChecked && ` · ${t('chat.lastChecked')}: ${citation.lastChecked}`}
              </span>
            </p>
          )}
          {citation.url && (
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-medium text-primary transition-colors hover:bg-secondary"
            >
              {t('chat.viewSource')}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function CitationList({ citations }: { citations: SourceCitation[] }) {
  const { t } = useLanguage();
  if (citations.length === 0) return null;
  return (
    <section aria-label={t('chat.sources')} className="mt-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {t('chat.sources')}
      </p>
      <div className="space-y-2">
        {citations.map((c, i) => (
          <CitationCard key={`${c.title}-${i}`} citation={c} index={i} />
        ))}
      </div>
    </section>
  );
}
