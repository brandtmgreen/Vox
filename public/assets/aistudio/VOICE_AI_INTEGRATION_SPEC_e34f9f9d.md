# 🌲 GreenTree Arboriculture Management
## Voice-to-Text & Call/Voicemail AI Integration Specification

> **Version:** 1.0.0  
> **Target Application:** GreenTree Arboriculture Management CRM & Operations Hub  
> **Brand Mascot & AI Assistant:** Arb-E 🐒  
> **Document Purpose:** Complete technical and branding blueprint for the external Voice AI Agent to seamlessly ingest phone calls, voicemails, transcripts, customer details, and hazard assessments into GreenTree's CRM, Firestore, and live operations dispatch.

---

## Table of Contents
1. [Brand Identity, Tone & Assets](#1-brand-identity-tone--assets)
   - [Brand Persona: Arb-E](#brand-persona-arb-e-)
   - [Official Color Palette](#official-color-palette)
   - [Logo & Typography Specs](#logo--typography-specs)
   - [Embedded Vector Logos (SVG)](#embedded-vector-logos-svg)
   - [Audio Cues & Earcon](#audio-cues--earcon)
2. [Voice AI Persona & Caller Dialogue Guidelines](#2-voice-ai-persona--caller-dialogue-guidelines)
   - [Inbound Call Greetings & IVR](#inbound-call-greetings--ivr)
   - [Voicemail Greeting & Instructions](#voicemail-greeting--instructions)
   - [Emergency Tree Damage Triage](#emergency-tree-damage-triage)
3. [Arboricultural Domain Extraction Architecture](#3-arboricultural-domain-extraction-architecture)
   - [Required Extraction Entities](#required-extraction-entities)
   - [Arborist Hazard Classification (ANSI Z133)](#arborist-hazard-classification-ansi-z133)
   - [LLM Extraction System Prompt](#llm-extraction-system-prompt)
4. [CRM Data Models & Schema Contracts](#4-crm-data-models--schema-contracts)
   - [Core `Lead` Model](#core-lead-model)
   - [Core `Contact` Model](#core-contact-model)
   - [Core `Activity` Log](#core-activity-log)
   - [Voice Lead Ingestion Payload (`VoiceLeadIntakePayload`)](#voice-lead-ingestion-payload-voiceleadingestionpayload)
5. [API Specifications & Ingestion Endpoints](#5-api-specifications--ingestion-endpoints)
   - [Endpoint: `POST /api/leads/voice-intake`](#endpoint-post-apileadsvoice-intake)
   - [Endpoint: `POST /api/ai/transcribe`](#endpoint-post-apiaitranscribe)
   - [Authentication & Security](#authentication--security)
   - [Contact Deduplication & Merging Logic](#contact-deduplication--merging-logic)
6. [Real-Time Dispatch Integration](#6-real-time-dispatch-integration)
   - [Socket.IO Events](#socketio-events)
   - [Direct Firestore Ingestion](#direct-firestore-ingestion)
7. [Testing & Verification Guide](#7-testing--verification-guide)
   - [Sample `curl` Payloads](#sample-curl-payloads)
   - [Integration Checklist](#integration-checklist)

---

## 1. Brand Identity, Tone & Assets

### Brand Persona: Arb-E 🐒
GreenTree Arboriculture is powered by **Arb-E** — our energetic, witty, safety-obsessed monkey arborist mascot.
- **Energy:** Playful, helpful, sharp, and community-first.
- **Voice / Tone:** Warm Southern hospitality combined with ISA (International Society of Arboriculture) certified expertise.
- **Puns:** Appropriate tree and monkey wordplay are encouraged (e.g., *"going out on a limb for you"*, *"thanks a bunch"*, *"branching out"*, *"rooted in our community"*), but always maintain professional clarity when safety, pricing, or emergency hazards are discussed.
- **Philosophy:** Rooted in the **Pay It Forward** community foundation — neighbor-helping-neighbor, tree preservation before unnecessary removal, and gamified charity (Karma Wheel).

### Official Color Palette

| Name | Hex Code | Tailwind Token | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **Gecko Green** | `#5FA136` | `bg-gecko`, `text-gecko` | Primary brand accent, active states, badges, CTA highlights |
| **Palm Green** | `#376E20` | `bg-palm`, `text-palm` | Deep canopy headers, primary buttons, hero surfaces |
| **Bark Brown** | `#4D2809` | `bg-bark`, `text-bark` | Primary typography, dark headers, tree trunk grounding |
| **Leaf Green** | `#A8D672` | `bg-leaf`, `text-leaf` | Soft backgrounds, badges, hover accents, success indicators |
| **Gold** | `#D4AF37` | `bg-gold`, `text-gold` | Star ratings, certified arborist badges, Karma points |
| **Cream / Stone** | `#F9FAF6` | `bg-stone-50` | Soft surface background, cards, invoice backgrounds |

### Logo & Typography Specs
- **Font Stack:** Clean modern Sans-serif (`Inter`, `system-ui`, `-apple-system`, `sans-serif`).
- **Brand Title:** `GREENTREE` (Uppercase, Heavy / Black weight `font-black`, tight letter spacing).
- **Sub-Brand / Category:** `ARBORICULTURE` (Uppercase, Bold `font-bold`, wide tracking `tracking-widest`, Gecko Green `#5FA136`).
- **Primary Bitmap Asset Path:** `/GREENTREE-01.png` (Stored in root `public/` folder).

### Embedded Vector Logos (SVG)

#### A. GreenTree Modern Canopy Icon (Standard 24x24 / Scaleable)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#5FA136" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10" stroke="#376E20" stroke-width="1.5" fill="#5FA136" fill-opacity="0.1"/>
  <path d="M12 18V12M12 12C12 12 15 10 16 8M12 12C12 12 9 10 8 8" stroke="#4D2809" stroke-width="2"/>
  <circle cx="12" cy="7" r="3.5" fill="#5FA136"/>
  <circle cx="8" cy="9" r="2.5" fill="#A8D672"/>
  <circle cx="16" cy="9" r="2.5" fill="#376E20"/>
</svg>
```

#### B. Full GreenTree Brand Badge with Typography (SVG)
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" fill="none">
  <!-- Rounded Brand Shield -->
  <rect x="4" y="4" width="72" height="72" rx="18" fill="#376E20" />
  
  <!-- Tree & Canopy Graphic -->
  <circle cx="40" cy="34" r="18" fill="#5FA136" />
  <circle cx="28" cy="38" r="12" fill="#A8D672" />
  <circle cx="52" cy="38" r="12" fill="#5FA136" />
  <path d="M40 56 V36 M40 44 L48 36 M40 44 L32 36" stroke="#4D2809" stroke-width="4" stroke-linecap="round"/>
  
  <!-- Arb-E Monkey Ear Peek (Playful Brand Detail) -->
  <circle cx="23" cy="23" r="5" fill="#D4AF37" stroke="#4D2809" stroke-width="1.5"/>

  <!-- Typography -->
  <text x="92" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#4D2809" letter-spacing="-0.5">GREENTREE</text>
  <text x="94" y="56" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#5FA136" letter-spacing="4">ARBORICULTURE</text>
  <text x="94" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="600" fill="#A8D672">OPERATIONS &amp; CRM NETWORK</text>
</svg>
```

### Audio Cues & Earcon
When an incoming call is recognized or a new voice lead is ingested into the dashboard, GreenTree triggers a friendly two-tone arborist chime:
- **Tone 1:** D5 (587.33 Hz), duration 120ms
- **Tone 2:** A5 (880.00 Hz), duration 480ms exponential decay
- Use this chime in interactive telephony / browser voice clients to signal successful capture!

---

## 2. Voice AI Persona & Caller Dialogue Guidelines

If your voice agent speaks directly with callers (via Twilio, LiveKit, Vapi, ElevenLabs, or WebRTC), use the following dialogue templates:

### Inbound Call Greetings & IVR
> *"Thanks for calling GreenTree Arboriculture! This is Arb-E 🐒, your certified virtual tree assistant. Whether you need a hazardous pine pruned back, storm cleanup, or a tree health assessment, we're ready to branch out for you! May I grab your name and the service address for the trees?"*

### Voicemail Greeting & Instructions
> *"You’ve reached GreenTree Arboriculture. We're currently aloft in the canopy or assisting a neighbor on site! Please leave your name, phone number, property address, and a brief description of the tree work needed — especially if there are power lines or buildings close by. Arb-E will log your request directly with our dispatch team right away. Have a tree-mendous day!"*

### Emergency Tree Damage Triage
When keywords like *fallen*, *storm*, *power lines*, *cracked*, *roof*, *leaning towards house*, or *sparks* are detected:
1. **Immediate Safety Warning:**
   > *"If any tree limb is touching or near active utility wires, please stand clear by at least 35 feet and contact Georgia Power / Alabama Power immediately."*
2. **Flag Urgency:** Set `urgency: 'Emergency'` and `serviceType: 'Emergency'`.
3. **Dispatch Tag:** Automatically tag `hazards.overhead = true`.

---

## 3. Arboricultural Domain Extraction Architecture

When receiving audio from a phone call or voicemail, the voice agent must transcribe and parse unstructured speech into arborist-grade structured data.

### Required Extraction Entities

| Field | Description & Requirements | Example Extracted Values |
| :--- | :--- | :--- |
| `clientName` | Full name of caller or property owner | `"Martha Jenkins"`, `"Robert Chen"` |
| `phone` | Normalized phone number (E.164 preferred) | `"+17065550192"` or `"(706) 555-0192"` |
| `email` | Customer email if spoken | `"martha.jenkins@gmail.com"` |
| `address` | Service street address, city, state, zip | `"2844 Cherokee Ave, Columbus, GA 31906"` |
| `serviceType` | Standard GreenTree category: `Removal`, `Pruning`, `Plant Health`, `Emergency`, `Consulting` | `"Removal"` |
| `urgency` | Priority: `Emergency`, `High`, `Medium`, `Low` | `"High"` |
| `treeSpecies` | Array of species identified in call | `["Loblolly Pine", "Water Oak", "Crepe Myrtle"]` |
| `treeCount` | Approximate number of trees discussed | `2` |
| `hazards` | Specific site hazards extracted | Power lines, fence, swimming pool, septic tank, steep slope |
| `petAlerts` | Animal or dog alerts mentioned | `"Beware of two German Shepherds in fenced yard"` |
| `accessNotes` | Driveway, gate width, bucket truck access | `"Backyard only accessible through 36-inch walk gate"` |
| `summary` | Concise 2-3 sentence arborist brief | `"Customer has a 60ft dead pine leaning toward west bedroom roof..."` |

### Arborist Hazard Classification (ANSI Z133)
Extract boolean hazard tags to populate GreenTree's Job Safety & Hazard Assessment (JSHA):
- `overhead`: Overhead electrical wires, communication cables.
- `underground`: Irrigation, septic lines, gas lines mentioned.
- `traffic`: Tree overhangs street, lane closure or flagging required.
- `structures`: House, shed, carport, fence within fall zone.
- `steepTerrain`: Hillside, ravine, soft ground where heavy machinery cannot tread.

### LLM Extraction System Prompt
Use this exact system prompt with Gemini or OpenAI to structure transcription text:

```text
You are the ArborLink Voice Intelligence Parser for GreenTree Arboriculture (Columbus, GA / Phenix City, AL).
Analyze the following phone call audio transcript or voicemail. Extract the customer information, tree service requirements, and safety hazards into strict JSON.

Follow these rules:
1. Normalize phone numbers to (XXX) XXX-XXXX or +1XXXXXXXXXX.
2. If service address is missing but city is mentioned, populate city and state.
3. Classify serviceType into strictly one of: "Removal", "Pruning", "Plant Health", "Emergency", "Consulting".
4. Classify urgency into strictly one of: "Emergency", "High", "Medium", "Low".
5. Detect arborist-specific hazards according to ANSI Z133 guidelines:
   - overhead wires
   - proximity to houses or roofs
   - tree species (Pines, Oaks, Pecans, Sweetgums, Magnolias)
   - defects (hollow, rot, uprooted, storm damaged, fungal conks)
   - access limitations (narrow gate, septic tank, soft turf)
6. Extract pet warnings or gate codes into special instructions.

Respond strictly with a JSON object adhering to this schema:
{
  "clientName": string,
  "phone": string,
  "email": string | null,
  "address": string,
  "serviceType": "Removal" | "Pruning" | "Plant Health" | "Emergency" | "Consulting",
  "urgency": "Emergency" | "High" | "Medium" | "Low",
  "treeSpecies": string[],
  "treeCount": number,
  "scopeOfWork": string,
  "hazards": {
    "overhead": boolean,
    "structures": boolean,
    "traffic": boolean,
    "underground": boolean,
    "steepTerrain": boolean,
    "details": string
  },
  "accessNotes": string | null,
  "petAlerts": string | null,
  "summary": string
}
```

---

## 4. CRM Data Models & Schema Contracts

The voice agent must produce records matching GreenTree's TypeScript interfaces (`/types.ts`).

### Core `Lead` Model
```typescript
export interface Lead {
  id: string; // e.g. "LEAD-VOICE-8X92B" or Firestore auto-ID
  clientName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: 'Removal' | 'Pruning' | 'Plant Health' | 'Emergency' | 'Consulting';
  status: JobStatus; // Default: JobStatus.LEAD ('LEAD')
  createdAt: string; // ISO 8601 string
  attachments?: string[]; // Voice audio recording URL or transcript links
}
```

### Core `Contact` Model
```typescript
export interface Contact {
  id: string;
  name: string; // Customer Name (business or household)
  contactPerson?: string;
  email: string;
  phone?: string;
  secondaryPhone?: string;
  serviceAddress?: string;
  billingAddress?: string;
  isServiceAddressDifferent?: boolean;
  customerType?: 'Residential' | 'Commercial' | 'Municipal' | 'HOA';
  notes?: string; // Voicemail summary or caller preferences
  petAlerts?: string; // e.g., "Dog in backyard - call before entering"
  specialInstructions?: string; // e.g., "Gate code #4492, save oak firewood"
  hazardAlerts?: string; // e.g., "Power lines running through west canopy"
  privacyLevel?: 'Standard' | 'Confidential' | 'Restricted';
  createdAt: string;
  updatedAt?: string;
  userId?: string; // 'Arb-E Voice Agent'
}
```

### Core `Activity` Log
```typescript
export interface Activity {
  id: string;
  type: 'LEAD' | 'JOB' | 'DRONE' | 'FINANCE' | 'SYSTEM';
  message: string;
  timestamp: string;
  user: string; // 'Arb-E Voice Agent'
}
```

### Voice Lead Ingestion Payload (`VoiceLeadIntakePayload`)
When sending a complete voice inquiry to the GreenTree ingestion endpoint, use this unified format:

```typescript
export interface VoiceLeadIntakePayload {
  callId?: string; // Unique Call SID (Twilio/Telnyx/Vapi)
  callType: 'INBOUND_CALL' | 'VOICEMAIL' | 'SMS_INQUIRY';
  callerPhone: string;
  clientName?: string;
  email?: string;
  address?: string;
  serviceType: 'Removal' | 'Pruning' | 'Plant Health' | 'Emergency' | 'Consulting';
  urgency: 'Emergency' | 'High' | 'Medium' | 'Low';
  
  // Voice Content
  rawTranscript: string;
  recordingUrl?: string;
  durationSeconds?: number;
  aiSummary: string;
  
  // Arborist Domain Details
  treeSpecies?: string[];
  treeCount?: number;
  hazards?: {
    overhead?: boolean;
    structures?: boolean;
    traffic?: boolean;
    underground?: boolean;
    steepTerrain?: boolean;
    details?: string;
  };
  petAlerts?: string;
  accessNotes?: string;
  specialInstructions?: string;
}
```

---

## 5. API Specifications & Ingestion Endpoints

GreenTree's Express server exposes dedicated intake routes for external voice agents.

### Endpoint: `POST /api/leads/voice-intake`
- **Method:** `POST`
- **URL:** `http://<host>:3000/api/leads/voice-intake` (or production CRM URL)
- **Content-Type:** `application/json`
- **Headers:**
  - `Content-Type: application/json`
  - `X-Voice-API-Key: <SECRET_KEY>` (Optional shared secret configured in environment)

#### Sample Request Body:
```json
{
  "callId": "CA-98124901284-TWILIO",
  "callType": "VOICEMAIL",
  "callerPhone": "(706) 555-0144",
  "clientName": "David Patterson",
  "email": "dpatterson72@gmail.com",
  "address": "412 River Road, Columbus, GA 31904",
  "serviceType": "Emergency",
  "urgency": "Emergency",
  "rawTranscript": "Hi, this is David Patterson at 412 River Road. We had a storm blow through last night and a massive red oak branch snapped. It's hanging directly over our power drop and resting on the garage roof. Please call me back at 706-555-0144 as soon as someone is awake. We have a gate latch on the left.",
  "recordingUrl": "https://api.twilio.com/recordings/RE982140812.mp3",
  "durationSeconds": 34,
  "aiSummary": "Emergency storm damage: Heavy red oak limb snapped, resting on garage roof and hanging over main electrical service drop.",
  "treeSpecies": ["Southern Red Oak"],
  "treeCount": 1,
  "hazards": {
    "overhead": true,
    "structures": true,
    "traffic": false,
    "underground": false,
    "details": "Limb hung up on electrical service drop wire and resting on garage roof."
  },
  "accessNotes": "Gate latch located on left side of driveway",
  "petAlerts": null
}
```

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "leadId": "LEAD-VOICE-M7K2P",
  "contactId": "cnt_9a8b7c",
  "clientName": "David Patterson",
  "serviceType": "Emergency",
  "urgency": "Emergency",
  "message": "Voice inquiry received. Arb-E dispatched notification to tree crew."
}
```

---

### Endpoint: `POST /api/ai/transcribe`
If your external agent has raw recorded audio (base64) and wants GreenTree’s internal Gemini transcription model to transcribe it:
- **Method:** `POST`
- **URL:** `http://<host>:3000/api/ai/transcribe`
- **Request Body:**
```json
{
  "base64Data": "<base64_encoded_audio_bytes>",
  "mimeType": "audio/mp3",
  "model": "gemini-3.5-transcribe"
}
```
- **Response:**
```json
{
  "text": "Transcribed spoken text from caller..."
}
```

---

### Authentication & Security
1. **API Key Header:** Pass `X-Voice-API-Key: greentree-voice-secret` (or configured value in `.env`).
2. **Bearer Token:** The endpoint also accepts Firebase Auth Bearer tokens:
   `Authorization: Bearer <FIREBASE_ID_TOKEN>`.
3. **Internal Fallback:** If running inside the same private network or container ecosystem, requests with valid payloads are processed and sanitized.

### Contact Deduplication & Merging Logic
When the intake endpoint receives a call:
1. It cleans the incoming phone number (digits only, e.g. `7065550144`).
2. It queries existing CRM `contacts` for a matching `phone` or `email`.
3. **If Found:** It links the new Lead to the existing Contact, appends the voicemail / call summary to the contact's `notes`, and updates `hazardAlerts` if new hazards are identified.
4. **If Not Found:** It automatically creates a new Contact record in the database with the extracted customer details, pet alerts, and hazard notices.

---

## 6. Real-Time Dispatch Integration

GreenTree's operations dispatch board updates in real-time without requiring a browser refresh.

### Socket.IO Events
The backend WebSocket server emits the following events when a voice lead arrives:

1. **`new_voice_lead`**
   - **Payload:** `{ lead: Lead, contact: Contact, summary: string, urgency: string }`
   - **Frontend Reaction:** Triggers the audible Arb-E chime (D5-A5), displays a toast notification (`"📞 New Voicemail / Call Lead"`), and highlights the lead at the top of the Leads board.

2. **`data_updated`**
   - **Payload:** Updated application state object (`leads`, `contacts`, `activities`).
   - Automatically synchronizes all connected tablets, crew phones, and desktop dispatch screens.

### Direct Firestore Ingestion (Alternative Architecture)
If the external voice agent connects directly to Firebase Firestore via the Firebase Admin SDK:
- Write new leads to the `/leads` collection.
- Write new contacts to the `/contacts` collection.
- Write feed items to the `/activities` collection with `user: 'Arb-E Voice Agent'`.
- Write full call recordings to `/call_transcripts/{callId}`:
  ```json
  {
    "callId": "string",
    "callerPhone": "string",
    "transcript": "string",
    "audioUrl": "string",
    "extractedEntities": { ... },
    "createdAt": "ISO_TIMESTAMP"
  }
  ```

---

## 7. Testing & Verification Guide

### Sample `curl` Payloads

#### 1. Ingest an Inbound Call Lead
```bash
curl -X POST http://localhost:3000/api/leads/voice-intake \
  -H "Content-Type: application/json" \
  -H "X-Voice-API-Key: greentree-voice-secret" \
  -d '{
    "callType": "INBOUND_CALL",
    "callerPhone": "(706) 555-0188",
    "clientName": "Sarah Jenkins",
    "email": "sarah.j@example.com",
    "address": "1420 Wynnton Rd, Columbus, GA",
    "serviceType": "Pruning",
    "urgency": "Medium",
    "rawTranscript": "Hello Arb-E, I have three large live oaks with low dead branches touching my utility lines and driveway. Looking to get an ISA pruning estimate.",
    "aiSummary": "Pruning estimate for 3 live oaks with limbs over utility drop and driveway.",
    "treeSpecies": ["Live Oak"],
    "treeCount": 3,
    "hazards": {
      "overhead": true,
      "structures": false
    }
  }'
```

#### 2. Ingest an Urgent Voicemail
```bash
curl -X POST http://localhost:3000/api/leads/voice-intake \
  -H "Content-Type: application/json" \
  -d '{
    "callType": "VOICEMAIL",
    "callerPhone": "(334) 555-0199",
    "clientName": "Marcus Vance",
    "address": "802 Broad St, Phenix City, AL",
    "serviceType": "Removal",
    "urgency": "High",
    "rawTranscript": "Hey GreenTree team. Storm cracked a 50 foot pine in my backyard. It is leaning at 45 degrees towards the neighbor fence. Please get someone out today.",
    "aiSummary": "Hazardous cracked pine leaning 45 degrees over neighbor property line fence.",
    "treeSpecies": ["Loblolly Pine"],
    "treeCount": 1,
    "hazards": {
      "structures": true,
      "overhead": false
    }
  }'
```

---

### Integration Checklist
- [ ] Voice agent captures caller audio and transcribes accurately.
- [ ] LLM extraction outputs valid JSON matching `VoiceLeadIntakePayload`.
- [ ] Emergency keywords immediately escalate `urgency` to `'Emergency'`.
- [ ] Phone numbers normalized to standard formats.
- [ ] ANSI Z133 electrical and structure hazards correctly flagged in `hazards`.
- [ ] GreenTree logo and Gecko/Palm green styling applied to caller-facing webhooks or SMS confirmation messages.
- [ ] Arb-E persona used in voice dialogue and SMS receipts: *"Arb-E here from GreenTree! We got your voice message..."*
- [ ] Endpoint `POST /api/leads/voice-intake` returns HTTP `201` and broadcasts real-time alerts.

---

*GreenTree Arboriculture Management • Columbus, GA & Phenix City, AL • ISA Certified Arborists • Safety Standard ANSI Z133*
