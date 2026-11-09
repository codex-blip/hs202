import { Sprout } from 'lucide-react';
import { Link } from 'react-router';

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="Sahakar Sahayak — home">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-105">
        <Sprout className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block font-display text-lg font-semibold tracking-tight">Sahakar Sahayak</span>
          <span className="block text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Cooperative assistant
          </span>
        </span>
      )}
    </Link>
  );
}
