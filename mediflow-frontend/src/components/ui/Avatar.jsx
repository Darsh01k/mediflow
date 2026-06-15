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

export const getGradientStyle = (avatarId) => {
  const avatar = AVATARS.find(a => a.id === avatarId) || AVATARS[0];
  const g = avatar.gradient || '';
  
  if (g.includes('from-sky-400') && g.includes('to-blue-600')) return { background: 'linear-gradient(135deg, #38bdf8, #2563eb)' };
  if (g.includes('from-emerald-400') && g.includes('to-teal-500')) return { background: 'linear-gradient(135deg, #34d399, #0d9488)' };
  if (g.includes('from-purple-400') && g.includes('to-indigo-650')) return { background: 'linear-gradient(135deg, #c084fc, #3b0764)' };
  if (g.includes('from-pink-400') && g.includes('to-rose-500')) return { background: 'linear-gradient(135deg, #f472b6, #f43f5e)' };
  if (g.includes('from-amber-400') && g.includes('to-orange-500')) return { background: 'linear-gradient(135deg, #fbbf24, #f97316)' };
  
  if (g.includes('from-blue-500') && g.includes('to-indigo-700')) return { background: 'linear-gradient(135deg, #3b82f6, #4338ca)' };
  if (g.includes('from-teal-500') && g.includes('to-emerald-600')) return { background: 'linear-gradient(135deg, #14b8a6, #059669)' };
  if (g.includes('from-emerald-500') && g.includes('to-teal-700')) return { background: 'linear-gradient(135deg, #10b981, #0f766e)' };
  if (g.includes('from-indigo-500') && g.includes('to-violet-700')) return { background: 'linear-gradient(135deg, #6366f1, #6d28d9)' };
  if (g.includes('from-red-500') && g.includes('to-rose-600')) return { background: 'linear-gradient(135deg, #ef4444, #e11d48)' };
  
  if (g.includes('from-blue-600') && g.includes('to-sky-800')) return { background: 'linear-gradient(135deg, #2563eb, #075985)' };
  if (g.includes('from-emerald-600') && g.includes('to-teal-800')) return { background: 'linear-gradient(135deg, #059669, #115e59)' };
  if (g.includes('from-violet-600') && g.includes('to-indigo-800')) return { background: 'linear-gradient(135deg, #7c3aed, #3730a3)' };
  if (g.includes('from-amber-500') && g.includes('to-yellow-600')) return { background: 'linear-gradient(135deg, #f59e0b, #ca8a04)' };
  if (g.includes('from-rose-600') && g.includes('to-red-800')) return { background: 'linear-gradient(135deg, #e11d48, #991b1b)' };
  
  if (g.includes('from-purple-500') && g.includes('to-indigo-700')) return { background: 'linear-gradient(135deg, #a855f7, #4338ca)' };
  if (g.includes('from-pink-500') && g.includes('to-rose-600')) return { background: 'linear-gradient(135deg, #ec4899, #e11d48)' };
  if (g.includes('from-cyan-400') && g.includes('to-blue-600')) return { background: 'linear-gradient(135deg, #22d3ee, #2563eb)' };
  if (g.includes('from-fuchsia-500') && g.includes('to-pink-700')) return { background: 'linear-gradient(135deg, #d946ef, #be185d)' };
  
  return { background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' };
};

export const HealthAvatar = ({ avatarId, className = "w-10 h-10", initials = "" }) => {
  let avatar = AVATARS.find(a => a.id === avatarId);
  
  if (!avatar) {
    if (avatarId && avatarId.startsWith('hospital')) {
      avatar = AVATARS.find(a => a.id === 'hospital_1');
    } else if (avatarId && avatarId.startsWith('doctor')) {
      avatar = AVATARS.find(a => a.id === 'doctor_1');
    } else {
      avatar = AVATARS[0];
    }
  }

  const gradStyle = getGradientStyle(avatar ? avatar.id : avatarId);
  const formattedInitials = initials ? initials.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

  // Map avatar ID to a specific SVG overlay graphic
  const renderAvatarContent = () => {
    if (!avatarId && initials) {
      return (
        <span className="fallback-initials text-white font-black text-xs md:text-sm uppercase tracking-tight select-none">
          {formattedInitials}
        </span>
      );
    }
    switch (avatarId) {
      // Patient 1 / Legacy avatar_3
      case 'patient_1':
      case 'avatar_3':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
          </svg>
        );
      
      // Patient 2 / Legacy avatar_4
      case 'patient_2':
      case 'avatar_4':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 42a11 11 0 100-22 11 11 0 000 22zM25 78c0-8 8-15 25-15s25 7 25 15" />
            <path d="M39 30c0 4 3.5 7 7 7h8c3.5 0 7-3 7-7" stroke="#ffffff" strokeWidth="2" />
          </svg>
        );

      // Patient 3 / Legacy avatar_7
      case 'patient_3':
      case 'avatar_7':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M42 33h16M44 35a2 2 0 11-4 0 2 2 0 014 0zm16 0a2 2 0 11-4 0 2 2 0 014 0z" stroke="#ffffff" strokeWidth="2" />
          </svg>
        );

      // Patient 4 / Legacy avatar_8
      case 'patient_4':
      case 'avatar_8':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 42a11 11 0 100-22 11 11 0 000 22zM25 78c0-8 8-15 25-15s25 7 25 15" />
            <path d="M36 28s4-8 14-8 14 8 14 8" stroke="#ffffff" strokeWidth="2" />
          </svg>
        );

      // Patient 5 / Legacy avatar_9
      case 'patient_5':
      case 'avatar_9':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M45 68h10M50 63v10" stroke="#ffffff" strokeWidth="2" />
          </svg>
        );

      // Doctor 1 / Legacy avatar_1
      case 'doctor_1':
      case 'avatar_1':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 45a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M50 50v8c0 3 2 5 5 5h3c2 0 4 2 4 4v3" stroke="#ffffff" strokeWidth="2" />
            <circle cx="62" cy="74" r="5" stroke="#ffffff" strokeWidth="2" fill="#3b82f6" />
          </svg>
        );

      // Doctor 2 / Legacy avatar_2
      case 'doctor_2':
      case 'avatar_2':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 42a10 10 0 100-20 10 10 0 000 20zM25 78c0-8 8-15 25-15s25 7 25 15" />
            <path d="M45 48c0 6 5 10 10 10s10-4 10-10" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="1.5" fill="#ffffff" />
            <path d="M35 78s3-10 8-10 8 10 8 10" stroke="#ffffff" strokeWidth="2" />
          </svg>
        );

      // Doctor 3 / Legacy avatar_5
      case 'doctor_3':
      case 'avatar_5':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <circle cx="50" cy="35" r="12" fill="#ffffff" fillOpacity="0.2" />
            <path d="M38 28c3-4 7-6 12-6s9 2 12 6M36 32h28" stroke="#ffffff" />
            <rect x="44" y="37" width="12" height="7" rx="1.5" fill="#ffffff" />
            <path d="M22 80c0-10 10-18 28-18s28 8 28 18" />
          </svg>
        );

      // Doctor 4 / Legacy avatar_6
      case 'doctor_4':
      case 'avatar_6':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <circle cx="50" cy="35" r="12" stroke="#ffffff" />
            <path d="M40 33h20M42 35a3 3 0 11-6 0 3 3 0 016 0zm22 0a3 3 0 11-6 0 3 3 0 016 0z" stroke="#ffffff" strokeWidth="2" />
            <path d="M22 80c0-10 10-18 28-18s28 8 28 18" />
          </svg>
        );

      // Doctor 5 / Legacy avatar_10
      case 'doctor_5':
      case 'avatar_10':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 42a12 12 0 100-24 12 12 0 000 24zM22 80c0-10 10-18 28-18s28 8 28 18" />
            <path d="M50 63s6 2 6 6-6 6-6 6-6-2-6-6 6-6 6-6z" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        );

      // Hospital Building 1
      case 'hospital_1':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <rect x="25" y="30" width="50" height="50" rx="4" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" />
            <path d="M25 50h50M50 30v50" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" />
            <path d="M50 42v16M42 50h16" stroke="red" strokeWidth="4" />
          </svg>
        );

      // Hospital Pulse 2
      case 'hospital_2':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <rect x="25" y="35" width="50" height="45" rx="4" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" />
            <path d="M30 57.5h10l5-12 5 24 5-18 5 6h10" stroke="#ffffff" strokeWidth="3.5" />
          </svg>
        );

      // Hospital Tower 3
      case 'hospital_3':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <rect x="35" y="20" width="30" height="60" rx="2" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" />
            <rect x="20" y="45" width="60" height="35" rx="2" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" />
            <path d="M50 28v8M46 32h8" stroke="red" strokeWidth="2.5" />
          </svg>
        );

      // Hospital Shield 4
      case 'hospital_4':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M50 18c15 0 25 10 25 25C75 60 50 78 50 78S25 60 25 43c0-15 10-25 25-25z" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" />
            <path d="M50 32v22M39 43h22" stroke="#ffffff" strokeWidth="4.5" />
          </svg>
        );

      // Hospital Heart 5
      case 'hospital_5':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95">
            <path d="M12 35a18 18 0 0134-9 18 18 0 0134 9c0 24-34 46-34 46S12 59 12 35z" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" />
            <path d="M46 32v18M37 41h18" stroke="#ffffff" strokeWidth="4" />
          </svg>
        );

      default:
        if (formattedInitials) {
          return (
            <span className="fallback-initials text-white font-black text-xs md:text-sm uppercase tracking-tight select-none">
              {formattedInitials}
            </span>
          );
        }
        return <User className="w-5 h-5 text-white" stroke="#ffffff" />;
    }
  };

  return (
    <div 
      className={`${className} rounded-full p-0.5 flex items-center justify-center shadow-md overflow-hidden shrink-0`}
      style={gradStyle}
    >
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
    <div className="space-y-2">
      <div className="flex items-center gap-3 p-2 bg-slate-800/30 rounded-xl border border-slate-750/50">
        <HealthAvatar avatarId={selectedId} className="w-10 h-10" />
        <div>
          <h4 className="text-xs font-bold text-white leading-tight">Selected Avatar</h4>
          <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
            This image will represent the profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {filteredAvatars.map((avatar) => {
          const isSelected = selectedId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelect(avatar.id)}
              className={`relative p-0.5 rounded-full cursor-pointer hover:scale-105 transition-all duration-200 border-2 ${
                isSelected ? 'border-emerald-500 scale-105 bg-slate-800' : 'border-transparent'
              }`}
            >
              <HealthAvatar avatarId={avatar.id} className="w-9 h-9" />
              {isSelected && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 border border-slate-900">
                  <Check className="w-1.5 h-1.5 text-white" strokeWidth={5} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
