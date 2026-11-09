import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { Menu, X, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { LanguageSelector } from '@/components/language/LanguageSelector';
import { useLanguage, type TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const navItems: { to: string; key: TranslationKey }[] = [
  { to: '/topics', key: 'nav.topics' },
  { to: '/schemes', key: 'nav.schemes' },
  { to: '/grievance', key: 'nav.grievance' },
  { to: '/about', key: 'nav.about' },
];

export function SiteHeader() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'bg-secondary text-foreground',
                )
              }
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSelector />
          <Button asChild className="rounded-full bg-primary px-4 text-primary-foreground hover:bg-primary/90">
            <Link to="/chat">
              <MessageSquareText className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {t('nav.chat')}
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector />
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden" aria-label="Mobile">
          {[{ to: '/', key: 'nav.home' as TranslationKey }, { to: '/chat', key: 'nav.chat' as TranslationKey }, ...navItems].map(
            (item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block rounded-xl px-4 py-3 text-base font-medium text-muted-foreground',
                    isActive && 'bg-secondary text-foreground',
                  )
                }
              >
                {t(item.key)}
              </NavLink>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
