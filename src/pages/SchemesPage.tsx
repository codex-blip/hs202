import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ClipboardList, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';
import { CitationList } from '@/components/citations/CitationCard';
import { schemeService } from '@/lib/api/schemes';
import { indianStates, topics } from '@/lib/mock/data';
import type { SchemeGuidanceResponse, TopicId } from '@/lib/types/api';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const steps = ['Your state', 'Scheme / topic', 'Your situation', 'Guidance'];

const wizardTopics: TopicId[] = ['crop-insurance', 'pacs', 'governance'];

export default function SchemesPage() {
  const { lang } = useLanguage();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<string>();
  const [topic, setTopic] = useState<TopicId>();
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SchemeGuidanceResponse | null>(null);

  const canNext = step === 0 ? !!state : step === 1 ? !!topic : step === 2 ? true : false;

  const getGuidance = async () => {
    setLoading(true);
    try {
      const res = await schemeService.getGuidance({ state, topic, situation, language: lang });
      setResult(res);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setState(undefined);
    setTopic(undefined);
    setSituation('');
    setResult(null);
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Scheme Guidance</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Find the official requirements that apply to you
        </h1>
        <p className="mt-3 text-muted-foreground">
          A short guided flow. It shows relevant official requirements — it never decides your eligibility.
        </p>

        {/* Stepper */}
        <ol className="mt-8 flex items-center gap-1 sm:gap-2" aria-label="Progress">
          {steps.map((label, i) => (
            <li key={label} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  'h-1.5 rounded-full transition-colors',
                  i < step ? 'bg-accent' : i === step ? 'bg-primary' : 'bg-border',
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  'truncate text-[11px] font-medium sm:text-xs',
                  i === step ? 'text-foreground' : 'text-muted-foreground',
                )}
                aria-current={i === step ? 'step' : undefined}
              >
                {i + 1}. {label}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
          {step === 0 && (
            <fieldset>
              <legend className="font-display text-xl font-semibold">Which state are you in?</legend>
              <p className="mt-1 text-sm text-muted-foreground">Scheme rules and cooperative law differ by state.</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {indianStates.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setState(s)}
                    aria-pressed={state === s}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                      state === s ? 'border-primary bg-secondary' : 'border-border bg-background hover:border-accent',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend className="font-display text-xl font-semibold">What do you want to explore?</legend>
              <div className="mt-5 space-y-2">
                {wizardTopics.map((id) => {
                  const tp = topics.find((x) => x.id === id)!;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setTopic(id)}
                      aria-pressed={topic === id}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                        topic === id ? 'border-primary bg-secondary' : 'border-border bg-background hover:border-accent',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold">{tp.name}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground line-clamp-2">{tp.description}</span>
                      </span>
                      {topic === id && <Check className="ml-auto mt-1 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-xl font-semibold">Anything else we should know? <span className="text-sm font-normal text-muted-foreground">(optional)</span></h2>
              <p className="mt-1 text-sm text-muted-foreground">
                For example: your crop and season, or the service you need. Please don’t share Aadhaar, bank passwords, or OTPs.
              </p>
              <label htmlFor="situation" className="sr-only">Your situation</label>
              <textarea
                id="situation"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                rows={4}
                placeholder="e.g. I grow wheat in Punjab and want to understand PMFBY enrollment…"
                className="mt-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          {step === 3 && result && (
            <div aria-live="polite">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <ClipboardList className="h-5 w-5 text-foreground" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">{result.heading}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Example guidance based on the information provided. Confirm current requirements with the responsible authority.</p>
                </div>
              </div>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Example requirements</h3>
              <ul className="mt-2 space-y-2">
                {result.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Documents you may be asked for</h3>
              <ul className="mt-2 space-y-2">
                {result.documents.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <CitationList citations={result.citations} />

              <div className="mt-5 rounded-xl bg-muted px-4 py-3">
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Info className="h-3.5 w-3.5" aria-hidden="true" /> Important limitation
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">{result.limitation}</p>
              </div>

              <div className="mt-4 rounded-xl border border-accent/30 bg-sage/40 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground/70">Next step</p>
                <p className="mt-1 text-sm leading-relaxed">{result.nextStep}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          {step < 3 && (
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="rounded-full"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" /> Back
              </Button>
              {step < 2 ? (
                <Button
                  onClick={() => canNext && setStep((s) => s + 1)}
                  disabled={!canNext}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Continue <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  onClick={getGuidance}
                  disabled={loading}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? 'Loading guidance…' : 'Get guidance'}
                  <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="mt-8">
              <Button variant="outline" onClick={reset} className="rounded-full">
                <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" /> Start over
              </Button>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This page uses example guidance, not a maintained official knowledge base. Confirm current eligibility, documents, and deadlines with the responsible authority.
        </p>
      </div>
    </PageLayout>
  );
}
