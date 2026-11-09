/**
 * Sample content only.
 * Every record here stands in for a future, human-reviewed official
 * knowledge base. Citations reference real public sources named in the
 * project report; none of this is live government data.
 */
import type { GrievanceRoute, SourceCitation, Topic } from '../types/api';

export const LAST_CHECKED = '8 October 2026';

export const citations = {
  pmfbyPortal: {
    title: 'Pradhan Mantri Fasal Bima Yojana — Official Portal',
    authority: 'Ministry of Agriculture & Farmers Welfare, Government of India',
    section: 'Krishi Rakshak Portal & Helpline (14447)',
    date: 'Accessed 8 October 2026',
    lastChecked: LAST_CHECKED,
    url: 'https://pmfby.gov.in/',
  },
  pibAiAgriculture: {
    title: 'Artificial Intelligence (AI) Transforming Indian Agriculture',
    authority: 'Press Information Bureau, Government of India',
    section: 'Press release, 14 February 2026',
    date: '14 February 2026',
    lastChecked: LAST_CHECKED,
    url: 'https://www.pib.gov.in/',
  },
  pacsComputerization: {
    title: 'Guidelines on Computerization of PACS Project',
    authority: 'Ministry of Cooperation, Government of India',
    section: 'PACS Computerization',
    date: 'Accessed 8 October 2026',
    lastChecked: LAST_CHECKED,
    url: 'https://www.cooperation.gov.in/en/guidelines-computerization-pacs-project',
  },
  nationalCoopPolicy: {
    title: 'National Cooperation Policy 2025',
    authority: 'Ministry of Cooperation, Government of India',
    section: 'Policy document',
    date: 'July 2025',
    lastChecked: LAST_CHECKED,
    url: 'https://www.cooperation.gov.in/',
  },
  mscsAct: {
    title: 'The Multi-State Co-operative Societies Act, 2002',
    authority: 'Legislative Department, Ministry of Law and Justice',
    section: 'India Code, Act 39 of 2002',
    date: '2002 (as amended)',
    lastChecked: LAST_CHECKED,
    url: 'https://www.indiacode.nic.in/bitstream/123456789/1914/1/aA2002-39.pdf',
  },
  coopInitiatives: {
    title: 'Initiatives of Ministry of Cooperation',
    authority: 'Ministry of Cooperation, Government of India',
    section: 'Initiatives overview',
    date: 'Accessed 8 October 2026',
    lastChecked: LAST_CHECKED,
    url: 'https://cooperation.gov.in/en/initiatives-ministry-cooperation',
  },
  ncct: {
    title: 'National Council for Cooperative Training (NCCT)',
    authority: 'Ministry of Cooperation, Government of India',
    section: 'Institutional overview',
    date: 'Accessed 8 October 2026',
    lastChecked: LAST_CHECKED,
    url: 'https://cooperation.gov.in/en/ncct',
  },
  sampleExplainer: {
    title: 'Financial literacy explainer (sample content)',
    authority: 'Sahakar Sahayak sample content — not an official publication',
    section: 'Plain-language explainer',
    date: 'Example record',
    lastChecked: LAST_CHECKED,
  },
} satisfies Record<string, SourceCitation>;

export const topics: Topic[] = [
  {
    id: 'governance',
    name: 'Cooperative Governance',
    description:
      'Membership, meetings, elections, records, and by-laws — explained in plain language, with the exact clause and jurisdiction shown.',
    exampleQuestions: [
      'What rights do members have in a cooperative society?',
      'Explain this cooperative rule in simple language.',
      'Which law applies to a multi-state cooperative?',
    ],
  },
  {
    id: 'crop-insurance',
    name: 'Crop Insurance',
    description:
      'Navigate PMFBY crop-loss reporting, official portals, and helplines — with season- and state-specific context flagged clearly.',
    exampleQuestions: [
      'How can I report crop loss under PMFBY?',
      'Where do I check my crop insurance status?',
      'What is the Krishi Rakshak helpline?',
    ],
  },
  {
    id: 'pacs',
    name: 'PACS & Cooperative Services',
    description:
      'What Primary Agricultural Credit Societies typically offer, how computerization is changing services, and where to ask locally.',
    exampleQuestions: [
      'What services are available through PACS?',
      'What documents might I need for this service?',
      'How is PACS computerization affecting members?',
    ],
  },
  {
    id: 'financial-literacy',
    name: 'Financial Literacy',
    description:
      'Plain-language explainers on savings, borrowing, interest, repayment, and avoiding fraud — never a product recommendation.',
    exampleQuestions: [
      'How does loan interest work?',
      'How can I protect myself from financial fraud?',
      'What should I know before borrowing?',
    ],
  },
  {
    id: 'schemes',
    name: 'Government Schemes',
    description:
      'Guided discovery of relevant official requirements for cooperative and agricultural schemes — without pretending to decide eligibility.',
    exampleQuestions: [
      'Which cooperative schemes might apply to me?',
      'What are the official requirements for this scheme?',
    ],
  },
  {
    id: 'legal',
    name: 'Legal Information',
    description:
      'Understand which act, rule, or by-law applies — central vs. state — with case-specific disputes always referred to qualified help.',
    exampleQuestions: [
      'Which cooperative law applies in my state?',
      'Where can I read the exact by-law clause?',
    ],
  },
  {
    id: 'grievance',
    name: 'Grievances & Support',
    description:
      'Find the correct official channel for a complaint, what information it asks for, and how escalation actually works.',
    exampleQuestions: [
      'How do I raise a cooperative grievance?',
      'Where do I complain about a crop insurance claim?',
    ],
  },
];

export const suggestedQuestions = [
  'What services are available through PACS?',
  'How can I report crop loss under PMFBY?',
  'Explain this cooperative rule in simple language.',
  'How do I raise a cooperative grievance?',
  'What documents might I need for this service?',
];

export const indianStates = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Other / Union Territory',
];

export const grievanceRoutes: GrievanceRoute[] = [
  {
    id: 'pmfby-claim',
    category: 'Crop insurance claim or crop-loss report (PMFBY)',
    recommendedStep:
      'Report the loss through the official PMFBY channels first — the Krishi Rakshak Portal & Helpline (14447) listed on the PMFBY portal — keeping your policy details ready. Timelines and process can depend on your state, season, and insurer, so confirm the notified rules for your area.',
    requiredInfo: [
      'Policy or application number',
      'Crop, village, and survey/khasra details',
      'Date and nature of the loss',
      'Bank account linked to the policy (if asked by the official channel)',
    ],
    officialChannel: 'Krishi Rakshak Portal & Helpline — 14447 (via pmfby.gov.in)',
    citations: [citations.pmfbyPortal, citations.pibAiAgriculture],
  },
  {
    id: 'society-governance',
    category: 'Cooperative society governance (elections, meetings, records, by-laws)',
    recommendedStep:
      'Raise the matter in writing with your society’s managing committee first, keeping a dated copy. If unresolved, the next official level is usually the Registrar of Cooperative Societies for your state — the exact route depends on your state’s cooperative act and your society’s registered by-laws.',
    requiredInfo: [
      'Society name and registration number',
      'Written complaint with dates and facts',
      'Copies of relevant by-law clauses or notices',
      'Your membership details',
    ],
    officialChannel: 'Your society’s managing committee → District/State Registrar of Cooperative Societies',
    citations: [citations.mscsAct, citations.nationalCoopPolicy],
  },
  {
    id: 'pacs-service',
    category: 'PACS service issue (loan, savings, member services)',
    recommendedStep:
      'Approach the PACS secretary or branch staff with your member details and a written note of the issue. If it is not resolved, escalate to the district cooperative bank or the district cooperative registrar’s office, whichever covers your society.',
    requiredInfo: [
      'Member/account details at the PACS',
      'Dates and description of the issue',
      'Any receipts, passbook entries, or acknowledgements',
    ],
    officialChannel: 'PACS secretary → District Central Cooperative Bank / District Registrar office',
    citations: [citations.pacsComputerization, citations.coopInitiatives],
  },
  {
    id: 'fraud',
    category: 'Suspected financial fraud or cheating',
    recommendedStep:
      'Preserve all evidence (messages, receipts, account entries) and avoid further payments. Report through your bank’s official channel and the national cybercrime reporting channel, and inform your cooperative in writing. This assistant cannot investigate or recover funds.',
    requiredInfo: [
      'Transaction details, dates, and amounts',
      'Screenshots or copies of communications',
      'Account or member identifiers involved',
    ],
    officialChannel: 'Your bank’s official grievance channel and the National Cybercrime Reporting Portal (cybercrime.gov.in) / Helpline 1930',
    citations: [citations.sampleExplainer],
  },
];
