/** Scheme guidance service — mock behind the future /api/schemes/guidance contract. */
import type { SchemeGuidanceRequest, SchemeGuidanceResponse } from '../types/api';
import { API_CONFIG, delay, post } from './client';
import { citations } from '../mock/data';

const GUIDANCE: Record<string, Omit<SchemeGuidanceResponse, 'heading'>> = {
  'crop-insurance': {
    requirements: [
      'The crop and area must be notified for the scheme in your state and season — official requirements are notified by the state before each season.',
      'Enrollment is typically required before the season’s cutoff date, through a bank, cooperative, CSC, or the PMFBY portal.',
      'For crop-loss reporting, the PMFBY portal lists the Krishi Rakshak Portal & Helpline (14447) as the official channel.',
    ],
    documents: [
      'Land records or sowing details (as notified for your area)',
      'Bank account details linked for enrollment/claims',
      'Identity document as required by the official enrollment channel',
    ],
    citations: [citations.pmfbyPortal, citations.pibAiAgriculture],
    limitation:
      'Based on the information provided, these are the relevant official requirements — this is not an eligibility decision. Only the notified state rules and the scheme’s official channels determine eligibility and claims.',
    nextStep: 'Confirm the current season’s notification for your state on the PMFBY portal or at your bank/PACS.',
  },
  pacs: {
    requirements: [
      'Membership of the PACS is generally required to use member services; conditions are set by the society’s registered by-laws.',
      'Loan and credit services follow the society’s lending rules and the state cooperative framework.',
      'The PACS computerization project is expanding digital services, but availability differs by society.',
    ],
    documents: [
      'Membership details at the PACS',
      'Identity and address proof (as your society requires)',
      'Land/crop details for crop-loan services',
    ],
    citations: [citations.pacsComputerization, citations.coopInitiatives],
    limitation:
      'Based on the information provided, these are the relevant official requirements — this is not an eligibility decision. Your society’s by-laws and state rules are the authoritative source.',
    nextStep: 'Ask your PACS secretary to confirm the by-law conditions and the documents required for your service.',
  },
  governance: {
    requirements: [
      'Membership, voting, and election conditions are defined by your society’s by-laws and the applicable state cooperative act.',
      'Multi-state societies are governed by the Multi-State Co-operative Societies Act, 2002 at the central level.',
      'Amendments and state rules can change conditions — always check the current version.',
    ],
    documents: ['Society registration details', 'Copy of registered by-laws', 'Membership records'],
    citations: [citations.mscsAct, citations.nationalCoopPolicy],
    limitation:
      'Based on the information provided, these are the relevant official requirements — this is not an eligibility decision or legal advice.',
    nextStep: 'Read the exact clause in your by-laws or the applicable act; the Registrar’s office can clarify jurisdiction.',
  },
};

const FALLBACK = GUIDANCE['pacs'];

export const schemeService = {
  async getGuidance(req: SchemeGuidanceRequest): Promise<SchemeGuidanceResponse> {
    if (!API_CONFIG.useMock) {
      return post<SchemeGuidanceRequest, SchemeGuidanceResponse>('/schemes/guidance', req);
    }
    await delay(API_CONFIG.mockDelayMs);
    const key = req.topic ?? 'pacs';
    const g = GUIDANCE[key] ?? FALLBACK;
    return { heading: `Official requirements — ${req.state ?? 'your state'}`, ...g };
  },
};
