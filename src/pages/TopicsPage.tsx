import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { topics } from '@/lib/mock/data';

const topicIcons: Record<string, string> = {
  governance: '🏛️', 'crop-insurance': '🌾', pacs: '🏦', 'financial-literacy': '💰',
  schemes: '📋', legal: '⚖️', grievance: '📢',
};

export default function TopicsPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Topic Explorer</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Browse by topic</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Pick an area to see what it covers and example questions — then ask in your own words, in your language.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((tp) => (
            <article
              key={tp.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden="true">{topicIcons[tp.id]}</span>
              <h2 className="mt-4 text-lg font-semibold leading-snug">{tp.name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tp.description}</p>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Try asking</p>
                <ul className="mt-2 space-y-1.5">
                  {tp.exampleQuestions.slice(0, 2).map((q) => (
                    <li key={q} className="rounded-lg bg-muted px-3 py-2 text-sm text-foreground/85">“{q}”</li>
                  ))}
                </ul>
              </div>
              <Link
                to={`/chat?topic=${tp.id}`}
                className="mt-5 inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-primary hover:underline"
              >
                Ask about this topic <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
