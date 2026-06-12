import React from 'react';
import { User, Check } from 'lucide-react';

// Definitions for the 10 avatars with descriptive labels and premium background gradients
export const AVATARS = [
  { id: 'avatar_1', name: 'Dr. Alex (Cardiology)', gradient: 'from-blue-500 to-indigo-700', text: 'AC', desc: 'Male Doctor, Blue theme' },
  { id: 'avatar_2', name: 'Dr. Sarah (Pediatrics)', gradient: 'from-teal-400 to-emerald-600', text: 'SP', desc: 'Female Doctor, Teal theme' },
  { id: 'avatar_3', name: 'Nurse Michael (ER)', gradient: 'from-purple-500 to-indigo-700', text: 'MN', desc: 'Male Nurse, Purple theme' },
  { id: 'avatar_4', name: 'Nurse Emily (Outpatient)', gradient: 'from-pink-500 to-rose-600', text: 'EN', desc: 'Female Nurse, Pink theme' },
  { id: 'avatar_5', name: 'Dr. James (Surgeon)', gradient: 'from-emerald-500 to-teal-700', text: 'JS', desc: 'Male Surgeon, Emerald theme' },
  { id: 'avatar_6', name: 'Dr. Sophia (Ophthalmology)', gradient: 'from-indigo-500 to-violet-700', text: 'SO', desc: 'Female Surgeon, Indigo theme' },
  { id: 'avatar_7', name: 'Dr. Robert (Orthopedics)', gradient: 'from-amber-500 to-orange-600', text: 'RO', desc: 'Pediatrician, Amber theme' },
  { id: 'avatar_8', name: 'Dr. Lisa (Dentistry)', gradient: 'from-cyan-400 to-blue-600', text: 'LD', desc: 'Therapist, Cyan theme' },
  { id: 'avatar_9', name: 'Dr. David (Psychiatry)', gradient: 'from-fuchsia-500 to-pink-700', text: 'DD', desc: 'Pharmacist, Fuchsia theme' },
  { id: 'avatar_10', name: 'Dr. Chloe (Emergency Care)', gradient: 'from-red-500 to-rose-600', text: 'CC', desc: 'GP Practitioner, Red theme' }
];

export const HealthAvatar = ({ avatarId, className = "w-10 h-10", initials = "" }) => {
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  // Map avatar ID to a specific healthcare icon SVG overlay
  const renderAvatarContent = () => {
    switch (avatarId) {
      case 'avatar_1': // Stethoscope & Doctor
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M50 50v8c0 3 2 5 5 5h3c2 0 4 2 4 4v3" stroke="white" strokeWidth="2" />
            <circle cx="62" cy="74" r="5" stroke="white" strokeWidth="2" fill="#3b82f6" />
          </svg>
        );
      case 'avatar_2': // Pediatrics / Family care
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a10 10 0 100-20 10 10 0 000 20zM25 78c0-8 8-15 25-15s25 7 25 15" />
            <path d="M45 48c0 6 5 10 10 10s10-4 10-10" />
            <circle cx="50" cy="50" r="1.5" fill="white" />
            <path d="M35 78s3-10 8-10 8 10 8 10" stroke="white" strokeWidth="2" />
          </svg>
        );
      case 'avatar_3': // ER Staff / Mask
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="35" r="12" />
            <rect x="42" y="38" width="16" height="10" rx="2" fill="white" stroke="white" strokeWidth="1" />
            <path d="M42 41l-5-2M58 41l5-2" />
            <path d="M22 80c0-12 11-20 28-20s28 8 28 20" />
          </svg>
        );
      case 'avatar_4': // Cap / Nurse
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M40 18h20l4 6H36l4-6z" fill="white" stroke="white" />
            <path d="M50 20v4M48 22h4" stroke="red" strokeWidth="1.5" />
          </svg>
        );
      case 'avatar_5': // Surgeon
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="35" r="12" fill="white" fillOpacity="0.2" />
            <path d="M38 28c3-4 7-6 12-6s9 2 12 6M36 32h28" stroke="white" />
            <rect x="44" y="37" width="12" height="7" rx="1.5" fill="white" />
            <path d="M22 80c0-10 10-18 28-18s28 8 28 18" />
          </svg>
        );
      case 'avatar_6': // Eyewear Surgeon
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="35" r="12" />
            <path d="M40 33h20M42 35a3 3 0 11-6 0 3 3 0 016 0zm22 0a3 3 0 11-6 0 3 3 0 016 0z" stroke="white" strokeWidth="2" />
            <path d="M22 80c0-10 10-18 28-18s28 8 28 18" />
          </svg>
        );
      case 'avatar_7': // Heart / Care
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M50 64l-4 4c-1.5-1.5-3-3-3-4.5 0-1.5 1-2.5 2.5-2.5 1 0 1.5.5 2 1 .5-.5 1-1 2-1 1.5 0 2.5 1 2.5 2.5 0 1.5-1.5 3-3 4.5l-4-4z" fill="red" stroke="red" strokeWidth="1" />
          </svg>
        );
      case 'avatar_8': // Brain / Therapy
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M47 25c-2 0-3 1.5-3 3s1 2.5 3 2.5h6c2 0 3-1 3-2.5s-1-3-3-3h-3z" stroke="white" strokeWidth="1.5" />
          </svg>
        );
      case 'avatar_9': // Pharmacy / Lab coat
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <rect x="46" y="66" width="8" height="12" rx="4" fill="white" stroke="white" strokeWidth="1.5" />
          </svg>
        );
      case 'avatar_10': // GP shield
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M50 63s6 2 6 6-6 6-6 6-6-2-6-6 6-6 6-6z" stroke="white" strokeWidth="1.5" />
          </svg>
        );
      default:
        return <User className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className={`${className} rounded-full bg-gradient-to-br ${avatar.gradient} p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0`}>
      <div className="w-full h-full rounded-full flex items-center justify-center relative overflow-hidden bg-slate-950/10">
        {renderAvatarContent()}
        {initials && (
          <span className="absolute bottom-0 right-0 bg-slate-900 border border-slate-700 text-[8px] font-black px-1 py-0.2 rounded text-white uppercase tracking-tighter">
            {initials.slice(0, 2)}
          </span>
        )}
      </div>
    </div>
  );
};

export const AvatarPicker = ({ selectedId, onSelect }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-750">
        <HealthAvatar avatarId={selectedId} className="w-16 h-16" />
        <div>
          <h4 className="text-sm font-bold text-white">Avatar Preview</h4>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            {AVATARS.find(a => a.id === selectedId)?.name || 'Default Avatar'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {AVATARS.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.id)}
              className={`relative p-1 rounded-full cursor-pointer hover:scale-105 hover:rotate-2 transition-all duration-200 border-2 ${
                isSelected ? 'border-emerald-500 scale-105 bg-slate-800' : 'border-transparent'
              }`}
              title={avatar.name}
            >
              <HealthAvatar avatarId={avatar.id} className="w-12 h-12" />
              {isSelected && (
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-0.5 border border-slate-900">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={4} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
