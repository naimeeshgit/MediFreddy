import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Send,
  X,
  ExternalLink,
  Sparkles,
  ShieldAlert,
  Activity,
  Heart,
  Droplet,
  FileCheck,
} from 'lucide-react';

interface TestMedicalFile {
  id: string;
  filename: string;
  title: string;
  type: string;
  patientName: string;
  content: string;
  size: number;
  downloadUrl: string;
}

interface TestFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToBot: (filename: string, content: string) => void;
  onIndexIntoVault: (title: string, content: string) => void;
}

export const TestFilesModal: React.FC<TestFilesModalProps> = ({
  isOpen,
  onClose,
  onSendToBot,
  onIndexIntoVault,
}) => {
  const [testFiles, setTestFiles] = useState<TestMedicalFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<TestMedicalFile | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch('/api/test-files')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.files) {
          setTestFiles(data.files);
          if (!selectedFile && data.files.length > 0) {
            setSelectedFile(data.files[0]);
          }
        }
      })
      .catch((err) => console.error('Failed to load test files:', err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (file: TestMedicalFile) => {
    navigator.clipboard.writeText(file.content);
    setCopiedId(file.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (file: TestMedicalFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    testFiles.forEach((file, index) => {
      setTimeout(() => {
        handleDownload(file);
      }, index * 200);
    });
    setActionNotice('Downloading all 7 test medical files for Rahul Sharma...');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSendToWhatsApp = (file: TestMedicalFile) => {
    onSendToBot(file.filename, file.content);
    onClose();
  };

  const getFileBadge = (filename: string) => {
    if (filename.includes('Allergy')) return { label: 'CRITICAL ALLERGY', bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' };
    if (filename.includes('Prescription')) return { label: 'PRESCRIPTION', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
    if (filename.includes('Echo')) return { label: 'CARDIOLOGY ECHO', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
    if (filename.includes('Renal')) return { label: 'RENAL PANEL', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    if (filename.includes('Thyroid')) return { label: 'ENDOCRINE TSH', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' };
    if (filename.includes('CBC')) return { label: 'HEMATOLOGY CBC', bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' };
    if (filename.includes('Liver')) return { label: 'HEPATIC LFT', bg: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' };
    return { label: 'LAB REPORT', bg: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-5xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Test Medical Records Generator &amp; Suite
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold">
                  Single Patient: Rahul Sharma (42M)
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Authentic clinical test documents to test WhatsApp Bot attachments, RAG retrieval, and speech responses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAll}
              className="px-3 py-1.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" /> Download All 7 Files
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            {actionNotice}
          </div>
        )}

        {/* Modal Body: Left sidebar list & Right preview */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* File selector list */}
          <div className="w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto p-3 space-y-2 shrink-0 bg-zinc-50/60 dark:bg-zinc-900/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1">
              Select Medical Document ({testFiles.length})
            </div>

            {testFiles.map((file) => {
              const badge = getFileBadge(file.filename);
              const isSelected = selectedFile?.id === file.id;

              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-emerald-500/20'
                      : 'border-zinc-200 dark:border-zinc-800/80 hover:bg-white/80 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {file.title}
                  </h4>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">
                    {file.filename}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Document Preview & Actions */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900">
            {selectedFile ? (
              <>
                {/* Document Subheader */}
                <div className="p-3 sm:p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      {selectedFile.title}
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Target Patient: <strong className="text-zinc-700 dark:text-zinc-300">Rahul Sharma</strong> • Format: Standard ASCII Clinical Report (.txt)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedFile)}
                      className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 transition-all"
                      title="Copy document text"
                    >
                      {copiedId === selectedFile.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Text</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(selectedFile)}
                      className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 transition-all"
                      title="Download file to computer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendToWhatsApp(selectedFile)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                      title="Send as attachment in WhatsApp Bot"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to WhatsApp Bot</span>
                    </button>
                  </div>
                </div>

                {/* Preformatted Monospace Viewer */}
                <div className="flex-1 overflow-auto p-4 bg-zinc-950 text-emerald-300/90 font-mono text-xs leading-relaxed select-text">
                  <pre className="whitespace-pre-wrap font-mono">
                    {selectedFile.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-400 text-xs">
                Select a test medical record from the list to preview
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-wrap items-center justify-between text-xs text-zinc-500 gap-2">
          <span>
            💡 <strong>Testing Tip:</strong> You can download these files to test manual attachment upload via the WhatsApp paperclip, or click &quot;Send to WhatsApp Bot&quot; to test instant AI analysis!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-xl font-semibold text-zinc-800 dark:text-zinc-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
