/** Chat and speech transcription services behind the /api contract. */
import type { ChatDocument, ChatRequest, ChatResponse, LanguageCode } from '../types/api';
import { API_CONFIG, delay, post, postBlob, postForm, remove } from './client';
import { buildMockResponse } from '../mock/chatMock';

export interface AudioTranscript {
  text: string;
  language: string;
}

export function uploadDocument(file: File, conversationId: string): Promise<ChatDocument> {
  const form = new FormData();
  form.append('file', file);
  form.append('conversationId', conversationId);
  return postForm<ChatDocument>('/documents', form);
}

export function deleteDocument(documentId: string, conversationId: string): Promise<{ deleted: boolean }> {
  const query = new URLSearchParams({ conversation_id: conversationId });
  return remove<{ deleted: boolean }>(`/documents/${encodeURIComponent(documentId)}?${query}`);
}

export function deleteConversationDocuments(conversationId: string): Promise<{ deleted: number }> {
  return remove<{ deleted: number }>(`/conversations/${encodeURIComponent(conversationId)}/documents`);
}

export interface ChatService {
  sendMessage(req: ChatRequest): Promise<ChatResponse>;
}

export function transcribeAudio(audio: Blob): Promise<AudioTranscript> {
  const extension = audio.type.split('/')[1]?.split(';')[0] || 'webm';
  const form = new FormData();
  form.append('file', audio, `recording.${extension}`);
  return postForm<AudioTranscript>('/audio/transcriptions', form);
}

export function synthesizeSpeech(text: string, language: LanguageCode): Promise<Blob> {
  return postBlob('/audio/speech', { text, language });
}

export const mockChatService: ChatService = {
  async sendMessage(req) {
    await delay(API_CONFIG.mockDelayMs + Math.random() * 700);
    return buildMockResponse(req);
  },
};

export const httpChatService: ChatService = {
  sendMessage(req) {
    return post<ChatRequest, ChatResponse>('/chat', req);
  },
};

export const chatService: ChatService = {
  sendMessage(req) {
    if (req.detectedLanguage || req.documentIds?.length || !API_CONFIG.useMock) {
      return httpChatService.sendMessage(req);
    }
    return mockChatService.sendMessage(req);
  },
};
