USER REQUIREMENT SPECIFICATION
(URS)

Project Name: Appraisal AI Automation

Version: 1.0

Date: January 19, 2026

Agency: Ulverstone Penguin Harcourts

1. EXECUTIVE SUMMARY

1.1 Purpose

The purpose of this project is to automate the property appraisal data entry process. Currently,
Personal Assistants (PAs) manually enter data from forms filled out by agents during property
visits. This project aims to deploy an AI-driven solution that captures, extracts, and logs this
data automatically, reducing manual workload and improving data consistency.

1.2 Scope Overview

The solution involves a custom Sales App with a conversational "ChatGPT-like" interface.
Agents will interact with this app to upload documents and (in Phase 2) record audio. The
system uses n8n for orchestration, Supabase for vector storage, and integrates with VaultRE as
the final system of record.

1.3 Key Objectives

● Reduce Manual Entry: Eliminate the need for the PA to manually type appraisal data.
Increase Speed: Provide near real-time extraction (<15s) of data from appraisal forms.
●
● Enhance Data Quality: Ensure >95% accuracy via AI extraction and a human-in-the-

loop validation step.

● Future-Proofing: Build a "Vector Brain" (Phase 2) to train the AI on agency best

practices.

2. STAKEHOLDERS

Role

Name/Title

Responsibilities

Project
Sponsor

Brad
(Principal)

Final approval, budget authority, VaultRE
access control.

Technical
Lead

Elijah

Architecture, development (React/n8n),
deployment.

Process
Owner

Nicole (PA)

Primary user of the validation interface; defines
data quality standards.

End Users

Agents

Use the Sales App to upload forms and record
visits.

3. SYSTEM ARCHITECTURE

3.1 High-Level Diagram

[User App] -> [n8n Workflow] -> [AI Extraction] -> [Validation UI] -> [VaultRE CRM]

3.2 Core Components

● Frontend: Custom Web App (Vite / React JS / Tailwind CSS) with SSO.
● Backend/Orchestration: n8n.
● Database: Supabase (Vector Store for audio transcripts & agent training data).
●

Integrations:

○ Zapier: Limited scope (PlaudPin ->Google Drive).
○ VaultRE: Final destination for property/appraisal data (via API).

4. FUNCTIONAL REQUIREMENTS (FR)

4.1 Module A: Sales App Interface (The "Chat")

● FR1.1 - Conversational UI: The system shall provide a chat-based interface where

agents can send messages and files naturally.

● FR1.2 - File Ingestion: Users shall be able to drag-and-drop or select images/PDFs

(Appraisal Forms) directly in the chat window.

● FR1.3 - Real-Time Feedback: The system shall acknowledge uploads immediately and

provide status updates (e.g., "Scanning document...").

4.2 Module B: Document Processing (Phase 1)

● FR2.1 - OCR Extraction: Upon file upload, the system shall use AI (Vision Model) to

extract defined fields (e.g., Owner Name, Address, Price Estimate). Note: Specific fields
pending sample data.

● FR2.2 - Data Validation View: The system shall present the extracted data to the user

in an editable form before submission.

● FR2.3 - Confidence Flagging: The system shall visually highlight fields with low AI

confidence (e.g., <80%) for mandatory human review.

● FR2.4 - VaultRE Sync: Upon user approval, the system shall create or update the

Property Appraisal record in VaultRE via API.

4.3 Module C: Audio Intelligence (Phase 2 - Plaud)

● FR3.1 - Audio Ingestion: The system shall detect new audio files/transcripts uploaded

to Google Drive from PlaudPin (via Zapier).

● FR3.2 - Vector Storage: The system shall process transcripts into vector embeddings

and store them in Supabase.

● FR3.3 - Coaching Output: The system should analyze the transcript against training

criteria and generate a brief performance summary for the agent.

5. NON-FUNCTIONAL REQUIREMENTS (NFR)

5.1 Performance

● NFR1 - Latency: Document processing and initial response in the Chat App must occur

within 15 seconds.

● NFR2 - Throughput: System must support simultaneous uploads from multiple agents

without failure.

5.2 Security & Access

● NFR3 - Authentication: Access to the Sales App must be secured via Single Sign-On

(SSO).

● NFR4 - Scope: System is single-tenant (Ulverstone Penguin Harcourts only).

5.3 Reliability

● NFR5 - Connectivity: The system requires an active internet connection (Online Only).
● NFR6 - Accuracy: AI extraction target is >95%; mechanism for human correction is

mandatory to ensure 100% database integrity.

6. CONSTRAINTS & ASSUMPTIONS

6.1 Technical Constraints

● Zapier Limitations: Due to the Free Plan, Zapier is limited to simple triggers (Plaud ->

Google Drive). Complex logic must be handled by n8n.

● VaultRE API: Project assumes successful validation of the "Create Appraisal" endpoint

using existing API keys.

● n8n: Must be maintained by the internal team (Elijah).

6.2 Assumptions

● Agents will adopt the "Chat" behavior versus filling out paper forms.
● Sample appraisal data will be provided by Brad/Nicole to train the field extraction logic.
● The system does not need to support offline caching in Phase 1.

7. ACCEPTANCE CRITERIA

7.1 User Acceptance Testing (UAT)

●
●
●
●
●
●

[ ] Agent can log in via SSO.
[ ] Agent can upload a sample handwritten form.
[ ] System correctly reads the handwriting and populates the form view.
[ ] User can correct a typo in the form view.
[ ] Clicking "Submit" successfully creates a record in VaultRE.
[ ] Plaud recording appears in Supabase (Phase 2 test).
