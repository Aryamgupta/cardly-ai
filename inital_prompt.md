Cardly — Technical Architecture & MVP Implementation Specification

You are building Cardly, an AI-powered digital business card and personal networking platform.

The frontend web application is the first client. A React Native mobile application will be built later.

The most important architectural requirement is:

The backend must remain client-agnostic. Both the current Next.js web application and the future React Native mobile application must be able to use the same backend services, authentication system, database, storage, and business logic.

Do not tightly couple business logic to React components or Next.js-specific UI code.

1. TECHNOLOGY STACK
Frontend

Use:

Next.js with App Router
TypeScript
React
Tailwind CSS
shadcn/ui or equivalent reusable component system
React Hook Form
Zod
TanStack Query where useful for server-state management

Use strict TypeScript.

Avoid unnecessary dependencies.

2. BACKEND PLATFORM

Use Supabase as the core backend platform.

Supabase services:

Supabase
├── Authentication
├── PostgreSQL Database
├── Storage
├── Row Level Security
└── Edge Functions

The application should use:

Next.js Web App
        ↓
Supabase Auth
Supabase Database
Supabase Storage
Supabase Edge Functions

The future React Native application should use the same backend:

Next.js Web App ───────┐
                       │
                       ▼
                  Supabase
                       ▲
                       │
React Native App ──────┘

Do not create a separate Express or FastAPI backend for the initial MVP unless absolutely necessary.

3. AUTHENTICATION

Use Supabase Auth.

Initial authentication requirements:

Email/password registration
Email/password login
Logout
Get current authenticated user
Protected application routes
Session persistence
Basic profile information

The authentication system must work with both:

Web
React Native Mobile

Do not create a custom authentication system.
Do not store passwords in the Cardly database.

Use Supabase Auth user IDs as the primary identity reference.

4. DATABASE

Use Supabase PostgreSQL.

The database must enforce user ownership using:

auth.uid()

and Row Level Security policies.

A user must only be able to:

SELECT their own cards
INSERT their own cards
UPDATE their own cards
DELETE their own cards

Never rely only on frontend checks for security.

Database-level security is mandatory.

5. DATABASE SCHEMA

Create a profiles table:

profiles
├── id UUID PRIMARY KEY
├── full_name TEXT
├── avatar_url TEXT
├── created_at TIMESTAMPTZ
└── updated_at TIMESTAMPTZ

The id should reference:

auth.users.id

Create a cards table.

Suggested structure:

cards
├── id UUID PRIMARY KEY
├── user_id UUID
├── full_name TEXT
├── designation TEXT
├── company_name TEXT
├── industry TEXT
├── phones JSONB
├── emails JSONB
├── website TEXT
├── address JSONB
├── social_links JSONB
├── tags TEXT[]
├── notes TEXT
├── original_image_path TEXT
├── detected_language TEXT
├── processing_status TEXT
├── ai_metadata JSONB
├── created_at TIMESTAMPTZ
└── updated_at TIMESTAMPTZ

Use:

user_id → auth.users.id

as the ownership relationship.

6. CARD PROCESSING STATUS

Use an explicit state machine.

Possible statuses:

uploaded
processing
ready_for_review
confirmed
failed

The core flow:

uploaded
    ↓
processing
    ↓
ready_for_review
    ↓
confirmed

If processing fails:

processing
    ↓
failed

The UI must reflect the actual state from the backend.

Do not simulate fake processing progress if real processing has already completed.

7. IMAGE STORAGE

Use Supabase Storage.

Create a private bucket for card images.

Example:

business-cards

Store images using a user-scoped path:

{user_id}/{card_id}/original.jpg

Example:

business-cards/
└── user-id/
    └── card-id/
        └── original.jpg

Do not store large image binary data directly inside PostgreSQL.

The database should store the storage path.

Use signed URLs when displaying private images.

8. BUSINESS CARD UPLOAD FLOW

Implement this flow:

User selects image
        ↓
Frontend validates file
        ↓
Image uploaded to Supabase Storage
        ↓
Card record created
        ↓
processing_status = uploaded
        ↓
AI processing begins
        ↓
processing_status = processing
        ↓
AI extracts structured data
        ↓
Database updated
        ↓
processing_status = ready_for_review
        ↓
Frontend displays review screen
        ↓
User confirms
        ↓
processing_status = confirmed

The frontend must support:

JPG
JPEG
PNG

Validate:

File type
File size
Image presence
9. AI PROCESSING ARCHITECTURE

The AI system must be abstracted.

Do not directly place AI API calls inside React components.

Create a service abstraction such as:

AIExtractionService

or:

CardProcessingService

Example architecture:

Supabase Edge Function
        ↓
CardProcessingService
        ↓
AI Vision Provider
        ↓
Structured JSON
        ↓
Zod Validation
        ↓
Database Update

The AI provider should be replaceable.

Do not hardcode the entire application to one specific AI vendor.

Use environment variables for AI credentials.

Never expose AI API keys to the browser.

10. AI EXTRACTION OUTPUT

The AI must return structured data.

Example:

{
  "person": {
    "name": "Rajesh Sharma",
    "designation": "Sales Manager"
  },
  "company": {
    "name": "ABC Technologies Pvt Ltd",
    "industry": null,
    "website": "https://example.com"
  },
  "phones": [
    {
      "number": "+919876543210",
      "type": "mobile"
    }
  ],
  "emails": [
    {
      "email": "rajesh@example.com",
      "type": "work"
    }
  ],
  "address": {
    "fullAddress": "Delhi, India",
    "city": "Delhi",
    "state": null,
    "country": "India",
    "postalCode": null
  },
  "socialLinks": {
    "linkedin": null,
    "instagram": null,
    "twitter": null
  },
  "detectedLanguage": "English"
}

The AI should understand:

English
Hindi
Hinglish
Indian regional languages
International languages

Do not require the user to manually select the language.

11. VALIDATION

AI output is untrusted external data.

Validate the output before saving.

Use Zod schemas.

Example conceptual structure:

AI Response
    ↓
Zod Schema Validation
    ↓
Valid
    ├── Save structured extraction
    │
    └── Invalid
          ↓
       Processing Failed

Do not blindly trust AI output.

The system should gracefully handle:

Missing fields
Null values
Unexpected AI responses
Invalid JSON
Incorrect data types
12. BACKEND BUSINESS LOGIC

Keep business logic separate from UI.

Recommended structure:

src/
├── app/
│   ├── (auth)/
│   └── (app)/
│
├── components/
│
├── features/
│   └── cards/
│       ├── components/
│       ├── hooks/
│       ├── schemas/
│       ├── types/
│       └── services/
│
├── lib/
│   ├── supabase/
│   ├── validation/
│   └── utils/
│
└── services/
    ├── cards/
    ├── storage/
    └── ai/

For example:

services/cards/createCard.ts
services/cards/getCards.ts
services/cards/updateCard.ts
services/cards/deleteCard.ts
services/ai/extractCardInformation.ts
services/storage/uploadCardImage.ts

The frontend should call service functions instead of embedding large database operations directly inside components.

13. SUPABASE CLIENT ARCHITECTURE

Create separate Supabase clients where necessary:

Browser Client
Server Client
Admin/Service Client

Never expose the Supabase service role key to the browser.

Use environment variables:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_API_KEY=

The service role key must only be available on the server.

14. API / CLIENT ABSTRACTION

Even though Supabase can be accessed directly from the web application, keep the application architecture ready for a future API layer.

For example:

UI
 ↓
Card Service
 ↓
Supabase

Future:

Web UI
    ↓
Card Service
    ↓
Cardly API
    ↓
Supabase

React Native:

React Native
    ↓
Cardly API
    ↓
Supabase

The goal is to avoid writing business logic directly into UI components.

15. FUTURE FASTAPI COMPATIBILITY

Do not implement FastAPI for the MVP.

However, the AI processing system should be designed so that it can later be replaced:

Current:

Supabase Edge Function
        ↓
AI Provider


Future:

Supabase Edge Function
        ↓
FastAPI AI Service
        ↓
OCR / ML / Vision Models

The rest of the application should not need to change.

The client should only care about:

processing_status

and structured card data.

16. SECURITY REQUIREMENTS

Implement:

Supabase Auth
Row Level Security
User ownership validation
Private image storage
Signed URLs
Server-only AI keys
Server-only service role key
Input validation
File validation
Secure error messages

A user must never be able to access another user's card or image.

17. MVP ROUTES

Create:

/
├── Landing Page
│
├── /login
├── /signup
│
└── /app
    ├── /dashboard
    ├── /cards
    ├── /cards/new
    ├── /cards/processing
    ├── /cards/review
    ├── /cards/[id]
    ├── /cards/[id]/edit
    └── /settings

Use route protection for /app/*.

18. CORE USER JOURNEY

The implementation must make this journey excellent:

Sign Up
   ↓
Dashboard
   ↓
Add Card
   ↓
Upload Image
   ↓
AI Processing
   ↓
Review AI Extraction
   ↓
Edit Information
   ↓
Save Contact
   ↓
Search Contact
   ↓
View Contact Profile

This is the MVP.

Do not let advanced future features distract from this workflow.

19. DO NOT BUILD YET

Do not implement:

Teams
Organizations
Billing
Subscriptions
CRM pipelines
AI chatbot
Vector database
Semantic search
Follow-up automation
Calendar integrations
WhatsApp integrations
Email automation
Mobile contact synchronization
Advanced analytics

The architecture should allow these features in the future, but they are outside the MVP scope.

20. DEVELOPMENT PROCESS

Implement the project incrementally.

Phase 1
Project setup
Supabase configuration
Authentication
Database schema
RLS policies
Application shell
Phase 2
Dashboard
Empty states
Card upload
Supabase Storage
Phase 3
AI processing service
Card extraction
Structured JSON validation
Processing states
Phase 4
Review extraction screen
Edit extracted data
Save contact
Phase 5
Contacts list
Search
Contact detail
Edit
Delete
Phase 6
Security review
Error handling
Responsive design
Loading states
Empty states
Production cleanup

After each phase:

Run the application.
Test the functionality.
Check TypeScript errors.
Check linting.
Verify database operations.
Verify authentication and RLS.
Fix issues before moving forward.
FINAL ENGINEERING PRINCIPLE

Build Cardly as:

A client-agnostic backend platform
        +
A modern Next.js web client
        +
An AI processing abstraction
        +
A future-ready React Native client

The current implementation should be simple enough to build quickly but structured enough that the future mobile app does not require rewriting the backend.

The core principle is:

The web application and future mobile application are clients of Cardly's backend platform — they are not the backend itself.

Build the MVP around:

Upload → AI Understands → Review → Confirm → Store → Search → Manage.
