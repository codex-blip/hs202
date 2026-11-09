import { AlertTriangle, ArrowRight, CircleHelp, Info, Volume2, GitCompareArrows, Square, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChatResponse, LanguageCode } from '@/lib/types/api';
import { CitationList } from '@/components/citations/CitationCard';
import { useLanguage } from '@/lib/i18n';
import { synthesizeSpeech } from '@/lib/api/chat';
import { ApiError } from '@/lib/api/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  response?: ChatResponse;
  speechLanguage?: LanguageCode;
}

export function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[85%] items-start gap-2.5 sm:max-w-[70%]">
        <div className="rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-primary-foreground">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{text}</p>
        </div>
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary" aria-hidden="true">
          <UserRound className="h-4 w-4 text-foreground" />
        </span>
      </div>
    </div>
  );
}

const kindStyles: Record<string, { icon: typeof Info; label: string; classes: string }> = {
  insufficient_evidence: {
    icon: CircleHelp,
    label: 'Not enough verified information',
    classes: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  high_risk: {
    icon: AlertTriangle,
    label: 'Needs official or legal guidance',
    classes: 'border-red-300 bg-red-50 text-red-900',
  },
  source_conflict: {
    icon: GitCompareArrows,
    label: 'Sources may conflict — verify before acting',
    classes: 'border-orange-300 bg-orange-50 text-orange-900',
  },
};

function getSpeechText(response: ChatResponse): string {
  return [
    ...response.answer,
    ...(response.points ?? []),
    response.limitation,
    response.nextStep,
  ]
    .filter((part): part is string => Boolean(part))
    .join('. ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[`*_>#~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSpeechLanguage(text: string, fallback: LanguageCode): LanguageCode {
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa';
  if (/[\u0980-\u09FF]/.test(text)) return fallback === 'as' ? 'as' : 'bn';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0B00-\u0B7F]/.test(text)) return 'or';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
  if (/[\u0900-\u097F]/.test(text)) {
    return fallback === 'mr' ? 'mr' : 'hi';
  }
  if (/[A-Za-z]/.test(text)) return 'en';
  return fallback;
}

export function AssistantMessage({
  response,
  language,
}: {
  response: ChatResponse;
  language: LanguageCode;
}) {
  const { t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingSpeech, setIsLoadingSpeech] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const flag = kindStyles[response.kind];
  const speechText = getSpeechText(response);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const toggleSpeech = async () => {
    if (isSpeaking) {
      audioRef.current?.pause();
      audioRef.current = null;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      setIsSpeaking(false);
      return;
    }
    if (isLoadingSpeech) return;
    if (speechText.length > 2500) {
      toast.error(t('chat.listen.tooLong'));
      return;
    }

    setIsLoadingSpeech(true);
    try {
      const audioBlob = await synthesizeSpeech(
        speechText,
        getSpeechLanguage(speechText, language),
      );
      const objectUrl = URL.createObjectURL(audioBlob);
      objectUrlRef.current = objectUrl;
      const audio = new Audio(objectUrl);
      audioRef.current = audio;
      audio.onended = () => {
        audioRef.current = null;
        objectUrlRef.current = null;
        URL.revokeObjectURL(objectUrl);
        setIsSpeaking(false);
      };
      audio.onerror = () => {
        audioRef.current = null;
        objectUrlRef.current = null;
        URL.revokeObjectURL(objectUrl);
        setIsSpeaking(false);
        toast.error(t('chat.listen.error'));
      };
      await audio.play();
      setIsSpeaking(true);
    } catch (error) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
      audioRef.current = null;
      toast.error(error instanceof ApiError ? error.message : t('chat.listen.error'));
    } finally {
      setIsLoadingSpeech(false);
    }
  };

  return (
    <div className="flex justify-start">
      <div className="w-full max-w-[92%] sm:max-w-[80%]">
        <div className="rounded-2xl rounded-tl-md border border-border bg-card px-4 py-4 shadow-xs sm:px-5">
          {flag && (
            <div className={`mb-3 flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${flag.classes}`}>
              <flag.icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{flag.label}</span>
            </div>
          )}

          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-accent">{t('chat.answer')}</p>
          <div className="chat-markdown text-[15px] leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {response.answer.join('\n\n')}
            </ReactMarkdown>
          </div>

          {response.points && response.points.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {response.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-[15px]">
                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          )}

          {response.limitation && (
            <div className="mt-4 rounded-xl bg-muted px-3.5 py-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                {t('chat.limitation')}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">{response.limitation}</p>
            </div>
          )}

          <CitationList citations={response.citations} />

          {response.nextStep && (
            <div className="mt-4 rounded-xl border border-accent/30 bg-sage/40 px-3.5 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-foreground/70">{t('chat.nextstep')}</p>
              <p className="text-sm leading-relaxed">{response.nextStep}</p>
            </div>
          )}

          <div className="mt-4 flex justify-end border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={() => void toggleSpeech()}
              disabled={isLoadingSpeech}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={isSpeaking ? t('chat.listen.stop') : t('chat.listen')}
              aria-pressed={isSpeaking}
            >
              {isSpeaking ? (
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isSpeaking ? t('chat.listen.stop') : t('chat.listen')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
