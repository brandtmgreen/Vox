import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  createInitialCallState, 
  processCustomerCallTurn, 
  convertCallToVoiceLead 
} from './arborConversationEngine';

test('createInitialCallState initializes with greeting and phone', () => {
  const state = createInitialCallState('(706) 555-0144');
  assert.equal(state.phone, '(706) 555-0144');
  assert.equal(state.step, 'greeting');
  assert.equal(state.isEmergency, false);
  assert.equal(state.percentComplete, 15);
});

test('processCustomerCallTurn extracts name and address', () => {
  const state = createInitialCallState('(706) 555-0144');
  const result = processCustomerCallTurn(
    "Hi, this is David Patterson at 412 River Road in Columbus.",
    state
  );

  assert.equal(result.updatedState.clientName, 'David Patterson');
  assert.ok(result.updatedState.address?.includes('412 River Road'));
  assert.ok(result.updatedState.percentComplete > state.percentComplete);
});

test('processCustomerCallTurn immediately triggers ANSI Z133 safety warning for power lines', () => {
  const state = createInitialCallState('(706) 555-0144');
  state.clientName = 'David Patterson';
  state.address = '412 River Road, Columbus, GA';

  const result = processCustomerCallTurn(
    "A massive oak limb snapped and is hanging directly over our power drop and touching the wires!",
    state
  );

  assert.equal(result.isEmergencyAlert, true);
  assert.equal(result.updatedState.hazards.overhead, true);
  assert.equal(result.updatedState.isEmergency, true);
  assert.equal(result.updatedState.urgency, 'Emergency');
  assert.ok(result.arbEReply.includes('35 feet'));
  assert.ok(result.arbEReply.includes('Georgia Power or Alabama Power'));
});

test('processCustomerCallTurn reaches confirmed step when all data is gathered', () => {
  let state = createInitialCallState('(706) 555-0188');
  state.clientName = 'Sarah Jenkins';
  state.address = '1420 Wynnton Rd, Columbus, GA';
  state.serviceType = 'Pruning';
  state.treeSpecies = ['Live Oak'];
  state.treeCount = 3;
  state.hazards.structures = true;

  const result = processCustomerCallTurn(
    "Driveway is wide open, no gate, no pets. Looking for someone tomorrow morning.",
    state
  );

  assert.equal(result.updatedState.step, 'confirmed');
  assert.equal(result.updatedState.percentComplete, 100);
  assert.ok(result.arbEReply.includes('Tree-mendous!'));

  const leadPayload = convertCallToVoiceLead(result.updatedState, "Full transcript of Sarah's call");
  assert.equal(leadPayload.clientName, 'Sarah Jenkins');
  assert.equal(leadPayload.callType, 'INBOUND_CALL');
  assert.equal(leadPayload.serviceType, 'Pruning');
});
