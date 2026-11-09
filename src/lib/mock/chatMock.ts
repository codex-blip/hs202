/**
 * Deterministic responder for sample mode.
 * Mimics the safety behavior described in the project report:
 * grounded answers, visible citations, abstention when evidence is
 * insufficient, and cautious handling of high-risk questions.
 */
import type { ChatRequest, ChatResponse } from '../types/api';
import { citations } from './data';

const norm = (s: string) => s.toLowerCase();

function pmfbyResponse(): ChatResponse {
  return {
    kind: 'answer',
    answer: [
      'If your crop has been damaged, the PMFBY official portal lists the Krishi Rakshak Portal & Helpline (14447) as the official channel for reporting crop loss and raising related complaints.',
      'Before reporting, keep your policy details, crop and village information, and the date and nature of the loss ready. The exact reporting window and process can depend on your state, the season, and your insurance company, so confirm the rules notified for your area.',
    ],
    points: [
      'Call the Krishi Rakshak Helpline: 14447',
      'Or use the crop-loss / grievance section on pmfby.gov.in',
      'Keep policy number, crop details, and loss date at hand',
    ],
    citations: [citations.pmfbyPortal, citations.pibAiAgriculture],
    limitation:
      'I cannot confirm whether your specific claim will be accepted, and reporting deadlines differ by state, season, and insurer. Please verify the notified timeline for your area through the official channel.',
    nextStep:
      'Note your policy details and call 14447 or visit the PMFBY portal today. If you’d like, I can list the information the official channel may ask for.',
    confidence: 0.9,
    followUps: [
      'What documents might I need for this service?',
      'Where do I complain about a crop insurance claim?',
    ],
  };
}

function pacsResponse(): ChatResponse {
  return {
    kind: 'answer',
    answer: [
      'Primary Agricultural Credit Societies (PACS) are the village-level tier of the cooperative credit structure. They typically provide members with short-term crop loans, savings and deposit services, and access to inputs or other member services — the exact services vary by society and state.',
      'The Ministry of Cooperation is running a Computerization of PACS project to connect PACS with higher cooperative banking tiers through a common ERP-based system. The ministry also publishes model by-laws and initiatives aimed at expanding what PACS can offer. Note that the project page describes the plan — it does not mean every society or service is already digitized.',
    ],
    points: [
      'Typical services: crop loans, savings/deposits, member services',
      'Services differ by society — confirm with your PACS secretary',
      'Computerization is ongoing; availability varies locally',
    ],
    citations: [citations.pacsComputerization, citations.coopInitiatives, citations.nationalCoopPolicy],
    limitation:
      'Service availability and procedures are set by your society’s by-laws and your state’s cooperative framework. I can describe the general picture, but your PACS office confirms what applies to you.',
    nextStep:
      'For a specific service, ask your PACS secretary which documents and member details they require — or tell me the service and I’ll list what official guidance typically asks for.',
    confidence: 0.86,
    followUps: ['What documents might I need for this service?', 'How is PACS computerization affecting members?'],
  };
}

function governanceResponse(): ChatResponse {
  return {
    kind: 'answer',
    answer: [
      'Cooperative governance rules come from several layers: your society’s registered by-laws, your state’s cooperative societies act and rules, and — for societies operating in more than one state — the Multi-State Co-operative Societies Act, 2002, a central statute.',
      'In plain terms: members generally have rights to attend meetings, vote, access certain records, and stand in elections, but the exact conditions (quorum, notice periods, eligibility) are defined by the by-laws and the applicable act. No single central act works as a universal code for every cooperative.',
    ],
    points: [
      'Start with your society’s registered by-laws',
      'Then the state cooperative act and rules',
      'MSCS Act 2002 applies to multi-state societies',
    ],
    citations: [citations.mscsAct, citations.nationalCoopPolicy],
    limitation:
      'Which source applies depends on your state and society type, and amendments happen over time. For a dispute or a binding interpretation, the Registrar of Cooperative Societies or a qualified legal professional is the right authority.',
    nextStep:
      'Tell me your state and the type of society, and I’ll point you to the relevant official source to read the exact clause.',
    confidence: 0.84,
    followUps: ['Which cooperative law applies in my state?', 'How do I raise a cooperative grievance?'],
  };
}

function financialLiteracyResponse(): ChatResponse {
  return {
    kind: 'answer',
    answer: [
      'Here is a plain-language explainer. Interest is the cost of borrowing money, usually shown as a yearly percentage of the amount borrowed. Simple interest grows only on the original amount; compound interest grows on the amount plus interest already added — so loans can become expensive faster than they first appear.',
      'Before borrowing, it helps to check the total amount you will repay (not just the monthly installment), any fees, and what happens if a payment is missed. Be cautious of anyone who asks for OTPs, PINs, or advance fees to “release” a loan — these are common fraud patterns.',
    ],
    points: [
      'Ask for the total repayment amount in writing',
      'Never share OTPs, PINs, or passwords',
      'Keep receipts and passbook entries updated',
    ],
    citations: [citations.sampleExplainer],
    limitation:
      'This is general educational information, not financial advice, and I never recommend a specific product or lender. For decisions about a specific loan, speak with your cooperative or bank directly.',
    nextStep: 'If you want, I can explain a specific term — for example “compound interest” or “KCC” — in simpler words.',
    confidence: 0.8,
    followUps: ['How can I protect myself from financial fraud?', 'What should I know before borrowing?'],
  };
}

function grievanceResponse(): ChatResponse {
  return {
    kind: 'answer',
    answer: [
      'The right grievance channel depends on what the complaint is about. For PMFBY crop-insurance issues, the official route listed on the PMFBY portal is the Krishi Rakshak Portal & Helpline (14447). For society-level issues such as elections, meetings, or records, the usual path is your society’s managing committee first, then the Registrar of Cooperative Societies for your state.',
      'Whichever route applies, a written, dated complaint with your membership or policy details and copies of relevant documents makes escalation much easier.',
    ],
    points: [
      'PMFBY issues → Krishi Rakshak Portal & Helpline (14447)',
      'Society governance → managing committee → state Registrar',
      'Keep a dated written copy of every complaint',
    ],
    citations: [citations.pmfbyPortal, citations.mscsAct],
    limitation:
      'Sahakar Sahayak does not receive, investigate, or decide complaints, and nothing here is submitted to any authority on your behalf. The Grievance page shows official channels in more detail.',
    nextStep: 'Open the Grievance & Support page to see the recommended channel, required documents, and official contact for your situation.',
    needsEscalation: false,
    confidence: 0.85,
    followUps: ['Where do I complain about a crop insurance claim?'],
  };
}

function insufficientEvidence(): ChatResponse {
  return {
    kind: 'insufficient_evidence',
    answer: [
      'I couldn’t find enough verified information in my approved sources to answer this reliably. Rather than guess, I’d prefer to say so plainly.',
      'You could rephrase the question with your state or the scheme/service name, or try one of the topic areas I cover — cooperative governance, PACS services, crop insurance (PMFBY), financial literacy, schemes, and grievance navigation.',
    ],
    citations: [],
    limitation:
      'This sample response is based on a small example knowledge base and may not cover your question. Verify important information with the responsible authority.',
    nextStep: 'Try one of the suggested topics, or visit the Grievance & Support page to find an official channel directly.',
    confidence: 0,
  };
}

function highRisk(): ChatResponse {
  return {
    kind: 'high_risk',
    answer: [
      'This question may require case-specific legal or official guidance. I can’t decide disputes, interpret how the law applies to a particular case, or act as a lawyer, insurer, registrar, or grievance authority.',
      'What I can do is help you find the relevant official source or escalation channel, and help you prepare the information an official office is likely to ask for.',
    ],
    citations: [citations.mscsAct],
    limitation:
      'For anything that affects your legal rights, money, or a live dispute, please rely on the responsible authority or a qualified legal professional — not a chatbot.',
    nextStep: 'Tell me the topic and your state, and I’ll point you to the official source — or use the Grievance & Support page to find the right channel.',
    needsEscalation: true,
    confidence: 0,
  };
}

function sourceConflict(): ChatResponse {
  return {
    kind: 'source_conflict',
    answer: [
      'The approved sources I can see appear to conflict on this point — for example, an older circular and a newer guideline may say different things. When sources conflict, the safer move is to verify rather than pick one.',
      'I’ve shown the conflicting sources below. The newer, currently effective document from the issuing authority for your jurisdiction should normally take precedence, but a human content steward or the issuing office should confirm.',
    ],
    citations: [citations.pmfbyPortal, citations.pibAiAgriculture],
    limitation:
      'Source-conflict answers are always flagged for human review in this project’s design, and stale documents are withdrawn from live answering until checked.',
    nextStep: 'Verify against the issuing authority’s current page, or ask at your cooperative/PACS office before acting.',
    confidence: 0.4,
  };
}

export function buildMockResponse(req: ChatRequest): ChatResponse {
  const m = norm(req.message);

  if (/(conflict|contradict|two sources|sources say different)/.test(m)) return sourceConflict();
  if (/(sue|court|legal notice|file a case|my case|dispute with|cheated me|fraud against me|police)/.test(m)) return highRisk();
  if (/(pmfby|crop loss|crop damage|fasal|bima|insurance|krishi rakshak|14447|weather.?based)/.test(m)) return pmfbyResponse();
  if (/(pacs|primary agricultural|computerization|erp|society services|services are available|documents might)/.test(m)) return pacsResponse();
  if (/(by-?law|governance|election|meeting|member right|multi-state|mscs|cooperative rule|rule in simple|quorum)/.test(m)) return governanceResponse();
  if (/(interest|loan|borrow|saving|fraud|otp|financial|repay|emi|kcc|deposit)/.test(m)) return financialLiteracyResponse();
  if (/(grievance|complain|complaint|escalat|report.*issue|raise)/.test(m)) return grievanceResponse();

  return insufficientEvidence();
}
