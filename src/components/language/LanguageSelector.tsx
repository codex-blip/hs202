import { Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { uiLanguages, useLanguage } from '@/lib/i18n';

export function LanguageSelector({ variant = 'outline' }: { variant?: 'outline' | 'ghost' }) {
  const { lang, setLang, t } = useLanguage();
  const current = uiLanguages.find((l) => l.code === lang);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2 rounded-full" aria-label={t('common.language')}>
          <Languages className="h-4 w-4" aria-hidden="true" />
          <span className="text-sm font-medium">{current?.native}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        {uiLanguages.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onSelect={() => setLang(l.code)}
            className="flex items-center justify-between gap-3"
            aria-current={l.code === lang}
          >
            <span>
              {l.native} <span className="text-muted-foreground">· {l.label}</span>
            </span>
            {l.code === lang && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
