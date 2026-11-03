import React from 'react';

/**
 * GreenTree Modern Canopy Icon (Standard 24x24 / Scaleable)
 * Exact SVG from Section 1.A of VOICE_AI_INTEGRATION_SPEC_e34f9f9d.md
 */
export const GreenTreeCanopyIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#5FA136" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" stroke="#376E20" strokeWidth="1.5" fill="#5FA136" fillOpacity="0.1"/>
    <path d="M12 18V12M12 12C12 12 15 10 16 8M12 12C12 12 9 10 8 8" stroke="#4D2809" strokeWidth="2"/>
    <circle cx="12" cy="7" r="3.5" fill="#5FA136"/>
    <circle cx="8" cy="9" r="2.5" fill="#A8D672"/>
    <circle cx="16" cy="9" r="2.5" fill="#376E20"/>
  </svg>
);

/**
 * Full GreenTree Brand Badge with Typography & Arb-E Monkey Ear Peek (SVG)
 * Exact SVG from Section 1.B of VOICE_AI_INTEGRATION_SPEC_e34f9f9d.md
 */
export const GreenTreeBrandBadge: React.FC<{ className?: string }> = ({ className = 'h-11 w-auto' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 320 80" 
    fill="none" 
    className={className}
    aria-label="GreenTree Arboriculture Brand Badge"
  >
    {/* Rounded Brand Shield */}
    <rect x="4" y="4" width="72" height="72" rx="18" fill="#376E20" />
    
    {/* Tree & Canopy Graphic */}
    <circle cx="40" cy="34" r="18" fill="#5FA136" />
    <circle cx="28" cy="38" r="12" fill="#A8D672" />
    <circle cx="52" cy="38" r="12" fill="#5FA136" />
    <path d="M40 56 V36 M40 44 L48 36 M40 44 L32 36" stroke="#4D2809" strokeWidth="4" strokeLinecap="round"/>
    
    {/* Arb-E Monkey Ear Peek */}
    <circle cx="23" cy="23" r="5" fill="#D4AF37" stroke="#4D2809" strokeWidth="1.5"/>

    {/* Typography */}
    <text x="92" y="38" fontFamily="system-ui, -apple-system, sans-serif" fontSize="26" fontWeight="900" fill="#4D2809" letterSpacing="-0.5">GREENTREE</text>
    <text x="94" y="56" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fontWeight="800" fill="#5FA136" letterSpacing="4">ARBORICULTURE</text>
    <text x="94" y="70" fontFamily="system-ui, -apple-system, sans-serif" fontSize="9" fontWeight="600" fill="#A8D672">OPERATIONS &amp; CRM NETWORK</text>
  </svg>
);

/**
 * Arb-E 🐒 Mascot Badge
 */
export const ArbEAvatar: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <div className={`rounded-xl bg-gradient-to-tr from-[#376E20] to-[#5FA136] text-white flex items-center justify-center font-bold shadow-xs relative ${className}`}>
    <span className="text-base select-none">🐒</span>
    <span className="absolute -bottom-1 -right-1 text-[9px] bg-[#D4AF37] text-[#4D2809] font-black px-1 rounded-full border border-white leading-tight">
      ISA
    </span>
  </div>
);
