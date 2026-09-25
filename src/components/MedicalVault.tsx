import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  AlertTriangle,
  Activity,
  Heart,
  Droplet,
  Calendar,
  Building,
  UserCheck,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { MedicalRecord } from '../types.ts';

interface MedicalVaultProps {
  onAskAboutRecord: (prompt: string) => void;
  onOpenTestFiles?: () => void;
}

export const MedicalVault: React.FC<MedicalVaultProps> = ({ onAskAboutRecord, onOpenTestFiles }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ record: MedicalRecord; score: number; matchedKeywords: string[] }[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New record form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MedicalRecord['type']>('lab_report');
  const [newDoctor, setNewDoctor] = useState('');
  const [newFacility, setNewFacility] = useState('');
  const [newRawText, setNewRawText] = useState('');

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (e) {
      console.error('Failed to fetch records:', e);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/records/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newRawText) return;

    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          doctorName: newDoctor || 'Self Upload',
          facilityName: newFacility || 'MedPulse Cloud',
          rawText: newRawText,
          summary: newRawText.slice(0, 160) + '...',
          tags: ['uploaded', newType],
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRecords();
        setShowAddModal(false);
        setNewTitle('');
        setNewRawText('');
        setNewDoctor('');
        setNewFacility('');
      }
    } catch (err) {
      console.error('Add record error:', err);
    }
  };

  const displayedRecords = isSearching && searchQuery.trim()
    ? searchResults.map((r) => r.record)
    : records;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  Patient Health Records Vault
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> RAG Vector Indexed
                  </span>
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Patient: <strong className="text-zinc-800 dark:text-zinc-200">Rahul Sharma (42M)</strong> • Blood: B+ • ABDM Health ID: 91-8842-1092
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onOpenTestFiles && (
              <button
                type="button"
                onClick={onOpenTestFiles}
                className="px-3.5 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                title="View & Download Generated Clinical Test Files for Rahul Sharma"
              >
                <FolderOpen className="w-4 h-4 text-emerald-600" /> Test Medical Files Suite (7)
              </button>
            )}

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Medical Record
            </button>
          </div>
        </div>

        {/* Live Vitals Snapshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <span>Blood Pressure</span>
              <Heart className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">128/82 <span className="text-xs font-normal text-zinc-500">mmHg</span></div>
            <span className="text-[10px] text-emerald-600 font-medium">✓ Well Controlled (Telmisartan)</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <span>HbA1c Level</span>
              <Droplet className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">6.8 <span className="text-xs font-normal text-zinc-500">%</span></div>
            <span className="text-[10px] text-amber-600 font-medium">Borderline Fair Control</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <span>Total Cholesterol</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1">212 <span className="text-xs font-normal text-zinc-500">mg/dL</span></div>
            <span className="text-[10px] text-blue-600 font-medium">Rosuvastatin 10mg Active</span>
          </div>

          <div className="p-3 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
            <div className="flex items-center justify-between text-red-600 dark:text-red-400 text-xs font-bold">
              <span>Allergy Alert</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-red-700 dark:text-red-400 mt-1">PENICILLIN &amp; AMOXICILLIN</div>
            <span className="text-[10px] text-red-600 font-medium">Severe Bronchospasm Risk</span>
          </div>
        </div>

        {/* Search Bar with live RAG indicator */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search medical records with RAG (e.g. 'sugar', 'cholesterol', 'penicillin allergy', 'ecg', 'metformin')..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 text-sm focus:outline-emerald-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Records Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {isSearching && (
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 px-1">
            <span>
              Found <strong>{searchResults.length}</strong> matching records for &quot;{searchQuery}&quot;
            </span>
            <span className="text-emerald-600 font-medium">Ranked by RAG Relevance Score</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedRecords.map((record) => {
            const isAllergy = record.type === 'allergy_note';
            const searchMatch = searchResults.find((r) => r.record.id === record.id);

            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                  isAllergy
                    ? 'border-red-300 dark:border-red-900/60 bg-red-50/40 dark:bg-red-950/20 hover:border-red-400'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50 hover:shadow-md'
                }`}
              >
                {searchMatch && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      RAG Score: {searchMatch.score.toFixed(1)}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isAllergy
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-600'
                        : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {isAllergy ? <AlertTriangle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>

                  <div className="flex-1 min-w-0 pr-12">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-1">
                      {record.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {record.date}
                      </span>
                      {record.doctorName && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3" /> {record.doctorName}
                        </span>
                      )}
                      {record.facilityName && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" /> {record.facilityName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-3 line-clamp-2 leading-relaxed">
                  {record.summary}
                </p>

                {/* Metrics Badges */}
                {record.metrics && record.metrics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    {record.metrics.map((m, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1"
                      >
                        <span className="opacity-70">{m.name}:</span>
                        <strong>
                          {m.value} {m.unit}
                        </strong>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tags & Action */}
                <div className="flex items-center justify-between mt-3 pt-2 text-[11px]">
                  <div className="flex items-center gap-1 overflow-hidden">
                    {record.tags.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 text-[10px]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAboutRecord(`Explain my medical record: "${record.title}" dated ${record.date}. What are the key findings and next steps?`);
                    }}
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" /> Ask WhatsApp Bot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {selectedRecord.type.replace('_', ' ')}
                </span>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{selectedRecord.title}</h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Date: {selectedRecord.date} • {selectedRecord.facilityName || 'N/A'} • {selectedRecord.doctorName || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 font-mono whitespace-pre-wrap leading-relaxed text-zinc-800 dark:text-zinc-200">
                {selectedRecord.rawText}
              </div>

              {selectedRecord.medications && selectedRecord.medications.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 mb-2">Prescribed Regimen</h4>
                  <div className="space-y-1.5">
                    {selectedRecord.medications.map((med, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{med.name}</span>
                        <span className="text-xs text-zinc-500">{med.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
              <span className="text-xs text-zinc-400">ID: {selectedRecord.id}</span>
              <button
                onClick={() => {
                  const title = selectedRecord.title;
                  const date = selectedRecord.date;
                  setSelectedRecord(null);
                  onAskAboutRecord(`What does my "${title}" from ${date} indicate regarding my health?`);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Discuss with Bot on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={handleCreateRecord}
            className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Upload &amp; Store Medical Record</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-zinc-400 p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Record Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thyroid Panel TSH, Ultrasound Abdomen, Dental X-Ray"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Record Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="lab_report">Lab Report / Blood Test</option>
                    <option value="prescription">Prescription</option>
                    <option value="discharge_summary">Discharge Summary</option>
                    <option value="vital_log">Vitals Log</option>
                    <option value="allergy_note">Allergy Note</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Consultant / Lab</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Verma / Manipal Hospital"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">
                  Clinical Details / Report Text *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Paste or type test results, biomarkers, doctor observations, or prescription contents here..."
                  value={newRawText}
                  onChange={(e) => setNewRawText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-xs focus:outline-emerald-600"
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
              >
                Save &amp; Index into RAG
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
