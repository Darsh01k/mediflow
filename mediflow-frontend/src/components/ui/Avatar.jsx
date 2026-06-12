import React from 'react';
import { User, Check } from 'lucide-react';

// Separate Avatar Collections (5 items each)
export const PATIENT_AVATARS = [
  { id: 'patient_1', gradient: 'from-sky-400 to-blue-600', text: 'P1' },
  { id: 'patient_2', gradient: 'from-emerald-400 to-teal-500', text: 'P2' },
  { id: 'patient_3', gradient: 'from-purple-400 to-indigo-650', text: 'P3' },
  { id: 'patient_4', gradient: 'from-pink-400 to-rose-500', text: 'P4' },
  { id: 'patient_5', gradient: 'from-amber-400 to-orange-500', text: 'P5' },
];

export const DOCTOR_AVATARS = [
  { id: 'doctor_1', gradient: 'from-blue-500 to-indigo-700', text: 'D1' },
  { id: 'doctor_2', gradient: 'from-teal-500 to-emerald-600', text: 'D2' },
  { id: 'doctor_3', gradient: 'from-emerald-500 to-teal-700', text: 'D3' },
  { id: 'doctor_4', gradient: 'from-indigo-500 to-violet-700', text: 'D4' },
  { id: 'doctor_5', gradient: 'from-red-500 to-rose-600', text: 'D5' },
];

export const HOSPITAL_AVATARS = [
  { id: 'hospital_1', gradient: 'from-blue-600 to-sky-800', text: 'H1' },
  { id: 'hospital_2', gradient: 'from-emerald-600 to-teal-800', text: 'H2' },
  { id: 'hospital_3', gradient: 'from-violet-600 to-indigo-800', text: 'H3' },
  { id: 'hospital_4', gradient: 'from-amber-500 to-yellow-600', text: 'H4' },
  { id: 'hospital_5', gradient: 'from-rose-600 to-red-800', text: 'H5' },
];

// Unified list containing active and legacy aliases for 100% backward database compatibility
export const AVATARS = [
  ...PATIENT_AVATARS.map(a => ({ ...a, category: 'PATIENT' })),
  ...DOCTOR_AVATARS.map(a => ({ ...a, category: 'DOCTOR' })),
  ...HOSPITAL_AVATARS.map(a => ({ ...a, category: 'HOSPITAL' })),

  // Legacy mappings
  { id: 'avatar_1', category: 'DOCTOR', gradient: 'from-blue-500 to-indigo-700', text: 'AC' },
  { id: 'avatar_2', category: 'DOCTOR', gradient: 'from-teal-400 to-emerald-600', text: 'SP' },
  { id: 'avatar_3', category: 'PATIENT', gradient: 'from-purple-500 to-indigo-700', text: 'MN' },
  { id: 'avatar_4', category: 'PATIENT', gradient: 'from-pink-500 to-rose-600', text: 'EN' },
  { id: 'avatar_5', category: 'DOCTOR', gradient: 'from-emerald-500 to-teal-700', text: 'JS' },
  { id: 'avatar_6', category: 'DOCTOR', gradient: 'from-indigo-500 to-violet-700', text: 'SO' },
  { id: 'avatar_7', category: 'PATIENT', gradient: 'from-amber-500 to-orange-600', text: 'RO' },
  { id: 'avatar_8', category: 'PATIENT', gradient: 'from-cyan-400 to-blue-600', text: 'LD' },
  { id: 'avatar_9', category: 'PATIENT', gradient: 'from-fuchsia-500 to-pink-700', text: 'DD' },
  { id: 'avatar_10', category: 'DOCTOR', gradient: 'from-red-500 to-rose-600', text: 'CC' },
];

export const HealthAvatar = ({ avatarId, className = "w-10 h-10", initials = "" }) => {
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];

  // Map avatar ID to a specific SVG overlay graphic
  const renderAvatarContent = () => {
    switch (avatarId) {
      // Patient 1 / Legacy avatar_3
      case 'patient_1':
      case 'avatar_3':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
          </svg>
        );
      
      // Patient 2 / Legacy avatar_4
      case 'patient_2':
      case 'avatar_4':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a11 11 0 100-22 11 11 0 000 22zM25 78c0-8 8-15 25-15s25 7 25 15" />
            <path d="M39 30c0 4 3.5 7 7 7h8c3.5 0 7-3 7-7" stroke="white" strokeWidth="2" />
          </svg>
        );

      // Patient 3 / Legacy avatar_7
      case 'patient_3':
      case 'avatar_7':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M42 33h16M44 35a2 2 0 11-4 0 2 2 0 014 0zm16 0a2 2 0 11-4 0 2 2 0 014 0z" stroke="white" strokeWidth="2" />
          </svg>
        );

      // Patient 4 / Legacy avatar_8
      case 'patient_4':
      case 'avatar_8':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a11 11 0 100-22 11 11 0 000 22zM25 78c0-8 8-15 25-15s25 7 25 15" />
            <path d="M36 28s4-8 14-8 14 8 14 8" stroke="white" strokeWidth="2" />
          </svg>
        );

      // Patient 5 / Legacy avatar_9
      case 'patient_5':
      case 'avatar_9':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M45 68h10M50 63v10" stroke="white" strokeWidth="2" />
          </svg>
        );

      // Doctor 1 / Legacy avatar_1
      case 'doctor_1':
      case 'avatar_1':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M50 50v8c0 3 2 5 5 5h3c2 0 4 2 4 4v3" stroke="white" strokeWidth="2" />
            <circle cx="62" cy="74" r="5" stroke="white" strokeWidth="2" fill="#3b82f6" />
          </svg>
        );

      // Doctor 2 / Legacy avatar_2
      case 'doctor_2':
      case 'avatar_2':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a10 10 0 100-20 10 10 0 000 20zM25 78c0-8 8-15 25-15s25 7 25 15" />
            <path d="M45 48c0 6 5 10 10 10s10-4 10-10" />
            <circle cx="50" cy="50" r="1.5" fill="white" />
            <path d="M35 78s3-10 8-10 8 10 8 10" stroke="white" strokeWidth="2" />
          </svg>
        );

      // Doctor 3 / Legacy avatar_5
      case 'doctor_3':
      case 'avatar_5':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="35" r="12" fill="white" fillOpacity="0.2" />
            <path d="M38 28c3-4 7-6 12-6s9 2 12 6M36 32h28" stroke="white" />
            <rect x="44" y="37" width="12" height="7" rx="1.5" fill="white" />
            <path d="M22 80c0-10 10-18 28-18s28 8 28 18" />
          </svg>
        );

      // Doctor 4 / Legacy avatar_6
      case 'doctor_4':
      case 'avatar_6':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="50" cy="35" r="12" />
            <path d="M40 33h20M42 35a3 3 0 11-6 0 3 3 0 016 0zm22 0a3 3 0 11-6 0 3 3 0 016 0z" stroke="white" strokeWidth="2" />
            <path d="M22 80c0-10 10-18 28-18s28 8 28 18" />
          </svg>
        );

      // Doctor 5 / Legacy avatar_10
      case 'doctor_5':
      case 'avatar_10':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 42a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M50 63s6 2 6 6-6 6-6 6-6-2-6-6 6-6 6-6z" stroke="white" strokeWidth="1.5" />
          </svg>
        );

      // Hospital Building 1
      case 'hospital_1':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="25" y="30" width="50" height="50" rx="4" fill="currentColor" fillOpacity="0.1" />
            <path d="M25 50h50M50 30v50" strokeWidth="1.5" opacity="0.3" />
            <path d="M50 42v16M42 50h16" stroke="red" strokeWidth="4" />
          </svg>
        );

      // Hospital Pulse 2
      case 'hospital_2':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="25" y="35" width="50" height="45" rx="4" fill="currentColor" fillOpacity="0.1" />
            <path d="M30 57.5h10l5-12 5 24 5-18 5 6h10" strokeWidth="3.5" />
          </svg>
        );

      // Hospital Tower 3
      case 'hospital_3':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="35" y="20" width="30" height="60" rx="2" fill="currentColor" fillOpacity="0.1" />
            <rect x="20" y="45" width="60" height="35" rx="2" fill="currentColor" fillOpacity="0.1" />
            <path d="M50 28v8M46 32h8" stroke="red" strokeWidth="2.5" />
          </svg>
        );

      // Hospital Shield 4
      case 'hospital_4':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M50 18c15 0 25 10 25 25C75 60 50 78 50 78S25 60 25 43c0-15 10-25 25-25z" fill="currentColor" fillOpacity="0.15" />
            <path d="M50 32v22M39 43h22" strokeWidth="4.5" />
          </svg>
        );

      // Hospital Heart 5
      case 'hospital_5':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full text-white/95" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 35a18 18 0 0134-9 18 18 0 0134 9c0 24-34 46-34 46S12 59 12 35z" fill="currentColor" fillOpacity="0.15" />
            <path d="M46 32v18M37 41h18" strokeWidth="4" />
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

export const AvatarPicker = ({ selectedId, onSelect, category }) => {
  const targetCategory = category || 'PATIENT';
  // Filter avatars based on category, excluding legacy 'avatar_#' prefixes for selection list
  const filteredAvatars = AVATARS.filter(a => a.category === targetCategory && !a.id.startsWith('avatar_'));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 p-4 bg-slate-800/40 rounded-xl border border-slate-750">
        <HealthAvatar avatarId={selectedId} className="w-16 h-16" />
        <div>
          <h4 className="text-sm font-bold text-white">Selected Avatar</h4>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            This image will represent the profile across the application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {filteredAvatars.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.id)}
              className={`relative p-1 rounded-full cursor-pointer hover:scale-105 hover:rotate-2 transition-all duration-200 border-2 ${
                isSelected ? 'border-emerald-500 scale-105 bg-slate-800' : 'border-transparent'
              }`}
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
