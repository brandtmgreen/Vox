import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  normalizePhoneNumber, 
  classifyArboristHazards, 
  findMatchingContact, 
  ingestVoiceLead 
} from './crmSyncEngine';
import { Contact, VoiceLeadIntakePayload } from '../types/crm';

test('normalizePhoneNumber handles various formats correctly', () => {
  assert.equal(normalizePhoneNumber('(706) 555-0144'), '7065550144');
  assert.equal(normalizePhoneNumber('+1 (706) 555-0144'), '7065550144');
  assert.equal(normalizePhoneNumber('334.555.0199'), '3345550199');
});

test('classifyArboristHazards detects ANSI Z133 electrical and structural hazards', () => {
  const emergencyTranscript = "A massive red oak branch snapped. It's hanging directly over our power drop and resting on the garage roof.";
  const classification = classifyArboristHazards(emergencyTranscript);

  assert.equal(classification.hazards.overhead, true);
  assert.equal(classification.hazards.structures, true);
  assert.equal(classification.isEmergency, true);
  assert.equal(classification.detectedService, 'Emergency');
  assert.ok(classification.detectedSpecies.includes('Southern Red Oak') || classification.detectedSpecies.includes('Oak'));
});

test('findMatchingContact matches existing contact by phone or email', () => {
  const existing: Contact[] = [
    {
      id: 'cnt_david_123',
      name: 'David Patterson',
      email: 'dpatterson72@gmail.com',
      phone: '(706) 555-0144',
      serviceAddress: '412 River Road, Columbus, GA 31904',
      createdAt: '2026-10-01T10:00:00Z',
    }
  ];

  const match = findMatchingContact(existing, '706-555-0144', undefined, undefined);
  assert.ok(match);
  assert.equal(match.id, 'cnt_david_123');

  const matchByEmail = findMatchingContact(existing, undefined, 'DPATTERSON72@GMAIL.COM');
  assert.ok(matchByEmail);
  assert.equal(matchByEmail.id, 'cnt_david_123');
});

test('ingestVoiceLead creates Lead, Contact, and Activity with Arb-E user', () => {
  const payload: VoiceLeadIntakePayload = {
    callType: 'VOICEMAIL',
    callerPhone: '(706) 555-0144',
    clientName: 'David Patterson',
    email: 'dpatterson72@gmail.com',
    address: '412 River Road, Columbus, GA 31904',
    serviceType: 'Emergency',
    urgency: 'Emergency',
    rawTranscript: "Hi, this is David Patterson at 412 River Road. Storm cracked a massive oak resting on garage.",
    aiSummary: "Emergency storm damage: Heavy oak limb resting on garage.",
    treeSpecies: ['Southern Red Oak'],
    treeCount: 1,
    hazards: {
      overhead: true,
      structures: true,
    },
    accessNotes: 'Gate latch on left side of driveway',
  };

  const result = ingestVoiceLead(payload, [], [], []);

  assert.equal(result.isNewContact, true);
  assert.ok(result.leadId.startsWith('LEAD-VOICE-'));
  assert.equal(result.updatedLeads.length, 1);
  assert.equal(result.updatedLeads[0].clientName, 'David Patterson');
  assert.equal(result.updatedLeads[0].serviceType, 'Emergency');
  assert.equal(result.updatedContacts.length, 1);
  assert.equal(result.updatedContacts[0].userId, 'Arb-E Voice Agent');
  assert.equal(result.updatedActivities.length, 1);
  assert.equal(result.updatedActivities[0].user, 'Arb-E Voice Agent');
});
