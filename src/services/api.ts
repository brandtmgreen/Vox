import { ExtractedCustomerInfo, TranscriptSegment } from '../types/crm';

export interface ProcessVoicemailResponse {
  transcript: string;
  transcriptSegments: TranscriptSegment[];
  extractedData: ExtractedCustomerInfo;
  confidenceScore: number;
  processingTimeMs: number;
  timestamp: string;
}

export async function processVoicemailWithAi(params: {
  transcript?: string;
  audioBase64?: string;
  audioMimeType?: string;
  callerPhone?: string;
}): Promise<ProcessVoicemailResponse> {
  const response = await fetch('/api/voicemail/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

export interface CallConverseResponse {
  updatedState: any;
  arbEReply: string;
  isEmergencyAlert: boolean;
  leadId?: string;
  contactId?: string;
}

export async function sendCallConversationTurn(params: {
  message: string;
  currentState: any;
  callerPhone?: string;
  history: any[];
}): Promise<CallConverseResponse> {
  const response = await fetch('/api/call/converse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}

