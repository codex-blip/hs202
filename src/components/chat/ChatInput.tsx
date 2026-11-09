import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { FileText, Mic, Paperclip, SendHorizonal, Square, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { transcribeAudio } from '@/lib/api/chat';
import { ApiError } from '@/lib/api/client';
import { useLanguage } from '@/lib/i18n';
import type { ChatDocument } from '@/lib/types/api';
import { toast } from 'sonner';

export function ChatInput({
  onSend,
  conversationId,
  documents,
  onUploadDocument,
  onRemoveDocument,
  disabled,
}: {
  onSend: (text: string, detectedLanguage?: string) => void;
  conversationId?: string;
  documents: ChatDocument[];
  onUploadDocument: (file: File) => Promise<void>;
  onRemoveDocument: (documentId: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const { t } = useLanguage();
  const ref = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (recorderRef.current) {
        recorderRef.current.onstop = null;
        if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
      }
      if (recordingTimeoutRef.current !== null) {
        window.clearTimeout(recordingTimeoutRef.current);
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text, detectedLanguage);
    setValue('');
    setDetectedLanguage(undefined);
    ref.current?.focus();
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      toast.error(t('chat.mic.unsupported'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'].find(
        (type) => MediaRecorder.isTypeSupported(type),
      );
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        if (recordingTimeoutRef.current !== null) {
          window.clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);

        const audio = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        if (!audio.size) {
          toast.error(t('chat.mic.empty'));
          return;
        }

        setTranscribing(true);
        void transcribeAudio(audio)
          .then((transcript) => {
            setValue(transcript.text);
            setDetectedLanguage(transcript.language);
            ref.current?.focus();
          })
          .catch((error: unknown) => {
            toast.error(error instanceof ApiError ? error.message : t('chat.mic.error'));
          })
          .finally(() => setTranscribing(false));
      };
      recorder.onerror = () => {
        recorder.onstop = null;
        if (recordingTimeoutRef.current !== null) {
          window.clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);
        toast.error(t('chat.mic.error'));
      };
      recorder.start();
      setRecording(true);
      recordingTimeoutRef.current = window.setTimeout(() => {
        if (recorder.state !== 'inactive') {
          toast.info(t('chat.mic.maxDuration'));
          recorder.stop();
        }
      }, 30_000);
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      recorderRef.current = null;
      toast.error(t('chat.mic.permission'));
    }
  };

  const toggleRecording = () => {
    if (recording) {
      recorderRef.current?.stop();
    } else {
      void startRecording();
    }
  };

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      await onUploadDocument(file);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t('chat.document.error'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    try {
      await onRemoveDocument(documentId);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t('chat.document.error'));
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-border bg-background/95 p-3 backdrop-blur-sm sm:p-4">
      {documents.length > 0 && (
        <div className="mx-auto mb-2 flex max-w-3xl flex-wrap gap-2" aria-label={t('chat.document.attached')}>
          {documents.map((document) => (
            <div
              key={document.id}
              className="flex max-w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-1.5 text-xs"
            >
              <FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span className="max-w-56 truncate" title={document.filename}>{document.filename}</span>
              <button
                type="button"
                onClick={() => void handleRemoveDocument(document.id)}
                disabled={uploading}
                aria-label={`${t('chat.document.remove')} ${document.filename}`}
                className="rounded-full p-1 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <div className="flex-1 rounded-2xl border border-input bg-card px-4 py-2.5 shadow-xs focus-within:ring-2 focus-within:ring-ring">
          <label htmlFor="chat-input" className="sr-only">
            {t('chat.input.placeholder')}
          </label>
          <textarea
            id="chat-input"
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('chat.input.placeholder')}
            rows={Math.min(4, Math.max(1, value.split('\n').length))}
            className="max-h-32 w-full resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          aria-label={t('chat.document.add')}
          onChange={(event) => void handleFileSelected(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full"
          aria-label={uploading ? t('chat.document.uploading') : t('chat.document.add')}
          title={uploading ? t('chat.document.uploading') : t('chat.document.add')}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || recording || transcribing || uploading || (!!conversationId && documents.length >= 5)}
        >
          <Paperclip className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={`h-11 w-11 shrink-0 rounded-full ${recording ? 'border-destructive text-destructive' : ''}`}
          aria-label={recording ? t('chat.mic.stop') : t('chat.mic')}
          title={recording ? t('chat.mic.stop') : t('chat.mic')}
          onClick={toggleRecording}
          disabled={disabled || transcribing}
        >
          {recording ? (
            <Square className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Mic className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
        <Button
          type="button"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={submit}
          disabled={disabled || recording || transcribing || uploading || !value.trim()}
          aria-label={t('chat.send')}
        >
          <SendHorizonal className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
      {(recording || transcribing) && (
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground" role="status">
          {recording ? t('chat.mic.recording') : t('chat.mic.transcribing')}
        </p>
      )}
      {uploading && (
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-muted-foreground" role="status">
          {t('chat.document.uploading')}
        </p>
      )}
      {(documents.length > 0 || uploading) && (
        <p className="mx-auto mt-1 max-w-3xl text-center text-[11px] text-muted-foreground">
          {t('chat.document.privacy')}
        </p>
      )}
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground">{t('chat.disclaimer')}</p>
      <p className="mx-auto mt-1 max-w-3xl text-center text-[11px] text-muted-foreground">
        {t('chat.mic.privacy')}
      </p>
    </div>
  );
}
