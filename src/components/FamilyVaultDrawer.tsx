import React, { useState } from 'react';
import {
  Users,
  X,
  FileText,
  Heart,
  AlertTriangle,
  Pill,
  Sparkles,
  ShieldCheck,
  Calendar,
  MessageSquare,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { FamilyMember, MedicalRecord } from '../types.ts';
import { FAMILY_MEMBERS } from '../server/familyData.ts';

interface FamilyVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: MedicalRecord[];
  onSelectMemberPrompt: (prompt: string) => void;
}

export const FamilyVaultDrawer: React.FC<FamilyVaultDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onSelectMemberPrompt,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string>('mem_rahul');

  if (!isOpen) return null;

  const currentMember = FAMILY_MEMBERS.find((m) => m.id === selectedMemberId) || FAMILY_MEMBERS[0];
  const memberRecords = records.filter(
    (r) =>
      r.memberId === currentMember.id ||
      r.title.toLowerCase().includes(currentMember.name.toLowerCase().split(' ')[0]) ||
      r.rawText.toLowerCase().includes(currentMember.name.toLowerCase()) ||
      (currentMember.id === 'mem_rahul' && !r.memberId)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-white dark:bg-zinc-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header (WhatsApp Group Info style) */}
        <div className="p-4 bg-[#008069] dark:bg-[#1f2c34] text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-emerald-700 dark:bg-zinc-800 flex items-center justify-center font-bold text-white shadow-inner">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Sharma Family Health Hub 👨‍👩‍👧‍👦</h3>
              <p className="text-[11px] text-emerald-100 dark:text-zinc-400">
                4 Members • Shared Family Medical Dossier
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Selector Tabs */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
          {FAMILY_MEMBERS.map((m) => {
            const isSelected = m.id === selectedMemberId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMemberId(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <img src={m.avatar} alt={m.name} className="w-4 h-4 rounded-full object-cover" />
                <span>{m.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-80">({m.relation})</span>
              </button>
            );
          })}
        </div>

        {/* Member Profile Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Member Card */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-3">
            <img
              src={currentMember.avatar}
              alt={currentMember.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{currentMember.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {currentMember.relation}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {currentMember.age} yrs • {currentMember.gender} • Blood: <strong className="text-zinc-700 dark:text-zinc-300">{currentMember.bloodGroup}</strong>
              </p>
              {currentMember.lastCheckup && (
                <p className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Last Check: {currentMember.lastCheckup}
                </p>
              )}
            </div>
          </div>

          {/* Allergy Shield Alert */}
          <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Documented Allergies
            </div>
            {currentMember.allergies.map((all, i) => (
              <p key={i} className="text-red-800 dark:text-red-300 font-medium leading-relaxed">
                • {all}
              </p>
            ))}
          </div>

          {/* Active Diagnoses & Chronic Conditions */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <h5 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" /> Chronic Conditions &amp; Diagnoses
            </h5>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentMember.conditions.map((c, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-zinc-750 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Active Prescriptions */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
            <h5 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600" /> Current Daily Regimen
            </h5>
            <div className="space-y-1 pt-1">
              {currentMember.activeMeds.map((med, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{med}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Group Records Tagged to This Member */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-zinc-800 dark:text-zinc-200">
                Medical Records in Group ({memberRecords.length})
              </h5>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Tagged
              </span>
            </div>

            {memberRecords.length === 0 ? (
              <p className="text-zinc-400 italic py-2">No documents uploaded for {currentMember.name} yet.</p>
            ) : (
              <div className="space-y-2">
                {memberRecords.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => {
                      onSelectMemberPrompt(
                        `Explain the medical record "${rec.title}" dated ${rec.date} for ${currentMember.name}.`
                      );
                      onClose();
                    }}
                    className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 hover:border-emerald-500 cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase">
                        {rec.type.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-zinc-400">{rec.date}</span>
                    </div>
                    <h6 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{rec.title}</h6>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">{rec.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2">
          <button
            type="button"
            onClick={() => {
              onSelectMemberPrompt(`Give a comprehensive health summary and review of active medications for ${currentMember.name}.`);
              onClose();
            }}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <MessageSquare className="w-4 h-4" /> Ask Bot About {currentMember.name.split(' ')[0]}&apos;s Health
          </button>
        </div>
      </div>
    </div>
  );
};
