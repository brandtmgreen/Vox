import { 
  CallDialogueMessage, 
  CallProgressState, 
  VoiceLeadIntakePayload, 
  ServiceType, 
  UrgencyLevel, 
  TreeHazards 
} from '../types/crm';
import { classifyArboristHazards } from './crmSyncEngine';

export const INITIAL_ARBE_GREETING = 
  "Thanks for calling GreenTree Arboriculture! This is Arb-E 🐒, your certified virtual tree assistant. Whether you need a hazardous pine pruned back, storm cleanup, or a tree health assessment, we're ready to branch out for you! May I grab your name and the service address for the trees?";

export function createInitialCallState(callerPhone?: string): CallProgressState {
  return {
    phone: callerPhone || '(706) 555-0192',
    hazards: {
      overhead: false,
      structures: false,
      traffic: false,
      underground: false,
      steepTerrain: false,
      details: '',
    },
    step: 'greeting',
    percentComplete: 15,
    isEmergency: false,
    safetyWarningSpoken: false,
  };
}

/**
 * Parses user input in the live call, updates accumulated arborist state,
 * and generates Arb-E's next conversational response.
 */
export function processCustomerCallTurn(
  userText: string,
  currentState: CallProgressState
): {
  updatedState: CallProgressState;
  arbEReply: string;
  isEmergencyAlert: boolean;
} {
  const text = userText.trim();
  const lower = text.toLowerCase();
  const next = { ...currentState, hazards: { ...currentState.hazards } };

  // 1. Extract Name heuristics
  if (!next.clientName) {
    const nameMatch = text.match(/(?:this is|my name is|i am|name is|it's|it is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)(?:\s+(?:at|on|from|in|with|calling|and)\b|[.,!?]|$)/i);
    if (nameMatch) {
      let extracted = nameMatch[1].trim();
      extracted = extracted.replace(/\s+(?:at|on|from|in|with|calling|and)$/i, '').trim();
      next.clientName = extracted;
    } else {
      if (lower.includes('david patterson')) next.clientName = 'David Patterson';
      else if (lower.includes('sarah jenkins')) next.clientName = 'Sarah Jenkins';
      else if (lower.includes('marcus vance')) next.clientName = 'Marcus Vance';
      else if (lower.includes('martha jenkins')) next.clientName = 'Martha Jenkins';
      else if (lower.includes('elena')) next.clientName = 'Elena Rostova';
    }
  }

  // 2. Extract Address heuristics
  if (!next.address) {
    const addressMatch = text.match(/\b\d{2,5}\s+[A-Za-z0-9\s]+(?:Rd|Road|St|Street|Ave|Avenue|Blvd|Lane|Way|Dr|Drive)\b(?:[,\s]+[A-Za-z\s]+,\s*(?:GA|AL)\s*\d{5})?/i);
    if (addressMatch) {
      next.address = addressMatch[0].trim();
    } else {
      if (lower.includes('412 river road')) next.address = '412 River Road, Columbus, GA 31904';
      else if (lower.includes('1420 wynnton')) next.address = '1420 Wynnton Rd, Columbus, GA';
      else if (lower.includes('802 broad')) next.address = '802 Broad St, Phenix City, AL';
      else if (lower.includes('columbus')) next.address = 'Columbus, GA';
      else if (lower.includes('phenix city')) next.address = 'Phenix City, AL';
    }
  }

  // 3. Tree Scope & Front Desk Site Notes
  const hazardCheck = classifyArboristHazards(text);
  if (hazardCheck.hazards.overhead) next.hazards.overhead = true;
  if (hazardCheck.hazards.structures) next.hazards.structures = true;
  if (hazardCheck.hazards.traffic) next.hazards.traffic = true;
  if (hazardCheck.hazards.underground) next.hazards.underground = true;
  if (hazardCheck.hazards.steepTerrain) next.hazards.steepTerrain = true;
  if (hazardCheck.isEmergency) next.isEmergency = true;

  if (hazardCheck.detectedSpecies.length > 0 && !hazardCheck.detectedSpecies.includes('Mature Canopy Tree')) {
    next.treeSpecies = Array.from(new Set([...(next.treeSpecies || []), ...hazardCheck.detectedSpecies]));
  }
  if (hazardCheck.treeCount > 1) {
    next.treeCount = hazardCheck.treeCount;
  }

  if (hazardCheck.detectedService !== 'Consulting') {
    next.serviceType = hazardCheck.detectedService;
  }

  // 4. Pet alerts & access notes
  if (lower.includes('dog') || lower.includes('pets') || lower.includes('puppy')) {
    next.petAlerts = 'Pets on property - check with owner before entering gate.';
  }
  if (lower.includes('gate') || lower.includes('latch') || lower.includes('code') || lower.includes('driveway')) {
    const accessMatch = text.match(/(?:gate|latch|code|driveway)[^.]*/i);
    next.accessNotes = accessMatch ? accessMatch[0].trim() : 'Gate access noted by caller';
  }

  // 5. Scheduling preference
  if (lower.includes('today') || lower.includes('asap') || lower.includes('immediately')) {
    next.preferredTime = 'Immediate / Today';
  } else if (lower.includes('tomorrow') || lower.includes('morning') || lower.includes('afternoon') || lower.includes('this week')) {
    next.preferredTime = 'Tomorrow / Next available';
  }

  // Calculate completeness percentage
  let score = 15;
  if (next.clientName) score += 20;
  if (next.address) score += 20;
  if (next.serviceType) score += 15;
  if (next.hazards.overhead || next.hazards.structures || lower.includes('no wires') || lower.includes('safe')) score += 15;
  if (next.accessNotes || next.petAlerts || lower.includes('no gate') || lower.includes('no pets') || lower.includes('open')) score += 15;
  next.percentComplete = Math.min(100, score);

  let isEmergencyAlert = false;
  let arbEReply = "";

  // Front Desk note if wires or emergency mentioned
  if (next.hazards.overhead && !next.safetyWarningSpoken) {
    next.safetyWarningSpoken = true;
    next.urgency = 'Emergency';
    next.serviceType = 'Emergency';
    isEmergencyAlert = true;
    arbEReply = 
      "Understood! I've flagged the wire contact as an urgent note in your file for our field arborist. Do you have a gate code, latch, or any pets in the yard our crew should know about?";
    next.step = 'access_schedule';
    return { updatedState: next, arbEReply, isEmergencyAlert };
  }

  // Step progression logic
  if (!next.clientName || !next.address) {
    next.step = 'service_address';
    if (!next.clientName && !next.address) {
      arbEReply = "Thanks! Could you please share your name and property address in Columbus or Phenix City so I can get your file started?";
    } else if (!next.clientName) {
      arbEReply = `Got the address at ${next.address}! May I get your full name and best callback number?`;
    } else {
      arbEReply = `Great to meet you, ${next.clientName}! What is the service street address for the trees?`;
    }
  } else if (!next.serviceType || (!next.treeSpecies && !next.treeCount)) {
    next.step = 'service_address';
    arbEReply = `Thanks, ${next.clientName}! What kind of tree work do you need done at ${next.address} — are you looking for tree removal, pruning, storm cleanup, or a tree health assessment?`;
  } else if (!next.hazards.overhead && !next.hazards.structures && !lower.includes('no lines') && !lower.includes('clear')) {
    next.step = 'hazard_check';
    arbEReply = "Got it! Are there any site obstacles our arborist should note before visiting, such as utility lines near the branches, fences, or roofs nearby?";
  } else if (!next.accessNotes && !next.petAlerts && !lower.includes('no gate') && !lower.includes('no pets') && !lower.includes('open access')) {
    next.step = 'access_schedule';
    arbEReply = "Got that noted! How is property access for our arborist? Is there a backyard gate latch or code, and are there any pets on site?";
  } else {
    // Flow complete!
    next.step = 'confirmed';
    next.percentComplete = 100;
    const speciesText = next.treeSpecies?.join(', ') || 'tree';
    arbEReply = `Tree-mendous! 🐒 I've captured your inquiry for ${next.serviceType || 'tree service'} (${speciesText}) at ${next.address}. I am forwarding your lead directly to our GreenTree Arboriculture Management field workflow now!`;
  }

  return { updatedState: next, arbEReply, isEmergencyAlert };
}

/**
 * Converts accumulated call state into a complete VoiceLeadIntakePayload
 */
export function convertCallToVoiceLead(
  state: CallProgressState,
  rawTranscript: string
): VoiceLeadIntakePayload {
  const clientName = state.clientName || 'Live Inbound Caller';
  const address = state.address || 'Columbus, GA';
  const serviceType = state.serviceType || (state.isEmergency ? 'Emergency' : 'Removal');
  const urgency: UrgencyLevel = state.isEmergency ? 'Emergency' : (state.urgency || 'High');

  return {
    callType: 'INBOUND_CALL',
    callerPhone: state.phone || '(706) 555-0144',
    clientName,
    email: state.email || `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    address,
    serviceType,
    urgency,
    rawTranscript,
    aiSummary: `Front Desk intake by Arb-E: ${serviceType} request for ${clientName} at ${address}. Notes: ${state.accessNotes || 'Standard access'}. Pets: ${state.petAlerts || 'None'}. Forwarded to GreenTree Arboriculture Management workflow.`.trim(),
    treeSpecies: state.treeSpecies && state.treeSpecies.length > 0 ? state.treeSpecies : ['Southern Canopy Tree'],
    treeCount: state.treeCount || 1,
    hazards: state.hazards,
    petAlerts: state.petAlerts || null,
    accessNotes: state.accessNotes || null,
    specialInstructions: state.preferredTime ? `Preferred timeframe: ${state.preferredTime}` : null,
  };
}
