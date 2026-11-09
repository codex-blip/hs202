import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatInput } from '@/components/chat/ChatInput';
import { EmptyState } from '@/components/chat/EmptyState';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { AssistantMessage, UserMessage, type ChatTurn } from '@/components/chat/ChatMessage';
import { Logo } from '@/components/layout/Logo';
import { API_CONFIG, ApiError } from '@/lib/api/client';
import { chatService, deleteConversationDocuments, deleteDocument, uploadDocument } from '@/lib/api/chat';
import type { ChatDocument, ChatHistoryMessage, ConversationSummary, TopicId } from '@/lib/types/api';
import { suggestedQuestions, topics } from '@/lib/mock/data';
import { resolveLanguageCode, useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

interface StoredConversation {
  id: string;
  title: string;
  topic: TopicId;
  updatedAt: string;
  turns: ChatTurn[];
  documents?: ChatDocument[];
}

const STORAGE_KEY = 'sahakar-sahayak.conversations.v1';

function loadConversations(): StoredConversation[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as StoredConversation[];
  } catch {
    return [];
  }
}

function inferTopic(message: string): TopicId {
  const m = message.toLowerCase();
  if (/(pmfby|crop|fasal|bima|insurance)/.test(m)) return 'crop-insurance';
  if (/(pacs|service|document)/.test(m)) return 'pacs';
  if (/(grievance|complain)/.test(m)) return 'grievance';
  if (/(loan|interest|fraud|financial)/.test(m)) return 'financial-literacy';
  return 'governance';
}

export default function ChatPage() {
  const { t, lang } = useLanguage();
  const [conversations, setConversations] = useState<StoredConversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [lastDetectedLanguage, setLastDetectedLanguage] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const [searchParams, setSearchParams] = useSearchParams();
  const autoAskedRef = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, 20)));
  }, [conversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [active?.turns.length, loading]);

  // Deep link: /chat?topic=<id> starts a conversation with that topic's example question.
  useEffect(() => {
    const topicId = searchParams.get('topic');
    if (!topicId || autoAskedRef.current) return;
    autoAskedRef.current = true;
    setSearchParams({}, { replace: true });
    const tp = topics.find((x) => x.id === topicId);
    if (tp) ask(tp.exampleQuestions[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const summaries: ConversationSummary[] = conversations.map(({ id, title, topic, updatedAt }) => ({
    id,
    title,
    topic,
    updatedAt,
  }));

  const ask = async (question: string, detectedLanguage?: string) => {
    setError(null);
    setLoading(true);
    setLastQuestion(question);
    setLastDetectedLanguage(detectedLanguage);

    let convId = activeId;
    const userTurn: ChatTurn = { id: crypto.randomUUID(), role: 'user', text: question };

    if (!convId) {
      convId = crypto.randomUUID();
      const conv: StoredConversation = {
        id: convId,
        title: question.length > 48 ? question.slice(0, 48) + '…' : question,
        topic: inferTopic(question),
        updatedAt: new Date().toISOString(),
        turns: [userTurn],
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(convId);
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, turns: [...c.turns, userTurn], updatedAt: new Date().toISOString() } : c)),
      );
    }

    try {
      const previousTurns = active?.turns ?? [];
      const turnsForHistory =
        previousTurns.at(-1)?.role === 'user' && previousTurns.at(-1)?.text === question
          ? previousTurns.slice(0, -1)
          : previousTurns;
      const history = turnsForHistory.slice(-12).flatMap<ChatHistoryMessage>((turn) => {
        if (turn.role === 'user') {
          return turn.text ? [{ role: 'user', content: turn.text.slice(0, 4000) }] : [];
        }
        const content = turn.response
          ? [
              ...turn.response.answer,
              ...(turn.response.points ?? []),
              turn.response.nextStep,
            ]
              .filter((part): part is string => Boolean(part))
              .join('\n\n')
          : '';
        return content ? [{ role: 'assistant', content: content.slice(0, 4000) }] : [];
      });
      const response = await chatService.sendMessage({
        message: question,
        language: lang,
        detectedLanguage,
        conversationId: convId,
        documentIds: active?.documents?.map((document) => document.id),
        history,
      });
      const botTurn: ChatTurn = {
        id: crypto.randomUUID(),
        role: 'assistant',
        response,
        speechLanguage: resolveLanguageCode(detectedLanguage) ?? lang,
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, turns: [...c.turns, botTurn], updatedAt: new Date().toISOString() } : c)),
      );
    } catch (error) {
      setError(error instanceof ApiError ? error.message : t('chat.error'));
    } finally {
      setLoading(false);
    }
  };

  const newConversation = () => {
    setActiveId(null);
    setError(null);
  };

  const addDocument = async (file: File) => {
    const conversationId = activeId ?? crypto.randomUUID();
    const document = await uploadDocument(file, conversationId);
    setConversations((previous) => {
      const current = previous.find((conversation) => conversation.id === conversationId);
      if (current) {
        return previous.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, documents: [...(conversation.documents ?? []), document] }
            : conversation,
        );
      }
      const conversation: StoredConversation = {
        id: conversationId,
        title: file.name.length > 48 ? `${file.name.slice(0, 48)}…` : file.name,
        topic: 'governance',
        updatedAt: new Date().toISOString(),
        turns: [],
        documents: [document],
      };
      return [conversation, ...previous];
    });
    setActiveId(conversationId);
  };

  const removeAttachedDocument = async (documentId: string) => {
    if (!activeId) return;
    await deleteDocument(documentId, activeId);
    setConversations((previous) =>
      previous.map((conversation) =>
        conversation.id === activeId
          ? {
              ...conversation,
              documents: (conversation.documents ?? []).filter((document) => document.id !== documentId),
            }
          : conversation,
      ),
    );
  };

  const deleteConversation = (id: string) => {
    const conversation = conversations.find((item) => item.id === id);
    if (conversation?.documents?.length) {
      void deleteConversationDocuments(id).catch(() => {
        toast.error(t('chat.document.deleteError'));
      });
    }
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const sidebar = (
    <ChatSidebar
      conversations={summaries}
      activeId={activeId ?? undefined}
      onSelect={(id) => setActiveId(id)}
      onNew={newConversation}
      onDelete={deleteConversation}
      onTopic={ask}
    />
  );

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Chat top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-3 sm:px-4">
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open conversation menu">
                <PanelLeft className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 pt-4">
              {sidebar}
            </SheetContent>
          </Sheet>
          <Button asChild variant="ghost" size="icon" aria-label={t('common.back')}>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="hidden sm:block">
            <Logo compact />
          </div>
          <h1 className="ml-1 font-display text-base font-semibold">{t('chat.title')}</h1>
          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
            {API_CONFIG.useMock ? t('common.sampleMode') : t('common.liveAi')}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <div className="hidden w-72 shrink-0 border-r border-border bg-sidebar lg:block">{sidebar}</div>

        {/* Conversation column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={scrollRef} className="chat-scroll min-h-0 flex-1 overflow-y-auto">
            {!active ? (
              <EmptyState onPick={ask} />
            ) : (
              <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
                {active.turns.map((turn) =>
                  turn.role === 'user' ? (
                    <UserMessage key={turn.id} text={turn.text ?? ''} />
                  ) : (
                    <AssistantMessage
                      key={turn.id}
                      response={turn.response!}
                      language={turn.speechLanguage ?? lang}
                    />
                  ),
                )}
                {loading && <TypingIndicator />}
                {error && (
                  <div className="flex justify-start" role="alert">
                    <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
                      <p className="text-destructive">{error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 rounded-full"
                        onClick={() => ask(lastQuestion, lastDetectedLanguage)}
                      >
                        {t('chat.retry')}
                      </Button>
                    </div>
                  </div>
                )}
                {/* Follow-ups after the latest answer */}
                {!loading && !error && active.turns.length > 0 && (() => {
                  const last = active.turns[active.turns.length - 1];
                  const followUps = last.role === 'assistant' ? last.response?.followUps : undefined;
                  if (!followUps?.length) return null;
                  return (
                    <div className="flex flex-wrap gap-2 pl-1">
                      {followUps.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => ask(q)}
                          className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-xs transition-colors hover:border-accent hover:text-foreground"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  );
                })()}
                {active.turns.length === 0 && (
                  <div className="flex flex-wrap justify-center gap-2 pt-6">
                    {suggestedQuestions.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => ask(q)}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium shadow-xs hover:border-accent hover:bg-secondary"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <ChatInput
            onSend={ask}
            conversationId={activeId ?? undefined}
            documents={active?.documents ?? []}
            onUploadDocument={addDocument}
            onRemoveDocument={removeAttachedDocument}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
