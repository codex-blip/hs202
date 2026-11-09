import { AlertTriangle, ArrowDown, CircleHelp, FileText, Languages, MessageSquareText, Volume2 } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';

const flow = [
  { icon: MessageSquareText, title: 'Ask a question', body: 'Send a question and, when available, the recent conversation context.' },
  { icon: FileText, title: 'Attach documents if useful', body: 'PDF and DOCX text is extracted and indexed locally. Relevant excerpts are sent to Sarvam with your question.' },
  { icon: Languages, title: 'Generate an answer', body: 'In live mode, Sarvam generates a reply. General answers are not checked against a maintained official-source database.' },
  { icon: Volume2, title: 'Use speech tools', body: 'Sarvam can transcribe a voice question and generate spoken audio for an answer.' },
  { icon: AlertTriangle, title: 'Review and verify', body: 'AI can make mistakes. Citations identify attached documents when used; confirm important information with the responsible authority.' },
];

const limits = [
  {
    title: 'Answers may be inaccurate',
    body: 'General answers are AI-generated and are not independently verified against current official guidance.',
  },
  {
    title: 'Some pages use example information',
    body: 'Scheme and grievance pages use example records. Confirm current eligibility, contacts, and deadlines with the responsible authority.',
  },
  {
    title: 'Uploaded files provide limited context',
    body: 'The system searches text extracted from your attached files; it does not verify that those files are current or authoritative.',
  },
  {
    title: 'No government action is taken',
    body: 'This tool does not determine eligibility, decide claims, or submit complaints to any authority.',
  },
];

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">About / How it works</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          AI assistance with clear limitations
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Sahakar Sahayak is an independent informational tool for cooperative members and rural communities. It is not affiliated with or endorsed by a government body.
        </p>

        {/* Visual flow */}
        <section className="mt-12" aria-label="How a question is answered">
          <ol className="relative mx-auto max-w-2xl space-y-0">
            {flow.map((step, i) => (
              <li key={step.title} className="relative">
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <step.icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Step {i + 1}</p>
                    <h2 className="font-semibold leading-snug">{step.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </div>
                {i < flow.length - 1 && (
                  <div className="flex justify-center py-1" aria-hidden="true">
                    <ArrowDown className="h-5 w-5 text-accent" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* Safeguards */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Important limitations</h2>
          <p className="mt-2 text-muted-foreground">Check current official information before acting on an AI response.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {limits.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-5">
                <CircleHelp className="h-5 w-5 text-accent" aria-hidden="true" />
                <h3 className="mt-3 font-semibold leading-snug">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Honest status */}
        <section className="mt-16 rounded-3xl bg-secondary/50 p-8">
          <h2 className="font-display text-2xl font-semibold">What this service includes</h2>
          <div className="mt-4 grid gap-6 text-sm leading-relaxed sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-foreground">Available capabilities</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>Chat and speech features using Sarvam in live mode</li>
                <li>Local PDF and DOCX text extraction and search</li>
                <li>Example scheme and grievance guidance</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">This service is not</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                <li>A government service or official source database</li>
                <li>Legal, financial, or insurance advice</li>
                <li>A decision-maker for claims or eligibility</li>
                <li>A channel that submits complaints to authorities</li>
              </ul>
            </div>
          </div>
          <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/chat">Try the assistant</Link>
          </Button>
        </section>
      </div>
    </PageLayout>
  );
}
