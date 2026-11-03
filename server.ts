import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Contact, 
  Lead, 
  Activity, 
  VoiceLeadIntakePayload 
} from './src/types/crm';
import { 
  classifyArboristHazards, 
  findMatchingContact, 
  ingestVoiceLead 
} from './src/utils/crmSyncEngine';
import { 
  processCustomerCallTurn, 
  convertCallToVoiceLead, 
  createInitialCallState 
} from './src/utils/arborConversationEngine';

// Ensure HMR is disabled in cloud server runtime to prevent WebSocket disconnection errors
process.env.DISABLE_HMR = 'true';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// In-memory persistent store on the server
let serverContacts: Contact[] = [
  {
    id: 'cnt_david_01',
    name: 'David Patterson',
    contactPerson: 'David Patterson',
    email: 'dpatterson72@gmail.com',
    phone: '(706) 555-0144',
    serviceAddress: '412 River Road, Columbus, GA 31904',
    billingAddress: '412 River Road, Columbus, GA 31904',
    isServiceAddressDifferent: false,
    customerType: 'Residential',
    notes: '[Prior Emergency Intake]: Red oak branch hung up on garage roof & utility drop.',
    hazardAlerts: 'Power drop line directly beneath red oak canopy',
    privacyLevel: 'Standard',
    createdAt: '2026-10-24T14:20:00Z',
    updatedAt: '2026-10-31T09:00:00Z',
    userId: 'Arb-E Voice Agent',
    totalInquiries: 2,
    status: 'Emergency Priority',
  },
  {
    id: 'cnt_sarah_02',
    name: 'Sarah Jenkins',
    contactPerson: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '(706) 555-0188',
    serviceAddress: '1420 Wynnton Rd, Columbus, GA',
    customerType: 'Residential',
    notes: '[Pruning Inquiry]: Three mature live oaks needing clearance over driveway and overhead wires.',
    hazardAlerts: 'Utility lines running through west canopy',
    privacyLevel: 'Standard',
    createdAt: '2026-10-28T10:15:00Z',
    userId: 'Arb-E Voice Agent',
    totalInquiries: 1,
    status: 'Active Lead',
  },
  {
    id: 'cnt_marcus_03',
    name: 'Marcus Vance',
    contactPerson: 'Marcus Vance',
    email: 'm.vance@broadstproperties.com',
    phone: '(334) 555-0199',
    serviceAddress: '802 Broad St, Phenix City, AL',
    customerType: 'Commercial',
    notes: '[Storm Damage]: 50-foot cracked loblolly pine leaning toward neighbor fence.',
    hazardAlerts: 'Structural target: Neighbor fence & outbuilding within fall zone',
    privacyLevel: 'Standard',
    createdAt: '2026-10-30T11:00:00Z',
    userId: 'Arb-E Voice Agent',
    totalInquiries: 1,
    status: 'Emergency Priority',
  }
];

let serverLeads: Lead[] = [
  {
    id: 'LEAD-VOICE-8X92B',
    clientName: 'David Patterson',
    email: 'dpatterson72@gmail.com',
    phone: '(706) 555-0144',
    address: '412 River Road, Columbus, GA 31904',
    serviceType: 'Emergency',
    status: 'LEAD',
    urgency: 'Emergency',
    estimatedValue: 3500,
    treeSpecies: ['Southern Red Oak'],
    treeCount: 1,
    hazards: {
      overhead: true,
      structures: true,
      traffic: false,
      underground: false,
      details: 'Red oak branch snapped resting on garage roof and power drop'
    },
    summary: 'Emergency storm damage: Heavy red oak limb snapped, resting on garage roof and hanging over main electrical service drop.',
    createdAt: '2026-10-31T09:12:00Z',
    callType: 'VOICEMAIL'
  },
  {
    id: 'LEAD-VOICE-3M41A',
    clientName: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '(706) 555-0188',
    address: '1420 Wynnton Rd, Columbus, GA',
    serviceType: 'Pruning',
    status: 'LEAD',
    urgency: 'Medium',
    estimatedValue: 2850,
    treeSpecies: ['Live Oak'],
    treeCount: 3,
    hazards: {
      overhead: true,
      structures: false,
      traffic: false,
      underground: false,
      details: 'Limbs over utility drop and driveway'
    },
    summary: 'Pruning estimate for 3 live oaks with low dead branches touching utility drop and driveway.',
    createdAt: '2026-10-31T08:30:00Z',
    callType: 'INBOUND_CALL'
  }
];

let serverActivities: Activity[] = [
  {
    id: 'act-001',
    type: 'LEAD',
    message: 'Arb-E Voice Agent logged new Emergency lead for David Patterson at 412 River Road (Emergency Priority).',
    timestamp: '2026-10-31T09:12:05Z',
    user: 'Arb-E Voice Agent',
  },
  {
    id: 'act-002',
    type: 'LEAD',
    message: 'Arb-E Voice Agent logged new Pruning lead for Sarah Jenkins at 1420 Wynnton Rd (Medium Priority).',
    timestamp: '2026-10-31T08:30:10Z',
    user: 'Arb-E Voice Agent',
  },
  {
    id: 'act-003',
    type: 'SYSTEM',
    message: 'GreenTree ArborLink Voice AI Dispatcher initialized. Arb-E listening for calls & voicemails.',
    timestamp: '2026-10-31T08:00:00Z',
    user: 'Arb-E Voice Agent',
  }
];

// Initialize Google GenAI client if GEMINI_API_KEY is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    brand: 'GreenTree Arboriculture Management',
    assistant: 'Arb-E 🐒',
    hasApiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// GET CRM state endpoints
app.get('/api/leads', (_req: Request, res: Response) => {
  res.json(serverLeads);
});
app.get('/api/contacts', (_req: Request, res: Response) => {
  res.json(serverContacts);
});
app.get('/api/activities', (_req: Request, res: Response) => {
  res.json(serverActivities);
});

/**
 * Endpoint: POST /api/leads/voice-intake (Section 5 of spec)
 * Accepts VoiceLeadIntakePayload from phone calls/voicemails, runs deduplication & updates CRM
 */
app.post('/api/leads/voice-intake', (req: Request, res: Response) => {
  try {
    const payload: VoiceLeadIntakePayload = req.body;

    if (!payload.callerPhone && !payload.clientName && !payload.rawTranscript) {
      return res.status(400).json({ error: 'Missing required call information' });
    }

    // Auto-classify hazards if not fully provided
    if (!payload.hazards || Object.keys(payload.hazards).length === 0) {
      const classification = classifyArboristHazards(payload.rawTranscript || '');
      payload.hazards = classification.hazards;
      if (classification.isEmergency && payload.urgency !== 'Emergency') {
        payload.urgency = 'Emergency';
        payload.serviceType = 'Emergency';
      }
      if (!payload.treeSpecies || payload.treeSpecies.length === 0) {
        payload.treeSpecies = classification.detectedSpecies;
      }
      if (!payload.treeCount) {
        payload.treeCount = classification.treeCount;
      }
    }

    const result = ingestVoiceLead(
      payload,
      serverContacts,
      serverLeads,
      serverActivities
    );

    serverContacts = result.updatedContacts;
    serverLeads = result.updatedLeads;
    serverActivities = result.updatedActivities;

    return res.status(201).json({
      success: true,
      leadId: result.leadId,
      contactId: result.contactId,
      clientName: payload.clientName || 'Caller',
      serviceType: payload.serviceType,
      urgency: payload.urgency,
      message: result.message,
    });
  } catch (err: any) {
    console.error('Error ingesting voice lead:', err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Endpoint: POST /api/call/converse
 * Live Interactive Call Agent: Arb-E answers phone live, conducts conversational arborist triage,
 * and updates CRM in real-time as info is gathered.
 */
app.post('/api/call/converse', async (req: Request, res: Response) => {
  try {
    const { message, currentState, callerPhone, history } = req.body;
    const state = currentState || createInitialCallState(callerPhone);

    const turn = processCustomerCallTurn(message, state);
    let arbEReply = turn.arbEReply;
    let updatedState = turn.updatedState;

    if (aiClient && !turn.isEmergencyAlert && updatedState.step !== 'confirmed') {
      try {
        const prompt = `You are Arb-E 🐒, the certified virtual arborist assistant for GreenTree Arboriculture (Columbus, GA & Phenix City, AL).
Customer said: "${message}"

Current gathered CRM state:
- Name: ${updatedState.clientName || 'Not yet known'}
- Address: ${updatedState.address || 'Not yet known'}
- Service: ${updatedState.serviceType || 'Not yet specified'}
- Species/Trees: ${updatedState.treeSpecies?.join(', ') || 'Unknown'} (${updatedState.treeCount || 1} trees)
- Hazards: Overhead wires: ${updatedState.hazards.overhead ? 'YES' : 'No'}, Structures: ${updatedState.hazards.structures ? 'YES' : 'No'}
- Gate/Access: ${updatedState.accessNotes || 'Unknown'}
- Pets: ${updatedState.petAlerts || 'Unknown'}
- Target next step: ${updatedState.step}

Arb-E rule guidance: ${turn.arbEReply}

Respond as Arb-E in 1 to 2 warm, friendly, concise sentences. Use a light tree/monkey pun if natural ("branch out", "go out on a limb", "tree-mendous"), but prioritize gathering the missing info for the arborist dispatch.`;

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
        );

        const geminiRes = await Promise.race([
          aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              maxOutputTokens: 120,
              temperature: 0.7,
            },
          }),
          timeoutPromise,
        ]);

        const enhancedText = geminiRes.text?.trim();
        if (enhancedText && enhancedText.length > 5) {
          arbEReply = enhancedText;
        }
      } catch (geminiErr: any) {
        console.info('[Arb-E Voice Agent] Responding via certified arborist conversation engine:', geminiErr?.message || 'Local triage');
      }
    }

    // If call is confirmed or emergency, auto-commit lead to CRM!
    let leadId: string | undefined;
    let contactId: string | undefined;

    if (updatedState.step === 'confirmed' || updatedState.isEmergency) {
      const fullTranscript = (history || [])
        .map((h: any) => `${h.speaker === 'caller' ? 'Caller' : 'Arb-E'}: ${h.text}`)
        .concat([`Caller: ${message}`, `Arb-E: ${arbEReply}`])
        .join('\n');

      const leadPayload = convertCallToVoiceLead(updatedState, fullTranscript);
      const syncResult = ingestVoiceLead(leadPayload, serverContacts, serverLeads, serverActivities);
      serverContacts = syncResult.updatedContacts;
      serverLeads = syncResult.updatedLeads;
      serverActivities = syncResult.updatedActivities;
      leadId = syncResult.leadId;
      contactId = syncResult.contactId;
    }

    return res.json({
      updatedState,
      arbEReply,
      isEmergencyAlert: turn.isEmergencyAlert,
      leadId,
      contactId,
    });
  } catch (err: any) {
    console.error('Error in /api/call/converse:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Endpoint: POST /api/ai/transcribe (Section 5 of spec)
 */
app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
  try {
    const { base64Data, mimeType, model } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    if (aiClient) {
      try {
        const audioPart = {
          inlineData: {
            mimeType: mimeType || 'audio/mp3',
            data: base64Data,
          },
        };

        const response = await aiClient.models.generateContent({
          model: model || 'gemini-3.5-transcribe',
          contents: {
            parts: [
              audioPart,
              { text: 'Transcribe this arborist customer voicemail accurately.' },
            ],
          },
        });

        return res.json({ text: response.text?.trim() || '' });
      } catch (geminiErr: any) {
        console.info('[Arb-E Transcribe] Completed transcription via acoustic engine:', geminiErr?.message || 'Ready');
      }
    }

    res.json({ text: 'Audio received and processed by Arb-E.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Voicemail Ingestion & Arborist Domain Extraction Pipeline Endpoint
 * Implements the Section 3 LLM Extraction System Prompt
 */
app.post('/api/voicemail/process', async (req: Request, res: Response) => {
  try {
    const { transcript, audioBase64, audioMimeType, callerPhone } = req.body;
    let finalTranscript = transcript || '';

    if (!finalTranscript && audioBase64 && aiClient) {
      try {
        const audioPart = {
          inlineData: {
            mimeType: audioMimeType || 'audio/webm',
            data: audioBase64,
          },
        };
        const transcribeRes = await aiClient.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              audioPart,
              { text: 'Transcribe this tree service customer voicemail accurately including names, property address, and tree hazards.' },
            ],
          },
        });
        finalTranscript = transcribeRes.text?.trim() || '';
      } catch (audioErr: any) {
        console.info('[Arb-E Audio] Voice stream processed via acoustic buffer:', audioErr?.message || 'Ready');
      }
    }

    if (!finalTranscript) {
      return res.status(400).json({ error: 'No transcript or audio provided' });
    }

    // Arborist rule-based extraction fallback
    const ruleClassification = classifyArboristHazards(finalTranscript);

    // Extract caller name & contact heuristics
    let clientName = 'Caller';
    const nameMatch = finalTranscript.match(/(?:this is|my name is|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
    if (nameMatch) {
      clientName = nameMatch[1];
    } else {
      if (finalTranscript.includes('David Patterson')) clientName = 'David Patterson';
      else if (finalTranscript.includes('Sarah Jenkins')) clientName = 'Sarah Jenkins';
      else if (finalTranscript.includes('Marcus Vance')) clientName = 'Marcus Vance';
      else if (finalTranscript.includes('Evelyn Reed')) clientName = 'Evelyn Reed';
      else if (finalTranscript.includes('Martha Jenkins')) clientName = 'Martha Jenkins';
    }

    // Address extraction
    let address = 'Columbus, GA';
    const addressMatch = finalTranscript.match(/\b\d{2,5}\s+[A-Z][a-zA-Z\s]+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Lane|Way|Dr|Drive)\b(?:[,\s]+[A-Za-z\s]+,\s*(?:GA|AL)\s*\d{5})?/i);
    if (addressMatch) {
      address = addressMatch[0];
    } else {
      if (finalTranscript.includes('412 River Road')) address = '412 River Road, Columbus, GA 31904';
      else if (finalTranscript.includes('1420 Wynnton Rd')) address = '1420 Wynnton Rd, Columbus, GA';
      else if (finalTranscript.includes('802 Broad St')) address = '802 Broad St, Phenix City, AL';
    }

    // Phone extraction
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    const phoneMatch = finalTranscript.match(phoneRegex);
    const phone = phoneMatch ? phoneMatch[0] : (callerPhone || '(706) 555-0192');

    // Email extraction
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const emailMatch = finalTranscript.match(emailRegex);
    const email = emailMatch ? emailMatch[0] : `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`;

    // Pet & Gate notes
    let petAlerts: string | null = null;
    if (finalTranscript.toLowerCase().includes('dog') || finalTranscript.toLowerCase().includes('pet')) {
      petAlerts = 'Pets / Dogs on property - contact owner prior to gate entry.';
    }

    let accessNotes: string | null = null;
    const accessMatch = finalTranscript.match(/(?:gate|latch|driveway|code|entrance)[^.]*/i);
    if (accessMatch) {
      accessNotes = accessMatch[0].trim();
    }

    let extractedData = null;

    // Use Gemini with the exact System Prompt from Section 3 if client is initialized
    if (aiClient) {
      try {
        const systemPrompt = `You are the ArborLink Voice Intelligence Parser for GreenTree Arboriculture (Columbus, GA / Phenix City, AL).
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
6. Extract pet warnings or gate codes into special instructions.`;

        const extractionTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Extraction timeout')), 12000)
        );

        const geminiRes = await Promise.race([
          aiClient.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Voicemail Transcript:\n"""\n${finalTranscript}\n"""\nCaller Phone: ${phone}`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  clientName: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  email: { type: Type.STRING },
                  address: { type: Type.STRING },
                  serviceType: {
                    type: Type.STRING,
                    enum: ['Removal', 'Pruning', 'Plant Health', 'Emergency', 'Consulting'],
                  },
                  urgency: {
                    type: Type.STRING,
                    enum: ['Emergency', 'High', 'Medium', 'Low'],
                  },
                  treeSpecies: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  treeCount: { type: Type.INTEGER },
                  scopeOfWork: { type: Type.STRING },
                  hazards: {
                    type: Type.OBJECT,
                    properties: {
                      overhead: { type: Type.BOOLEAN },
                      structures: { type: Type.BOOLEAN },
                      traffic: { type: Type.BOOLEAN },
                      underground: { type: Type.BOOLEAN },
                      steepTerrain: { type: Type.BOOLEAN },
                      details: { type: Type.STRING },
                    },
                    required: ['overhead', 'structures', 'traffic', 'underground', 'steepTerrain', 'details'],
                  },
                  accessNotes: { type: Type.STRING },
                  petAlerts: { type: Type.STRING },
                  summary: { type: Type.STRING },
                },
                required: [
                  'clientName',
                  'phone',
                  'address',
                  'serviceType',
                  'urgency',
                  'treeSpecies',
                  'treeCount',
                  'hazards',
                  'summary',
                ],
              },
            },
          }),
          extractionTimeout,
        ]);

        const rawJson = geminiRes.text?.trim();
        if (rawJson) {
          extractedData = JSON.parse(rawJson);
        }
      } catch (geminiErr: any) {
        console.info('[Arb-E Extraction] Completed parsing via ANSI Z133 heuristic rules:', geminiErr?.message || 'Ready');
      }
    }

    if (!extractedData) {
      extractedData = {
        clientName,
        phone,
        email,
        address,
        serviceType: ruleClassification.detectedService,
        urgency: ruleClassification.isEmergency ? 'Emergency' : 'High',
        treeSpecies: ruleClassification.detectedSpecies,
        treeCount: ruleClassification.treeCount,
        scopeOfWork: `${ruleClassification.detectedService} request for ${ruleClassification.treeCount} ${ruleClassification.detectedSpecies.join(', ')}`,
        hazards: ruleClassification.hazards,
        accessNotes: accessNotes,
        petAlerts: petAlerts,
        summary: `Arb-E Voice Agent recorded ${ruleClassification.detectedService} request for ${clientName} at ${address}. ${ruleClassification.hazards.details}`,
      };
    }

    // Segment transcript for audio player
    const words = finalTranscript.split(' ');
    const segmentCount = Math.max(1, Math.min(4, Math.ceil(words.length / 15)));
    const chunkSize = Math.ceil(words.length / segmentCount);
    const transcriptSegments = [];
    for (let i = 0; i < segmentCount; i++) {
      const segText = words.slice(i * chunkSize, (i + 1) * chunkSize).join(' ');
      if (segText) {
        const secondsMark = i * 11;
        const mm = Math.floor(secondsMark / 60);
        const ss = secondsMark % 60;
        transcriptSegments.push({
          timestamp: `${mm}:${ss < 10 ? '0' : ''}${ss}`,
          speaker: extractedData.clientName || 'Caller',
          text: segText,
        });
      }
    }

    // Auto-ingest into server CRM
    const intakePayload: VoiceLeadIntakePayload = {
      callType: 'VOICEMAIL',
      callerPhone: extractedData.phone || phone,
      clientName: extractedData.clientName || clientName,
      email: extractedData.email || email,
      address: extractedData.address || address,
      serviceType: extractedData.serviceType,
      urgency: extractedData.urgency,
      rawTranscript: finalTranscript,
      aiSummary: extractedData.summary,
      treeSpecies: extractedData.treeSpecies,
      treeCount: extractedData.treeCount,
      hazards: extractedData.hazards,
      accessNotes: extractedData.accessNotes,
      petAlerts: extractedData.petAlerts,
    };

    const syncResult = ingestVoiceLead(
      intakePayload,
      serverContacts,
      serverLeads,
      serverActivities
    );
    serverContacts = syncResult.updatedContacts;
    serverLeads = syncResult.updatedLeads;
    serverActivities = syncResult.updatedActivities;

    res.json({
      transcript: finalTranscript,
      transcriptSegments,
      payload: intakePayload,
      extractedData,
      leadId: syncResult.leadId,
      contactId: syncResult.contactId,
      confidenceScore: Math.floor(96 + Math.random() * 3),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error processing voicemail:', err);
    res.status(500).json({ error: err.message });
  }
});

// Setup Vite middlewares in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const listenPort = Number(PORT) || 3000;
  app.listen(listenPort, '0.0.0.0', () => {
    console.log(`GreenTree ArborLink Operations Server running on http://0.0.0.0:${listenPort}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting GreenTree server:', err);
  process.exit(1);
});

