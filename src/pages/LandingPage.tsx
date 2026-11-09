import { Link } from 'react-router';
import {
  ArrowRight, BookOpenCheck, Languages, Landmark, Mic, ShieldCheck, Volume2,
  MessageSquareText, CircleHelp, FileText, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';
import { useLanguage } from '@/lib/i18n';
import { API_CONFIG } from '@/lib/api/client';
import { topics } from '@/lib/mock/data';

const topicIcons: Record<string, string> = {
  governance: '🏛️', 'crop-insurance': '🌾', pacs: '🏦', 'financial-literacy': '💰',
  schemes: '📋', legal: '⚖️', grievance: '📢',
};

const features = [
  {
    icon: BookOpenCheck,
    title: 'Document-assisted answers',
    body: 'Attach a PDF or DOCX to search its text and send relevant excerpts with your question. General answers are not grounded in a maintained official-source database.',
  },
  {
    icon: Languages,
    title: 'Multilingual by design',
    body: 'The interface is available in English, Hindi, and Punjabi. Sarvam also handles supported Indian languages for chat and speech.',
  },
  {
    icon: CircleHelp,
    title: 'Honest about limits',
    body: 'AI can make mistakes. Check important scheme, legal, financial, or insurance details with the responsible authority.',
  },
  {
    icon: Landmark,
    title: 'Decisions stay official',
    body: 'The assistant explains and navigates. Eligibility, claims, and complaints are always decided by the responsible authority.',
  },
];

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-sage/40 blur-3xl" aria-hidden="true" />
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pb-24 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <Languages className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {t('hero.kicker')}
            </p>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t('hero.title1')}
              <br />
              <span className="hand-underline">{t('hero.title2')}</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{t('hero.sub')}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-primary px-6 text-base text-primary-foreground hover:bg-primary/90">
                <Link to="/chat">
                  {t('hero.cta.primary')}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6 text-base">
                <Link to="/topics">{t('hero.cta.secondary')}</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-widest text-muted-foreground/80">
              {API_CONFIG.useMock ? t('hero.sampleStatus') : t('hero.liveStatus')}
            </p>
          </div>

          {/* Illustrative answer card */}
          <div className="relative" aria-hidden="true">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-lg shadow-forest/5">
              <div className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                  How can I report crop loss under PMFBY?
                </p>
              </div>
              <div className="mt-4 rounded-2xl rounded-tl-md border border-border bg-background p-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">Illustrative answer</p>
                <p className="mt-1 text-sm leading-relaxed">
                  Contact the relevant crop-insurance authority or helpline and confirm the current reporting process…
                </p>
                <div className="mt-3 rounded-xl border border-border bg-cream px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <BookOpenCheck className="h-3 w-3" /> Please verify
                  </p>
                  <p className="mt-1 text-xs font-medium">Check current rules with the responsible authority</p>
                </div>
                <div className="mt-2.5 rounded-xl bg-muted px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold">Limitation:</span> routes and deadlines may vary by state and season.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{t('trust.title')}</h2>
            <p className="mt-3 max-w-md text-primary-foreground/80">{t('trust.sub')}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: FileText, label: 'Uploaded documents can provide context' },
              { icon: ShieldCheck, label: 'Verify important information' },
              { icon: Users, label: 'Designed for rural & assisted access' },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-3 rounded-2xl bg-primary-foreground/10 p-4">
                <item.icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium leading-snug">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">What the assistant does</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Explore cooperative services, government schemes, crop insurance (PMFBY), financial literacy, and grievance navigation. Verify guidance with the responsible authority.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                <f.icon className="h-5 w-5 text-foreground" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold leading-snug">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Supported topics</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">Browse seven information areas and ask a question in chat.</p>
            </div>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/topics">
                All topics <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.slice(0, 6).map((tp) => (
              <Link
                key={tp.id}
                to={`/chat?topic=${tp.id}`}
                className="group flex items-start gap-3.5 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden="true">{topicIcons[tp.id]}</span>
                <span>
                  <span className="block font-semibold group-hover:text-accent">{tp.name}</span>
                  <span className="mt-1 block line-clamp-2 text-sm text-muted-foreground">{tp.exampleQuestions[0]}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Voice / accessibility */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-10 rounded-3xl border border-border bg-card p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">Designed for every user</h2>
            <p className="mt-3 text-muted-foreground">
              Built for rural and first-time internet users: large readable text, high contrast, simple navigation, and voice input and playback.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: Mic, text: 'Voice input — record a question for transcription' },
                { icon: Volume2, text: 'Listen to answers with Sarvam text-to-speech' },
                { icon: Languages, text: 'Type in your language, including transliterated text' },
              ].map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <item.icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                  </span>
                  <span className="pt-1.5 text-sm leading-relaxed">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-secondary/60 p-6 text-center">
            <p className="font-display text-xl font-medium leading-relaxed">
              “Meri fasal barish se kharab ho gayi. PMFBY mein nuksan ki report kahan karun?”
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              A transliterated Hindi question — the kind of input the assistant is designed to understand.
            </p>
            <Button asChild className="mt-5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/chat">
                <MessageSquareText className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Ask a question
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
