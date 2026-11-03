import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Dog, 
  Key, 
  Zap, 
  Voicemail as VoicemailIcon, 
  ShieldAlert, 
  ArrowUpRight 
} from 'lucide-react';
import { Contact, Voicemail } from '../types/crm';
import { ArbEAvatar } from './GreenTreeLogos';

interface ContactsViewProps {
  contacts: Contact[];
  voicemails: Voicemail[];
  onSelectVoicemail: (vmId: string) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  voicemails,
  onSelectVoicemail,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchQ = 
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.serviceAddress || '').toLowerCase().includes(q);

    if (q && !matchQ) return false;
    if (typeFilter !== 'all' && c.customerType !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search GreenTree customer database by name, address, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5FA136]/30 focus:border-[#5FA136]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {['all', 'Residential', 'Commercial', 'Municipal', 'HOA'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                  typeFilter === t
                    ? 'bg-[#376E20] text-white'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                }`}
              >
                {t === 'all' ? 'All Customers' : t}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-stone-500 font-semibold">
          {filteredContacts.length} GreenTree Client Profiles
        </div>
      </div>

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            onClick={() => setSelectedContact(contact)}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-[#5FA136] transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#376E20] text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#4D2809] text-sm group-hover:text-[#376E20] transition-colors">
                      {contact.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-medium">{contact.customerType || 'Residential'} Client</p>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  contact.status === 'Emergency Priority'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-[#5FA136]/15 text-[#376E20] border-[#5FA136]/30'
                }`}>
                  {contact.status || 'Active Lead'}
                </span>
              </div>

              {/* Address & Phone */}
              <div className="space-y-1.5 text-xs text-stone-600 mb-3 bg-[#F9FAF6] p-3 rounded-xl border border-stone-100">
                <div className="flex items-center gap-2 text-stone-900 font-semibold truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#376E20] shrink-0" />
                  <span className="truncate">{contact.serviceAddress || 'Columbus, GA'}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{contact.phone}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </div>
              </div>

              {/* Special Site Warnings (Pets, Gate, Hazard) */}
              <div className="space-y-1.5 mb-3 text-xs">
                {contact.petAlerts && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    <Dog className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">{contact.petAlerts}</span>
                  </div>
                )}
                {contact.hazardAlerts && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-800 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
                    <Zap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span className="truncate">{contact.hazardAlerts}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="flex items-center gap-1 font-medium">
                <ArbEAvatar className="w-4 h-4" />
                <span>{contact.userId || 'Arb-E Voice Agent'}</span>
              </span>
              <span className="font-mono text-[11px] text-[#376E20] font-bold">
                {contact.totalInquiries || 1} Voice Inquiries
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Contact Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-stone-100 bg-[#F9FAF6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#376E20] text-white font-black text-base flex items-center justify-center">
                  {selectedContact.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-[#4D2809] text-base">{selectedContact.name}</h3>
                  <p className="text-xs text-stone-500">{selectedContact.customerType} • Ingested by {selectedContact.userId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div><strong>Service Address:</strong> {selectedContact.serviceAddress}</div>
                <div><strong>Phone:</strong> {selectedContact.phone}</div>
                <div><strong>Email:</strong> {selectedContact.email}</div>
                {selectedContact.specialInstructions && (
                  <div><strong>Special Instructions:</strong> {selectedContact.specialInstructions}</div>
                )}
                {selectedContact.hazardAlerts && (
                  <div className="text-rose-700"><strong>Safety Hazard Alert:</strong> {selectedContact.hazardAlerts}</div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-[#4D2809] text-xs uppercase tracking-wide mb-2">Caller Notes</h4>
                <div className="p-3 rounded-xl bg-[#F9FAF6] border border-stone-200 whitespace-pre-wrap leading-relaxed text-stone-700">
                  {selectedContact.notes || 'No prior notes recorded.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
