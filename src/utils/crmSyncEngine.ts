import { 
  Contact, 
  Lead, 
  Activity, 
  VoiceLeadIntakePayload, 
  TreeHazards, 
  UrgencyLevel, 
  ServiceType,
  Voicemail 
} from '../types/crm';

/**
 * Normalizes phone numbers to standard format for deduplication
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
}

export function formatPhoneDisplay(phone: string): string {
  const norm = normalizePhoneNumber(phone);
  if (norm.length === 10) {
    return `(${norm.slice(0, 3)}) ${norm.slice(3, 6)}-${norm.slice(6)}`;
  }
  return phone;
}

/**
 * Finds an existing contact matching phone, email, or exact name
 */
export function findMatchingContact(
  contacts: Contact[],
  phone?: string,
  email?: string,
  name?: string
): Contact | null {
  const normTargetPhone = normalizePhoneNumber(phone || '');
  const cleanTargetEmail = (email || '').toLowerCase().trim();
  const cleanTargetName = (name || '').toLowerCase().trim();

  for (const contact of contacts) {
    const contactNormPhone = normalizePhoneNumber(contact.phone || '');
    const contactSecPhone = normalizePhoneNumber(contact.secondaryPhone || '');

    // 1. Phone match
    if (normTargetPhone && (contactNormPhone === normTargetPhone || contactSecPhone === normTargetPhone)) {
      return contact;
    }

    // 2. Email match
    if (cleanTargetEmail && contact.email && contact.email.toLowerCase().trim() === cleanTargetEmail) {
      return contact;
    }

    // 3. Exact Name match if length > 3
    if (cleanTargetName && cleanTargetName.length > 3 && contact.name.toLowerCase().trim() === cleanTargetName) {
      return contact;
    }
  }

  return null;
}

/**
 * ANSI Z133 Arborist Hazard Rule Classifier
 * Detects overhead wires, structure hazards, traffic, underground utilities, steep terrain
 */
export function classifyArboristHazards(text: string): {
  hazards: TreeHazards;
  isEmergency: boolean;
  detectedSpecies: string[];
  treeCount: number;
  detectedService: ServiceType;
} {
  const lower = (text || '').toLowerCase();

  // Overhead electrical wires / service drops
  const overhead = 
    lower.includes('power line') || 
    lower.includes('wires') || 
    lower.includes('utility drop') || 
    lower.includes('service drop') || 
    lower.includes('power drop') ||
    lower.includes('sparks') ||
    lower.includes('touching lines');

  // Structures (roof, house, fence, garage, shed, carport)
  const structures = 
    lower.includes('roof') || 
    lower.includes('house') || 
    lower.includes('garage') || 
    lower.includes('shed') || 
    lower.includes('fence') || 
    lower.includes('carport') ||
    lower.includes('deck') ||
    lower.includes('window');

  // Traffic / Street / Driveway obstruction
  const traffic = 
    lower.includes('street') || 
    lower.includes('road') || 
    lower.includes('traffic') || 
    lower.includes('blocking lane') || 
    lower.includes('sidewalk');

  // Underground utilities
  const underground = 
    lower.includes('septic') || 
    lower.includes('irrigation') || 
    lower.includes('sprinkler') || 
    lower.includes('gas line') || 
    lower.includes('water meter');

  // Steep terrain / soft turf
  const steepTerrain = 
    lower.includes('steep') || 
    lower.includes('slope') || 
    lower.includes('ravine') || 
    lower.includes('hillside') || 
    lower.includes('soft ground');

  // Emergency trigger keywords
  const isEmergency = 
    overhead || 
    lower.includes('fallen') || 
    lower.includes('emergency') || 
    lower.includes('cracked') || 
    lower.includes('storm damage') || 
    lower.includes('resting on garage') || 
    lower.includes('leaning towards house');

  // Tree species detection
  const speciesList = [
    'Loblolly Pine',
    'Southern Red Oak',
    'Live Oak',
    'Water Oak',
    'Crepe Myrtle',
    'Sweetgum',
    'Pecan',
    'Magnolia',
    'Dogwood',
    'Pine',
    'Oak',
  ];
  const detectedSpecies: string[] = [];
  for (const sp of speciesList) {
    if (lower.includes(sp.toLowerCase())) {
      detectedSpecies.push(sp);
    }
  }
  if (detectedSpecies.length === 0) {
    detectedSpecies.push('Mature Canopy Tree');
  }

  // Tree count detection
  let treeCount = 1;
  if (lower.includes('three') || lower.includes('3 trees') || lower.includes('3 live oaks')) treeCount = 3;
  else if (lower.includes('two') || lower.includes('2 trees')) treeCount = 2;
  else if (lower.includes('four') || lower.includes('4 trees')) treeCount = 4;
  else if (lower.includes('five') || lower.includes('5 trees')) treeCount = 5;

  // Service type determination
  let detectedService: ServiceType = 'Consulting';
  if (isEmergency) detectedService = 'Emergency';
  else if (lower.includes('remov') || lower.includes('take down') || lower.includes('cut down') || lower.includes('dead')) detectedService = 'Removal';
  else if (lower.includes('prun') || lower.includes('trim') || lower.includes('thin') || lower.includes('limb')) detectedService = 'Pruning';
  else if (lower.includes('sick') || lower.includes('health') || lower.includes('fertiliz') || lower.includes('borer') || lower.includes('fung')) detectedService = 'Plant Health';

  const hazardDetails: string[] = [];
  if (overhead) hazardDetails.push('Overhead electrical wires / utility drop near tree');
  if (structures) hazardDetails.push('Target structure in fall path (house/roof/fence)');
  if (traffic) hazardDetails.push('Street / public right-of-way overhang');
  if (underground) hazardDetails.push('Underground utility / septic proximity');
  if (steepTerrain) hazardDetails.push('Steep slope terrain requiring specialized rigging');

  return {
    hazards: {
      overhead,
      structures,
      traffic,
      underground,
      steepTerrain,
      details: hazardDetails.join('; ') || 'No critical ANSI Z133 physical hazards reported.',
    },
    isEmergency,
    detectedSpecies: Array.from(new Set(detectedSpecies)),
    treeCount,
    detectedService,
  };
}

export interface IngestionResult {
  updatedContacts: Contact[];
  updatedLeads: Lead[];
  updatedActivities: Activity[];
  leadId: string;
  contactId: string;
  isNewContact: boolean;
  message: string;
}

/**
 * Ingests a voice lead intake payload, performs deduplication and updates GreenTree CRM
 */
export function ingestVoiceLead(
  payload: VoiceLeadIntakePayload,
  currentContacts: Contact[],
  currentLeads: Lead[],
  currentActivities: Activity[]
): IngestionResult {
  const nowIso = new Date().toISOString();
  const leadId = `LEAD-VOICE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  const clientName = payload.clientName || 'Caller';
  const phone = payload.callerPhone || 'Unknown Phone';
  const email = payload.email || `${clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
  const address = payload.address || 'Columbus, GA';
  const serviceType = payload.serviceType;
  const urgency = payload.urgency;

  // Deduplicate against existing contacts
  const existingContact = findMatchingContact(currentContacts, phone, email, clientName);
  let updatedContacts = [...currentContacts];
  let targetContactId = '';
  let isNewContact = false;

  const hazardSummary = payload.hazards?.details || (payload.hazards?.overhead ? 'Power lines near canopy' : 'None');

  if (existingContact) {
    targetContactId = existingContact.id;
    const newNote = `[${payload.callType} on ${new Date().toLocaleDateString()}]: ${payload.aiSummary || payload.rawTranscript} (Service: ${serviceType}, Urgency: ${urgency})`;

    updatedContacts = updatedContacts.map((c) => {
      if (c.id === existingContact.id) {
        return {
          ...c,
          name: clientName !== 'Caller' ? clientName : c.name,
          serviceAddress: address !== 'Columbus, GA' ? address : (c.serviceAddress || address),
          email: payload.email || c.email,
          phone: payload.callerPhone || c.phone,
          notes: c.notes ? `${newNote}\n\n${c.notes}` : newNote,
          petAlerts: payload.petAlerts || c.petAlerts,
          specialInstructions: payload.specialInstructions || payload.accessNotes || c.specialInstructions,
          hazardAlerts: hazardSummary !== 'None' ? hazardSummary : c.hazardAlerts,
          updatedAt: nowIso,
          totalInquiries: (c.totalInquiries || 1) + 1,
          status: urgency === 'Emergency' ? 'Emergency Priority' : c.status,
        };
      }
      return c;
    });
  } else {
    isNewContact = true;
    targetContactId = `cnt_${Math.random().toString(36).substring(2, 8)}`;
    const newContact: Contact = {
      id: targetContactId,
      name: clientName,
      contactPerson: clientName,
      email: email,
      phone: phone,
      serviceAddress: address,
      billingAddress: address,
      isServiceAddressDifferent: false,
      customerType: 'Residential',
      notes: `[Initial ${payload.callType}]: ${payload.aiSummary || payload.rawTranscript}`,
      petAlerts: payload.petAlerts || undefined,
      specialInstructions: payload.specialInstructions || payload.accessNotes || undefined,
      hazardAlerts: hazardSummary !== 'None' ? hazardSummary : undefined,
      privacyLevel: 'Standard',
      createdAt: nowIso,
      updatedAt: nowIso,
      userId: 'Arb-E Voice Agent',
      totalInquiries: 1,
      status: urgency === 'Emergency' ? 'Emergency Priority' : 'Active Lead',
    };
    updatedContacts = [newContact, ...updatedContacts];
  }

  // Calculate estimated initial arborist value based on service & urgency
  let estimatedValue = 1800;
  if (serviceType === 'Emergency') estimatedValue = 3500;
  else if (serviceType === 'Removal') estimatedValue = 2400 * (payload.treeCount || 1);
  else if (serviceType === 'Pruning') estimatedValue = 950 * (payload.treeCount || 1);
  else if (serviceType === 'Plant Health') estimatedValue = 650;

  // Create Lead
  const newLead: Lead = {
    id: leadId,
    clientName: clientName,
    email: email,
    phone: phone,
    address: address,
    serviceType: serviceType,
    status: 'LEAD',
    createdAt: nowIso,
    urgency: urgency,
    estimatedValue: estimatedValue,
    treeSpecies: payload.treeSpecies,
    treeCount: payload.treeCount || 1,
    hazards: payload.hazards,
    summary: payload.aiSummary,
    callType: payload.callType,
  };
  const updatedLeads = [newLead, ...currentLeads];

  // Create Activity entry for Arb-E
  const newActivity: Activity = {
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'LEAD',
    message: `Arb-E Voice Agent logged new ${serviceType} lead for ${clientName} at ${address} (${urgency} Priority).`,
    timestamp: nowIso,
    user: 'Arb-E Voice Agent',
  };
  const updatedActivities = [newActivity, ...currentActivities];

  const message = `Voice inquiry received. Arb-E dispatched notification to tree crew for ${clientName}.`;

  return {
    updatedContacts,
    updatedLeads,
    updatedActivities,
    leadId,
    contactId: targetContactId,
    isNewContact,
    message,
  };
}

export function formatAudioDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function getUrgencyBadgeClasses(urgency?: string): string {
  switch (urgency?.toLowerCase()) {
    case 'critical':
    case 'emergency':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'high':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'medium':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'low':
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

