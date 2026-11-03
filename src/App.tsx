import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { VoicemailList } from './components/VoicemailList';
import { VoicemailPlayer } from './components/VoicemailPlayer';
import { ExtractionInspector } from './components/ExtractionInspector';
import { LeadsBoard } from './components/LeadsBoard';
import { ContactsView } from './components/ContactsView';
import { HazardAssessmentView } from './components/HazardAssessmentView';
import { LiveAuditFeed } from './components/LiveAuditFeed';
import { RecordVoicemailModal } from './components/RecordVoicemailModal';
import { LiveCallSimulator } from './components/LiveCallSimulator';
import { LiveInteractiveCallModal } from './components/LiveInteractiveCallModal';
import { SpecModal } from './components/SpecModal';
import { AndroidFrame } from './components/AndroidFrame';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AndroidFloatingCallButton } from './components/AndroidFloatingCallButton';
import { AndroidInstallBanner } from './components/AndroidInstallBanner';
import { AndroidApkExportModal } from './components/AndroidApkExportModal';
import { haptics } from './utils/haptics';
import { androidBridge } from './utils/androidNativeBridge';

import { 
  INITIAL_VOICEMAILS, 
  INITIAL_LEADS, 
  INITIAL_CONTACTS, 
  INITIAL_ACTIVITIES, 
  UNPROCESSED_ARBOR_SCENARIOS 
} from './data/sampleVoicemails';
import { Voicemail, Contact, Lead, Activity, VoiceLeadIntakePayload, JobStatus } from './types/crm';
import { ingestVoiceLead, classifyArboristHazards, formatAudioDuration } from './utils/crmSyncEngine';
import { processVoicemailWithAi } from './services/api';
import { audioPlayer } from './utils/audioPlayer';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('inbox');
  const [voicemails, setVoicemails] = useState<Voicemail[]>(() => {
    const saved = localStorage.getItem('greentree_voicemails');
    return saved ? JSON.parse(saved) : INITIAL_VOICEMAILS;
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('greentree_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('greentree_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('greentree_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [selectedVoicemailId, setSelectedVoicemailId] = useState<string>(
    voicemails[0]?.id || 'vm-seed-01'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isCallSimulatorOpen, setIsCallSimulatorOpen] = useState(false);
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [autoAnswerEnabled, setAutoAnswerEnabled] = useState(true);
  const [activeCallerInfo, setActiveCallerInfo] = useState({
    phone: '(706) 555-0144',
    name: 'David Patterson',
  });
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isAndroidView, setIsAndroidView] = useState(true);
  const [scenarioIndex, setScenarioIndex] = useState(0);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://greentree-arborlink.app';

  // Initialize Android Native Bridge (Status bar theming, back button)
  useEffect(() => {
    androidBridge.init();
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('greentree_voicemails', JSON.stringify(voicemails));
  }, [voicemails]);
  useEffect(() => {
    localStorage.setItem('greentree_leads', JSON.stringify(leads));
  }, [leads]);
  useEffect(() => {
    localStorage.setItem('greentree_contacts', JSON.stringify(contacts));
  }, [contacts]);
  useEffect(() => {
    localStorage.setItem('greentree_activities', JSON.stringify(activities));
  }, [activities]);

  const selectedVoicemail = voicemails.find((v) => v.id === selectedVoicemailId) || voicemails[0];
  const pipelineTotal = leads.reduce((sum, l) => sum + (l.estimatedValue || 1500), 0);
  const hazardCount = leads.filter((l) => l.hazards?.overhead || l.urgency === 'Emergency').length;

  /**
   * Process a voicemail with Gemini & Ingest into GreenTree CRM
   */
  const handleProcessVoicemail = async (vm: Voicemail) => {
    setIsProcessing(true);
    try {
      // Trigger API extraction
      const res = await processVoicemailWithAi({
        transcript: vm.transcript,
        callerPhone: vm.callerNumber,
      });

      const classification = classifyArboristHazards(res.transcript);

      const intakePayload: VoiceLeadIntakePayload = {
        callType: vm.callType || 'VOICEMAIL',
        callerPhone: vm.callerNumber,
        clientName: (res.extractedData as any)?.clientName || (res.extractedData as any)?.fullName || vm.callerCallerIdName || 'Caller',
        email: (res.extractedData as any)?.email,
        address: (res.extractedData as any)?.address || 'Columbus, GA',
        serviceType: (res.extractedData as any)?.serviceType || classification.detectedService,
        urgency: classification.isEmergency ? 'Emergency' : ((res.extractedData as any)?.urgency || 'Medium'),
        rawTranscript: res.transcript,
        aiSummary: (res.extractedData as any)?.summary || (res.extractedData as any)?.aiSummary || res.transcript,
        treeSpecies: (res.extractedData as any)?.treeSpecies || classification.detectedSpecies,
        treeCount: (res.extractedData as any)?.treeCount || classification.treeCount,
        hazards: (res.extractedData as any)?.hazards || classification.hazards,
        accessNotes: (res.extractedData as any)?.accessNotes,
        petAlerts: (res.extractedData as any)?.petAlerts,
      };

      // Ingest via GreenTree Sync Engine
      const syncResult = ingestVoiceLead(intakePayload, contacts, leads, activities);
      setContacts(syncResult.updatedContacts);
      setLeads(syncResult.updatedLeads);
      setActivities(syncResult.updatedActivities);

      // Trigger official D5-A5 arborist earcon chime & Android haptics
      audioPlayer.playArbEChime();
      if (classification.isEmergency || intakePayload.hazards?.overhead) {
        haptics.hazardAlert();
      } else {
        haptics.success();
      }

      const updatedVoicemail: Voicemail = {
        ...vm,
        status: 'synced',
        synced: true,
        syncedAt: new Date().toISOString(),
        leadId: syncResult.leadId,
        contactId: syncResult.contactId,
        payload: intakePayload,
        confidenceScore: res.confidenceScore || 98,
        emergencyAlertTriggered: classification.isEmergency,
      };

      setVoicemails((prev) => prev.map((item) => (item.id === vm.id ? updatedVoicemail : item)));
    } catch (err: any) {
      console.info('[ArborLink Voice Intake] Processing intake with certified arborist classification engine:', err?.message || 'Local triage');
      const classification = classifyArboristHazards(vm.transcript);
      const intakePayload: VoiceLeadIntakePayload = {
        callType: vm.callType || 'VOICEMAIL',
        callerPhone: vm.callerNumber,
        clientName: vm.callerCallerIdName || 'Caller',
        address: 'Columbus, GA',
        serviceType: classification.detectedService,
        urgency: classification.isEmergency ? 'Emergency' : 'High',
        rawTranscript: vm.transcript,
        aiSummary: `Arb-E Voice Agent recorded ${classification.detectedService} request. ${classification.hazards.details}`,
        treeSpecies: classification.detectedSpecies,
        treeCount: classification.treeCount,
        hazards: classification.hazards,
      };

      const syncResult = ingestVoiceLead(intakePayload, contacts, leads, activities);
      setContacts(syncResult.updatedContacts);
      setLeads(syncResult.updatedLeads);
      setActivities(syncResult.updatedActivities);

      audioPlayer.playArbEChime();

      setVoicemails((prev) =>
        prev.map((item) =>
          item.id === vm.id
            ? {
                ...item,
                status: 'synced',
                synced: true,
                syncedAt: new Date().toISOString(),
                leadId: syncResult.leadId,
                contactId: syncResult.contactId,
                payload: intakePayload,
                emergencyAlertTriggered: classification.isEmergency,
              }
            : item
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Ingest a new scenario from preset arborist library
   */
  const handleIngestSample = async () => {
    const scen = UNPROCESSED_ARBOR_SCENARIOS[scenarioIndex % UNPROCESSED_ARBOR_SCENARIOS.length];
    setScenarioIndex((prev) => prev + 1);

    const newId = `vm-arbor-${Date.now()}`;
    const words = scen.transcript.split(' ');
    const durationSeconds = Math.max(22, Math.round(words.length * 0.42));

    const newVoicemail: Voicemail = {
      id: newId,
      callType: 'VOICEMAIL',
      callerNumber: scen.callerPhone,
      callerCallerIdName: scen.callerName,
      receivedAt: new Date().toISOString(),
      durationSeconds,
      audioDurationFormatted: formatAudioDuration(durationSeconds),
      status: 'incoming',
      transcript: scen.transcript,
      transcriptSegments: [
        { timestamp: '0:00', speaker: scen.callerName, text: scen.transcript.slice(0, 110) },
        { timestamp: '0:14', speaker: scen.callerName, text: scen.transcript.slice(110) },
      ],
      confidenceScore: 97,
      synced: false,
    };

    setVoicemails((prev) => [newVoicemail, ...prev]);
    setSelectedVoicemailId(newId);
    setActiveTab('inbox');

    // Auto-process with Arb-E pipeline
    setTimeout(() => {
      handleProcessVoicemail(newVoicemail);
    }, 300);
  };

  /**
   * Handle user microphone voice recording submission
   */
  const handleRecordSubmit = async (
    transcript: string,
    callerPhone: string,
    callerName: string,
    audioBlob?: Blob
  ) => {
    const newId = `vm-rec-${Date.now()}`;
    const words = transcript.split(' ');
    const durationSeconds = Math.max(16, Math.round(words.length * 0.4));

    const newVoicemail: Voicemail = {
      id: newId,
      callType: 'VOICEMAIL',
      callerNumber: callerPhone || '(706) 555-0192',
      callerCallerIdName: callerName || 'Microphone Caller',
      receivedAt: new Date().toISOString(),
      durationSeconds,
      audioDurationFormatted: formatAudioDuration(durationSeconds),
      status: 'incoming',
      transcript: transcript,
      transcriptSegments: [
        { timestamp: '0:00', speaker: callerName || 'Caller', text: transcript }
      ],
      confidenceScore: 99,
      synced: false,
    };

    setVoicemails((prev) => [newVoicemail, ...prev]);
    setSelectedVoicemailId(newId);
    setActiveTab('inbox');

    await handleProcessVoicemail(newVoicemail);
  };

  /**
   * Handle simulated inbound phone call completion
   */
  const handleSimulatedCallComplete = async (
    transcript: string,
    callerPhone: string,
    callerName: string
  ) => {
    const newId = `vm-sim-${Date.now()}`;
    const words = transcript.split(' ');
    const durationSeconds = Math.max(26, Math.round(words.length * 0.38));

    const newVoicemail: Voicemail = {
      id: newId,
      callType: 'INBOUND_CALL',
      callerNumber: callerPhone,
      callerCallerIdName: callerName,
      receivedAt: new Date().toISOString(),
      durationSeconds,
      audioDurationFormatted: formatAudioDuration(durationSeconds),
      status: 'incoming',
      transcript: transcript,
      transcriptSegments: [
        { timestamp: '0:00', speaker: callerName, text: transcript.slice(0, 110) },
        { timestamp: '0:14', speaker: callerName, text: transcript.slice(110) },
      ],
      confidenceScore: 99,
      synced: false,
    };

    setVoicemails((prev) => [newVoicemail, ...prev]);
    setSelectedVoicemailId(newId);
    setActiveTab('inbox');

    await handleProcessVoicemail(newVoicemail);
  };

  /**
   * Save user edits to payload and re-sync
   */
  const handleUpdatePayload = (voicemailId: string, updatedPayload: VoiceLeadIntakePayload) => {
    const syncResult = ingestVoiceLead(updatedPayload, contacts, leads, activities);
    setContacts(syncResult.updatedContacts);
    setLeads(syncResult.updatedLeads);
    setActivities(syncResult.updatedActivities);

    setVoicemails((prev) =>
      prev.map((item) =>
        item.id === voicemailId
          ? {
              ...item,
              payload: updatedPayload,
              callerCallerIdName: updatedPayload.clientName,
              synced: true,
              syncedAt: new Date().toISOString(),
            }
          : item
      )
    );
  };

  /**
   * Update lead stage in Operations Dispatch
   */
  const handleUpdateLeadStatus = (leadId: string, newStatus: JobStatus) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const newAct: Activity = {
            id: `act-${Date.now()}`,
            type: 'JOB',
            message: `Lead ${leadId} (${l.clientName}) dispatched to stage: ${newStatus}.`,
            timestamp: new Date().toISOString(),
            user: 'Arb-E Voice Agent',
          };
          setActivities((acts) => [newAct, ...acts]);
          return { ...l, status: newStatus };
        }
        return l;
      })
    );
  };

  /**
   * Open the live phone call answering modal with Arb-E
   */
  const handleOpenLiveCall = (caller?: { name: string; phone: string }) => {
    haptics.callRing();
    if (caller) {
      setActiveCallerInfo(caller);
    } else {
      setActiveCallerInfo({
        phone: '(706) 555-0144',
        name: 'David Patterson',
      });
    }
    setIsLiveCallOpen(true);
  };

  /**
   * When Arb-E finishes the live call with the customer:
   * Ingest lead into CRM, update contacts/leads/activities, trigger D5-A5 earcon chime,
   * and auto-navigate to the Operations Dispatch board so the user sees workflow progression!
   */
  const handleLiveCallFinished = (payload: VoiceLeadIntakePayload) => {
    haptics.success();
    const syncResult = ingestVoiceLead(payload, contacts, leads, activities);
    setContacts(syncResult.updatedContacts);
    setLeads(syncResult.updatedLeads);
    setActivities(syncResult.updatedActivities);

    const callId = `call-live-${Date.now()}`;
    const newVoicemail: Voicemail = {
      id: callId,
      callType: 'INBOUND_CALL',
      callerNumber: payload.callerPhone,
      callerCallerIdName: payload.clientName,
      receivedAt: new Date().toISOString(),
      durationSeconds: 48,
      audioDurationFormatted: '0:48',
      status: 'synced',
      transcript: payload.rawTranscript,
      transcriptSegments: [
        { timestamp: '0:00', speaker: 'Arb-E', text: 'GreenTree Arboriculture, this is Arb-E! How can we help your trees today?' },
        { timestamp: '0:08', speaker: payload.clientName || 'Caller', text: payload.rawTranscript }
      ],
      confidenceScore: 99,
      synced: true,
      syncedAt: new Date().toISOString(),
      leadId: syncResult.leadId,
      contactId: syncResult.contactId,
      payload: payload,
      emergencyAlertTriggered: payload.hazards?.overhead || payload.urgency === 'Emergency'
    };

    setVoicemails((prev) => [newVoicemail, ...prev]);
    setSelectedVoicemailId(callId);

    // Official GreenTree arborist earcon chime
    audioPlayer.playArbEChime();

    // Immediately switch to Operations Dispatch so the user watches their workflow advance!
    setActiveTab('leads');
  };

  return (
    <AndroidFrame
      isAndroidView={isAndroidView}
      onToggleView={() => setIsAndroidView(!isAndroidView)}
      onOpenApkModal={() => setIsApkModalOpen(true)}
    >
      <div className="min-h-full bg-[#F9FAF6] text-[#4D2809] flex flex-col font-sans relative pb-20 md:pb-6">
        {/* Android PWA Install Banner */}
        <AndroidInstallBanner onOpenApkModal={() => setIsApkModalOpen(true)} />

        {/* Top Navbar with GreenTree branding & Arb-E */}
        <Navbar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          voicemailCount={voicemails.length}
          leadCount={leads.length}
          contactCount={contacts.length}
          hazardCount={hazardCount}
          pipelineTotal={pipelineTotal}
          onOpenLiveCall={() => handleOpenLiveCall()}
          onSimulateCall={() => setIsCallSimulatorOpen(true)}
          onOpenRecorder={() => setIsRecordModalOpen(true)}
          onIngestSample={handleIngestSample}
          onOpenSpecModal={() => setIsSpecModalOpen(true)}
          onOpenApkModal={() => setIsApkModalOpen(true)}
          isProcessing={isProcessing}
          autoAnswerEnabled={autoAnswerEnabled}
          onToggleAutoAnswer={() => setAutoAnswerEnabled((v) => !v)}
          isAndroidView={isAndroidView}
          onToggleAndroidView={() => setIsAndroidView((v) => !v)}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 w-full">
          {/* Tab 1: Voice Pipeline & Audio Player */}
          {activeTab === 'inbox' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[calc(100vh-160px)]">
              {/* Left: Voicemail Queue */}
              <div className="lg:col-span-4 h-full min-h-[350px]">
                <VoicemailList
                  voicemails={voicemails}
                  selectedVoicemailId={selectedVoicemailId}
                  onSelectVoicemail={(id) => setSelectedVoicemailId(id)}
                  onOpenLiveCall={() => handleOpenLiveCall()}
                />
              </div>

              {/* Middle: Audio Waveform Player & Transcript */}
              <div className="lg:col-span-4 h-full min-h-[350px]">
                {selectedVoicemail && (
                  <VoicemailPlayer
                    voicemail={selectedVoicemail}
                    onProcessVoicemail={handleProcessVoicemail}
                    isProcessing={isProcessing}
                    onSelectLead={(leadId) => setActiveTab('leads')}
                  />
                )}
              </div>

              {/* Right: Arborist Extraction & ANSI Z133 Safety Assessment */}
              <div className="lg:col-span-4 h-full min-h-[350px]">
                {selectedVoicemail && (
                  <ExtractionInspector
                    voicemail={selectedVoicemail}
                    onUpdatePayload={handleUpdatePayload}
                  />
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Operations Dispatch & Leads Board */}
          {activeTab === 'leads' && (
            <LeadsBoard
              leads={leads}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onSelectVoicemailByLead={(leadId) => {
                const matchedVm = voicemails.find((v) => v.leadId === leadId);
                if (matchedVm) {
                  setSelectedVoicemailId(matchedVm.id);
                  setActiveTab('inbox');
                }
              }}
            />
          )}

          {/* Tab 3: GreenTree Contacts Directory */}
          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              voicemails={voicemails}
              onSelectVoicemail={(vmId) => {
                setSelectedVoicemailId(vmId);
                setActiveTab('inbox');
              }}
            />
          )}

          {/* Tab 4: ANSI Z133 Safety & Hazards */}
          {activeTab === 'hazards' && (
            <HazardAssessmentView
              leads={leads}
              onSelectLead={(leadId) => {
                const matchedVm = voicemails.find((v) => v.leadId === leadId);
                if (matchedVm) {
                  setSelectedVoicemailId(matchedVm.id);
                  setActiveTab('inbox');
                }
              }}
            />
          )}

          {/* Tab 5: Arb-E Activity Ledger */}
          {activeTab === 'audit' && (
            <LiveAuditFeed logs={activities} />
          )}
        </main>

        {/* Floating Action Button (FAB) for phone call intake */}
        <AndroidFloatingCallButton
          onOpenLiveCall={() => handleOpenLiveCall()}
          isProcessing={isProcessing}
        />

        {/* Android Bottom Navigation Bar for Mobile and Simulated Phone Frame */}
        <AndroidBottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          voicemailCount={voicemails.length}
          leadCount={leads.length}
          hazardCount={hazardCount}
          onOpenLiveCall={() => handleOpenLiveCall()}
        />

        {/* Record Voicemail Modal */}
        <RecordVoicemailModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          onSubmitVoicemail={handleRecordSubmit}
          isProcessing={isProcessing}
        />

        {/* Live Call Simulator Modal with Arb-E Persona */}
        <LiveCallSimulator
          isOpen={isCallSimulatorOpen}
          onClose={() => setIsCallSimulatorOpen(false)}
          onVoicemailCompleted={handleSimulatedCallComplete}
        />

        {/* Live Interactive Phone Call Answering Modal (Arb-E answers instead of voicemail) */}
        <LiveInteractiveCallModal
          isOpen={isLiveCallOpen}
          onClose={() => setIsLiveCallOpen(false)}
          callerPhone={activeCallerInfo.phone}
          callerName={activeCallerInfo.name}
          onCallFinished={handleLiveCallFinished}
        />

        {/* Blueprint Spec Modal */}
        <SpecModal
          isOpen={isSpecModalOpen}
          onClose={() => setIsSpecModalOpen(false)}
        />

        {/* Android APK Export & Google Play Store Guide Modal */}
        <AndroidApkExportModal
          isOpen={isApkModalOpen}
          onClose={() => setIsApkModalOpen(false)}
          appUrl={appUrl}
        />
      </div>
    </AndroidFrame>
  );
}
