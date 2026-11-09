"""Demo-only API content mirrored from the frontend mock data."""

SOURCES = [
    {
        "title": "Pradhan Mantri Fasal Bima Yojana - Official Portal",
        "authority": "Ministry of Agriculture & Farmers Welfare, Government of India",
        "section": "Krishi Rakshak Portal & Helpline (14447)",
        "date": "Accessed 8 October 2026",
        "lastChecked": "8 October 2026",
        "url": "https://pmfby.gov.in/",
    },
    {
        "title": "Artificial Intelligence (AI) Transforming Indian Agriculture",
        "authority": "Press Information Bureau, Government of India",
        "section": "Press release, 14 February 2026",
        "date": "14 February 2026",
        "lastChecked": "8 October 2026",
        "url": "https://www.pib.gov.in/",
    },
    {
        "title": "Guidelines on Computerization of PACS Project",
        "authority": "Ministry of Cooperation, Government of India",
        "section": "PACS Computerization",
        "date": "Accessed 8 October 2026",
        "lastChecked": "8 October 2026",
        "url": "https://www.cooperation.gov.in/en/guidelines-computerization-pacs-project",
    },
    {
        "title": "National Cooperation Policy 2025",
        "authority": "Ministry of Cooperation, Government of India",
        "section": "Policy document",
        "date": "July 2025",
        "lastChecked": "8 October 2026",
        "url": "https://www.cooperation.gov.in/",
    },
    {
        "title": "The Multi-State Co-operative Societies Act, 2002",
        "authority": "Legislative Department, Ministry of Law and Justice",
        "section": "India Code, Act 39 of 2002",
        "date": "2002 (as amended)",
        "lastChecked": "8 October 2026",
        "url": "https://www.indiacode.nic.in/bitstream/123456789/1914/1/aA2002-39.pdf",
    },
    {
        "title": "Initiatives of Ministry of Cooperation",
        "authority": "Ministry of Cooperation, Government of India",
        "section": "Initiatives overview",
        "date": "Accessed 8 October 2026",
        "lastChecked": "8 October 2026",
        "url": "https://cooperation.gov.in/en/initiatives-ministry-cooperation",
    },
    {
        "title": "National Council for Cooperative Training (NCCT)",
        "authority": "Ministry of Cooperation, Government of India",
        "section": "Institutional overview",
        "date": "Accessed 8 October 2026",
        "lastChecked": "8 October 2026",
        "url": "https://cooperation.gov.in/en/ncct",
    },
    {
        "title": "Financial literacy explainer (demonstration content)",
        "authority": "Sahakar Sahayak demo corpus - not an official publication",
        "section": "Plain-language explainer",
        "date": "Demo build, October 2026",
        "lastChecked": "8 October 2026",
    },
]

_PMFBY, _PIB, _PACS, _POLICY, _MSCS, _INITIATIVES, _NCCT, _DEMO = SOURCES

GRIEVANCE_ROUTES = [
    {
        "id": "pmfby-claim",
        "category": "Crop insurance claim or crop-loss report (PMFBY)",
        "recommendedStep": (
            "Report the loss through the official PMFBY channels first - the Krishi Rakshak "
            "Portal & Helpline (14447) listed on the PMFBY portal - keeping your policy details "
            "ready. Timelines and process can depend on your state, season, and insurer, so "
            "confirm the notified rules for your area."
        ),
        "requiredInfo": [
            "Policy or application number",
            "Crop, village, and survey/khasra details",
            "Date and nature of the loss",
            "Bank account linked to the policy (if asked by the official channel)",
        ],
        "officialChannel": "Krishi Rakshak Portal & Helpline - 14447 (via pmfby.gov.in)",
        "citations": [_PMFBY, _PIB],
    },
    {
        "id": "society-governance",
        "category": "Cooperative society governance (elections, meetings, records, by-laws)",
        "recommendedStep": (
            "Raise the matter in writing with your society's managing committee first, keeping "
            "a dated copy. If unresolved, the next official level is usually the Registrar of "
            "Cooperative Societies for your state - the exact route depends on your state's "
            "cooperative act and your society's registered by-laws."
        ),
        "requiredInfo": [
            "Society name and registration number",
            "Written complaint with dates and facts",
            "Copies of relevant by-law clauses or notices",
            "Your membership details",
        ],
        "officialChannel": (
            "Your society's managing committee -> District/State Registrar of Cooperative Societies"
        ),
        "citations": [_MSCS, _POLICY],
    },
    {
        "id": "pacs-service",
        "category": "PACS service issue (loan, savings, member services)",
        "recommendedStep": (
            "Approach the PACS secretary or branch staff with your member details and a written "
            "note of the issue. If it is not resolved, escalate to the district cooperative bank "
            "or the district cooperative registrar's office, whichever covers your society."
        ),
        "requiredInfo": [
            "Member/account details at the PACS",
            "Dates and description of the issue",
            "Any receipts, passbook entries, or acknowledgements",
        ],
        "officialChannel": (
            "PACS secretary -> District Central Cooperative Bank / District Registrar office"
        ),
        "citations": [_PACS, _INITIATIVES],
    },
    {
        "id": "fraud",
        "category": "Suspected financial fraud or cheating",
        "recommendedStep": (
            "Preserve all evidence (messages, receipts, account entries) and avoid further "
            "payments. Report through your bank's official channel and the national cybercrime "
            "reporting channel, and inform your cooperative in writing. This assistant cannot "
            "investigate or recover funds."
        ),
        "requiredInfo": [
            "Transaction details, dates, and amounts",
            "Screenshots or copies of communications",
            "Account or member identifiers involved",
        ],
        "officialChannel": (
            "Your bank's official grievance channel and the National Cybercrime Reporting Portal "
            "(cybercrime.gov.in) / Helpline 1930"
        ),
        "citations": [_DEMO],
    },
]

SCHEME_GUIDANCE = {
    "crop-insurance": {
        "requirements": [
            "The crop and area must be notified for the scheme in your state and season - official requirements are notified by the state before each season.",
            "Enrollment is typically required before the season's cutoff date, through a bank, cooperative, CSC, or the PMFBY portal.",
            "For crop-loss reporting, the PMFBY portal lists the Krishi Rakshak Portal & Helpline (14447) as the official channel.",
        ],
        "documents": [
            "Land records or sowing details (as notified for your area)",
            "Bank account details linked for enrollment/claims",
            "Identity document as required by the official enrollment channel",
        ],
        "citations": [_PMFBY, _PIB],
        "limitation": (
            "Based on the information provided, these are the relevant official requirements - "
            "this is not an eligibility decision. Only the notified state rules and the scheme's "
            "official channels determine eligibility and claims."
        ),
        "nextStep": (
            "Confirm the current season's notification for your state on the PMFBY portal or at "
            "your bank/PACS."
        ),
    },
    "pacs": {
        "requirements": [
            "Membership of the PACS is generally required to use member services; conditions are set by the society's registered by-laws.",
            "Loan and credit services follow the society's lending rules and the state cooperative framework.",
            "The PACS computerization project is expanding digital services, but availability differs by society.",
        ],
        "documents": [
            "Membership details at the PACS",
            "Identity and address proof (as your society requires)",
            "Land/crop details for crop-loan services",
        ],
        "citations": [_PACS, _INITIATIVES],
        "limitation": (
            "Based on the information provided, these are the relevant official requirements - "
            "this is not an eligibility decision. Your society's by-laws and state rules are the "
            "authoritative source."
        ),
        "nextStep": (
            "Ask your PACS secretary to confirm the by-law conditions and the documents required "
            "for your service."
        ),
    },
    "governance": {
        "requirements": [
            "Membership, voting, and election conditions are defined by your society's by-laws and the applicable state cooperative act.",
            "Multi-state societies are governed by the Multi-State Co-operative Societies Act, 2002 at the central level.",
            "Amendments and state rules can change conditions - always check the current version.",
        ],
        "documents": [
            "Society registration details",
            "Copy of registered by-laws",
            "Membership records",
        ],
        "citations": [_MSCS, _POLICY],
        "limitation": (
            "Based on the information provided, these are the relevant official requirements - "
            "this is not an eligibility decision or legal advice."
        ),
        "nextStep": (
            "Read the exact clause in your by-laws or the applicable act; the Registrar's office "
            "can clarify jurisdiction."
        ),
    },
}
