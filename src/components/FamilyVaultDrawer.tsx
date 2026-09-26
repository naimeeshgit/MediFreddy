import React, { useState } from 'react';
import {
  X,
  FileText,
  AlertTriangle,
  Heart,
  Pill,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Search,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { FamilyMember, MedicalRecord } from '../types.ts';
import { FAMILY_MEMBERS } from '../server/familyData.ts';

interface FamilyVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: MedicalRecord[];
  onSelectMemberPrompt: (prompt: string) => void;
  activeSenderId?: string;
  onSelectActiveSender?: (member: FamilyMember) => void;
}

export const FamilyVaultDrawer: React.FC<FamilyVaultDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onSelectMemberPrompt,
  activeSenderId = 'mem_rahul',
  onSelectActiveSender,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'docs'>('info');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="w-full max-w-md h-full bg-[#f0f2f5] dark:bg-[#111b21] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-zinc-200/80 dark:border-zinc-800">
        {/* WhatsApp Top Header */}
        <div className="h-16 px-4 bg-[#008069] dark:bg-[#202c33] text-white flex items-center gap-4 shrink-0 shadow-xs">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 cursor-pointer text-white"
            title="Close Group Info"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-base tracking-tight">Group info</h2>
        </div>

        {/* Scrollable Group Info Body */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pb-6">
          {/* Group Photo & Title Card */}
          <div className="bg-white dark:bg-[#202c33] p-6 flex flex-col items-center text-center shadow-xs">
            <div className="w-24 h-24 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-white text-3xl border-2 border-emerald-400 shadow-md mb-3">
              👨‍👩‍👧‍👦
            </div>
            <h3 className="font-bold text-lg text-[#111b21] dark:text-[#e9edef] flex items-center gap-1.5">
              Sharma Family 👨‍👩‍👧‍👦
            </h3>
            <p className="text-xs text-[#667781] dark:text-[#8696a0] mt-0.5">
              Group • 5 participants
            </p>
          </div>

          {/* Group Description */}
          <div className="bg-white dark:bg-[#202c33] p-4 text-xs shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Description
            </span>
            <p className="text-[#3b4a54] dark:text-[#d1d7db] leading-relaxed">
              Family health group integrated with *MedPulse AI* (+91 98765 43210). All lab reports, prescriptions, and clinical history are indexed here at group level with HIPAA compliance and clinical allergy protection.
            </p>
          </div>

          {/* Media, links and docs section */}
          <div className="bg-white dark:bg-[#202c33] p-4 text-xs shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#111b21] dark:text-[#e9edef]">
                Media, links and docs
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    activeTab === 'info'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('docs')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    activeTab === 'docs'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  Docs ({records.length})
                </button>
              </div>
            </div>

            {activeTab === 'docs' ? (
              /* All Stored Group Medical Documents */
              <div className="space-y-2 pt-1 max-h-72 overflow-y-auto">
                {records.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-750 bg-[#f9fafb] dark:bg-[#182229] flex items-start gap-2.5"
                  >
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs truncate text-[#111b21] dark:text-[#e9edef]">
                          {rec.title}
                        </span>
                        <span className="text-[10px] text-zinc-400 shrink-0">{rec.date}</span>
                      </div>
                      <p className="text-[11px] text-[#667781] dark:text-[#8696a0] line-clamp-2 mt-0.5">
                        {rec.summary}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          {rec.memberName || 'Family Member'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectMemberPrompt(
                              `What are the clinical findings and next steps from ${rec.title}?`
                            );
                          }}
                          className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
                        >
                          Ask in chat →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Docs Preview strip */
              <div className="grid grid-cols-3 gap-2 pt-1">
                {records.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setActiveTab('docs')}
                    className="p-2 rounded-xl bg-[#f0f2f5] dark:bg-[#182229] border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:border-emerald-500 text-center"
                  >
                    <FileText className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                    <span className="block text-[10px] font-bold truncate text-[#111b21] dark:text-[#e9edef]">
                      {r.title}
                    </span>
                    <span className="text-[9px] text-zinc-500">{r.memberName?.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group Participants (5) */}
          <div className="bg-white dark:bg-[#202c33] p-4 text-xs shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#111b21] dark:text-[#e9edef]">
                5 participants
              </span>
              <span className="text-[11px] text-zinc-500">Tap to view dossier</span>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {/* MedPulse AI Assistant */}
              <div className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    🩺
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#111b21] dark:text-[#e9edef] flex items-center gap-1">
                      MedPulse AI Assistant
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 text-white" />
                    </h4>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Verified Health Bot • +91 98765 43210
                    </p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                  24/7 Active
                </span>
              </div>

              {/* Family Members */}
              {FAMILY_MEMBERS.map((m) => {
                const isCurrentActive = activeSenderId === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMember(m)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 rounded-xl px-1 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-10 h-10 rounded-full object-cover shadow-xs"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-[#111b21] dark:text-[#e9edef] flex items-center gap-1.5">
                          {m.name}
                          {m.relation === 'Self' && (
                            <span className="text-[10px] text-zinc-400">(You)</span>
                          )}
                        </h4>
                        <p className="text-[11px] text-[#667781] dark:text-[#8696a0]">
                          {m.relation} • {m.age} yrs • Blood: {m.bloodGroup}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCurrentActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          Current Sender
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Member Dossier Detail Popup */}
        {selectedMember && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in">
            <div className="w-full max-w-sm bg-white dark:bg-[#202c33] rounded-3xl shadow-2xl p-5 space-y-4 text-xs text-[#111b21] dark:text-[#e9edef]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMember.avatar}
                    alt={selectedMember.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-sm">{selectedMember.name}</h3>
                    <p className="text-zinc-500 text-[11px]">
                      {selectedMember.relation} • {selectedMember.age}y • {selectedMember.bloodGroup}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Documented Allergies */}
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 space-y-1">
                <span className="font-bold text-red-700 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Documented Allergies
                </span>
                {selectedMember.allergies.map((all, i) => (
                  <p key={i} className="text-red-900 dark:text-red-300 font-medium">
                    • {all}
                  </p>
                ))}
              </div>

              {/* Conditions */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 space-y-1">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500" /> Chronic Conditions
                </span>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {selectedMember.conditions.join(', ')}
                </p>
              </div>

              {/* Active Meds */}
              <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 space-y-1">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Pill className="w-3.5 h-3.5 text-emerald-600" /> Current Medications
                </span>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {selectedMember.activeMeds.join(', ')}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectActiveSender?.(selectedMember);
                    setSelectedMember(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Set as Active Sender
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prompt = `Can you review ${selectedMember.name}'s active prescriptions and conditions?`;
                    setSelectedMember(null);
                    onClose();
                    onSelectMemberPrompt(prompt);
                  }}
                  className="py-2 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs cursor-pointer"
                >
                  Ask Bot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
