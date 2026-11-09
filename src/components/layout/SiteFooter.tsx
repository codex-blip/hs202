import { ShieldCheck, BookOpenCheck, Landmark } from 'lucide-react';
import { Link } from 'react-router';
import { Logo } from './Logo';
import { useLanguage } from '@/lib/i18n';

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="[&_span]:text-primary-foreground [&_.text-muted-foreground]:text-primary-foreground/70">
              <Logo />
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
              {t('footer.note')}
            </p>
          </div>
          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">Explore</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link className="hover:underline" to="/chat">{t('nav.chat')}</Link></li>
              <li><Link className="hover:underline" to="/topics">{t('nav.topics')}</Link></li>
              <li><Link className="hover:underline" to="/schemes">{t('nav.schemes')}</Link></li>
              <li><Link className="hover:underline" to="/grievance">{t('nav.grievance')}</Link></li>
              <li><Link className="hover:underline" to="/about">{t('nav.about')}</Link></li>
            </ul>
          </nav>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/60">Principles</h3>
            <ul className="mt-3 space-y-3 text-sm text-primary-foreground/85">
              <li className="flex items-start gap-2"><BookOpenCheck className="mt-0.5 h-4 w-4 shrink-0" /> Sources appear when available</li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> Verify important information</li>
              <li className="flex items-start gap-2"><Landmark className="mt-0.5 h-4 w-4 shrink-0" /> Decisions stay with official authorities</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-primary-foreground/15 pt-6 text-xs text-primary-foreground/60">
          Sahakar Sahayak · Independent informational tool · Not affiliated with the Ministry of Cooperation or NCCT
        </div>
      </div>
    </footer>
  );
}
