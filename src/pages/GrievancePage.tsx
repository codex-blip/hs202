import { useEffect, useState } from 'react';
import { ArrowRight, FileText, Landmark, PhoneCall, ShieldAlert } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { CitationList } from '@/components/citations/CitationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { grievanceService } from '@/lib/api/grievance';
import type { GrievanceRoute } from '@/lib/types/api';

export default function GrievancePage() {
  const [routes, setRoutes] = useState<GrievanceRoute[] | null>(null);

  useEffect(() => {
    grievanceService.listRoutes().then(setRoutes);
  }, []);

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Grievances &amp; Support</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Find the right official channel
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A complaint only moves when it reaches the authority that can act on it. Pick the category closest to your situation to see the recommended route, what to prepare, and the official contact.
        </p>

        {/* Non-adjudication notice */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-950">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p className="text-sm leading-relaxed">
            <strong>Sahakar Sahayak does not itself receive, adjudicate, or decide complaints,</strong> and using this page does not submit anything to any authority. It only helps you reach the correct official channel prepared.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          {!routes
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
            : routes.map((r) => (
                <article key={r.id} className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                  <h2 className="font-display text-xl font-semibold leading-snug">{r.category}</h2>

                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <div>
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <ArrowRight className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> Recommended next step
                      </h3>
                      <p className="mt-2 text-[15px] leading-relaxed">{r.recommendedStep}</p>
                    </div>
                    <div>
                      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <FileText className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> Information to prepare
                      </h3>
                      <ul className="mt-2 space-y-1.5">
                        {r.requiredInfo.map((info) => (
                          <li key={info} className="flex items-start gap-2 text-sm leading-relaxed">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                            {info}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-secondary/70 px-4 py-3">
                    <Landmark className="mt-0.5 h-5 w-5 shrink-0 text-foreground" aria-hidden="true" />
                    <p className="text-sm">
                      <span className="font-semibold">Official channel: </span>
                      {r.officialChannel}
                    </p>
                  </div>

                  <CitationList citations={r.citations} />
                </article>
              ))}
        </div>

        {/* Human assistance */}
        <section className="mt-12 rounded-3xl bg-primary p-8 text-primary-foreground">
          <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold">
            <PhoneCall className="h-6 w-6" aria-hidden="true" />
            Prefer to talk to a person?
          </h2>
          <p className="mt-3 max-w-2xl text-primary-foreground/85">
            If a question is complex, urgent, or personal, human help is the right path. Your PACS or cooperative office can assist in person, and the PMFBY Krishi Rakshak Helpline (<strong>14447</strong>) handles crop-insurance reporting and complaints by phone.
          </p>
          <p className="mt-4 text-xs text-primary-foreground/60">
            Example routes only. Confirm current contacts and steps with the responsible authority; this page does not submit a complaint.
          </p>
        </section>
      </div>
    </PageLayout>
  );
}
