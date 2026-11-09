/**
 * Frontend contracts for the future FastAPI backend.
 * These mirror the intended /api/* response shapes so that swapping
 * mock services for real HTTP calls requires no UI changes.
 */

export type LanguageCode =
  | 'en'
  | 'as'
  | 'bn'
  | 'brx'
  | 'doi'
  | 'gu'
  | 'hi'
  | 'kn'
  | 'ks'
  | 'kok'
  | 'mai'
  | 'ml'
  | 'mni'
  | 'mr'
  | 'ne'
  | 'or'
  | 'pa'
  | 'sa'
  | 'sat'
  | 'sd'
  | 'ta'
  | 'te'
  | 'ur';
export type UiLanguageCode = Extract<LanguageCode, 'en' | 'hi' | 'pa'>;

export interface SourceCitation {
  title: string;
  authority: string;
  section?: string;
  page?: number;
  date?: string;
  lastChecked?: string;
  url?: string;
}

export type AnswerKind = 'answer' | 'insufficient_evidence' | 'high_risk' | 'source_conflict';

export interface ChatRequest {
  message: string;
  language?: LanguageCode;
  detectedLanguage?: string;
  conversationId?: string;
  documentIds?: string[];
  history?: ChatHistoryMessage[];
}

export interface ChatDocument {
  id: string;
  filename: string;
  pageCount: number | null;
  chunkCount: number;
}

export interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  kind: AnswerKind;
  /** Plain-language explanation paragraphs. */
  answer: string[];
  /** Bullet-point detail shown under the answer. */
  points?: string[];
  citations: SourceCitation[];
  /** Safety limitation shown beneath the answer. */
  limitation?: string;
  /** Suggested next step for the user. */
  nextStep?: string;
  confidence?: number;
  needsEscalation?: boolean;
  /** Follow-up questions the user can tap. */
  followUps?: string[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  topic: TopicId;
  updatedAt: string;
}

export type TopicId =
  | 'governance'
  | 'crop-insurance'
  | 'pacs'
  | 'financial-literacy'
  | 'schemes'
  | 'legal'
  | 'grievance';

export interface Topic {
  id: TopicId;
  name: string;
  description: string;
  exampleQuestions: string[];
}

/* ---- Scheme guidance wizard ---- */

export interface SchemeContext {
  state?: string;
  topic?: TopicId;
  situation?: string;
}

export interface SchemeGuidanceRequest extends SchemeContext {
  language: LanguageCode;
}

export interface SchemeGuidanceResponse {
  heading: string;
  /** Officially published requirements, phrased non-definitively. */
  requirements: string[];
  /** Documents a user may be asked for, per official sources. */
  documents: string[];
  citations: SourceCitation[];
  limitation: string;
  nextStep: string;
}

/* ---- Grievance navigation ---- */

export interface GrievanceRoute {
  id: string;
  category: string;
  recommendedStep: string;
  requiredInfo: string[];
  officialChannel: string;
  citations: SourceCitation[];
}
