/**
 * GreenTree Arboriculture CRM & Voice AI Models
 * Matching Section 4 of VOICE_AI_INTEGRATION_SPEC_e34f9f9d.md
 */

export type ServiceType = 'Removal' | 'Pruning' | 'Plant Health' | 'Emergency' | 'Consulting';
export type UrgencyLevel = 'Emergency' | 'High' | 'Medium' | 'Low';
export type JobStatus = 'LEAD' | 'ESTIMATE_SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'INVOICED';
export type CustomerType = 'Residential' | 'Commercial' | 'Municipal' | 'HOA';
export type CallType = 'INBOUND_CALL' | 'VOICEMAIL' | 'SMS_INQUIRY';

export interface TreeHazards {
  overhead: boolean;      // ANSI Z133 Electrical / Power lines
  structures: boolean;    // Houses, roofs, sheds, carports, fences in fall zone
  traffic: boolean;       // Road overhang, traffic flagging required
  underground: boolean;   // Septic, irrigation, gas utilities
  steepTerrain: boolean;  // Slopes, soft ground, ravine
  details: string;
}

export interface VoiceLeadIntakePayload {
  callId?: string;
  callType: CallType;
  callerPhone: string;
  clientName?: string;
  email?: string;
  address?: string;
  serviceType: ServiceType;
  urgency: UrgencyLevel;
  rawTranscript: string;
  recordingUrl?: string;
  durationSeconds?: number;
  aiSummary: string;
  treeSpecies?: string[];
  treeCount?: number;
  scopeOfWork?: string;
  hazards?: Partial<TreeHazards>;
  petAlerts?: string | null;
  accessNotes?: string | null;
  specialInstructions?: string | null;
}

export interface Lead {
  id: string; // e.g. "LEAD-VOICE-8X92B"
  clientName: string;
  email: string;
  phone: string;
  address: string;
  serviceType: ServiceType;
  status: JobStatus;
  createdAt: string;
  urgency?: UrgencyLevel;
  estimatedValue?: number;
  treeSpecies?: string[];
  treeCount?: number;
  hazards?: Partial<TreeHazards>;
  summary?: string;
  attachments?: string[];
  callType?: CallType;
}

export interface Contact {
  id: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  secondaryPhone?: string;
  serviceAddress?: string;
  billingAddress?: string;
  isServiceAddressDifferent?: boolean;
  customerType?: CustomerType;
  notes?: string;
  petAlerts?: string;
  specialInstructions?: string;
  hazardAlerts?: string;
  privacyLevel?: 'Standard' | 'Confidential' | 'Restricted';
  createdAt: string;
  updatedAt?: string;
  userId?: string; // 'Arb-E Voice Agent'
  totalInquiries?: number;
  status?: 'Active Lead' | 'Regular Client' | 'Emergency Priority' | 'HOA Partner';
}

export interface Activity {
  id: string;
  type: 'LEAD' | 'JOB' | 'DRONE' | 'FINANCE' | 'SYSTEM';
  message: string;
  timestamp: string;
  user: string; // 'Arb-E Voice Agent'
}

export interface TranscriptSegment {
  timestamp: string;
  speaker: string;
  text: string;
}

export interface Voicemail {
  id: string;
  callId?: string;
  callType: CallType;
  callerNumber: string;
  callerCallerIdName?: string;
  receivedAt: string;
  durationSeconds: number;
  audioDurationFormatted: string;
  status: 'incoming' | 'transcribing' | 'extracting' | 'synced' | 'failed';
  transcript: string;
  transcriptSegments: TranscriptSegment[];
  confidenceScore: number;
  payload?: VoiceLeadIntakePayload;
  leadId?: string;
  contactId?: string;
  synced: boolean;
  syncedAt?: string;
  emergencyAlertTriggered?: boolean;
}

export interface CallDialogueMessage {
  id: string;
  speaker: 'arb-e' | 'caller';
  text: string;
  timestamp: string;
  safetyAlert?: boolean;
}

export interface CallProgressState {
  clientName?: string;
  phone?: string;
  email?: string;
  address?: string;
  serviceType?: ServiceType;
  urgency?: UrgencyLevel;
  treeSpecies?: string[];
  treeCount?: number;
  hazards: TreeHazards;
  petAlerts?: string;
  accessNotes?: string;
  preferredTime?: string;
  step: 'greeting' | 'service_address' | 'hazard_check' | 'access_schedule' | 'confirmed';
  percentComplete: number;
  isEmergency: boolean;
  safetyWarningSpoken: boolean;
}

export interface ExtractedCustomerInfo {
  clientName?: string;
  phone?: string;
  email?: string;
  address?: string;
  serviceType: ServiceType;
  urgency: UrgencyLevel;
  summary: string;
  treeSpecies?: string[];
  treeCount?: number;
  hazards?: Partial<TreeHazards>;
  petAlerts?: string | null;
  accessNotes?: string | null;
  specialInstructions?: string | null;
}

export interface Deal {
  id: string;
  title: string;
  company: string;
  contactName: string;
  value: number;
  probability: number;
  stage: 'New Lead' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won';
  sourceVoicemailId: string;
  createdAt?: string;
}

export interface CrmTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  contactName?: string;
  assignee: string;
  dueDate: string;
  sourceVoicemailId: string;
  createdAt?: string;
}


