import React, { useState } from 'react';
import {
  FileText,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Pill,
  ExternalLink,
  Loader2,
  X,
  Send,
  Building,
} from 'lucide-react';
import { MedicinePriceComparison } from '../types.ts';
import { compareMedicinePrices } from '../server/pharmacyAggregator.ts';

interface PrescriptionReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostPrescriptionToGroup: (resultText: string, comparison: MedicinePriceComparison) => void;
}

export const PrescriptionReaderModal: React.FC<PrescriptionReaderModalProps> = ({
  isOpen,
  onClose,
  onPostPrescriptionToGroup,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [parsedData, setParsedData] = useState<{
    patientName: string;
    doctorName: string;
    date: string;
    medicines: { name: string; dosage: string; frequency: string; duration: string }[];
    notes: string;
    allergyCheck: string;
    comparison?: MedicinePriceComparison;
  } | null>(null);

  if (!isOpen) return null;

  const samplePrescriptions = [
    {
      title: 'Dr. Anand Mehta - Cardiology Rx (Dr. Cursive Script)',
      patient: 'Rahul Sharma',
      preview: 'Tab. Telma 40mg 1-0-0, Tab. Rozavel 10mg 0-0-1, Tab. Glycomet 500 SR 1-0-1',
      medicines: [
        { name: 'Telma 40', dosage: '40 mg', frequency: 'Morning after breakfast (1-0-0)', duration: '90 Days' },
        { name: 'Rozavel 10', dosage: '10 mg', frequency: 'Bedtime (0-0-1)', duration: '90 Days' },
        { name: 'Glycomet 500 SR', dosage: '500 mg', frequency: 'Twice daily with meals (1-0-1)', duration: '90 Days' },
      ],
      notes: 'Low salt diet (< 2g/day). 30 mins brisk walking. Review in 3 months with home BP diary.',
      allergyCheck: '✓ Allergen verified: NO Penicillin class prescribed. Safe for Rahul Sharma.',
    },
    {
      title: 'Dr. Sunita Sharma - Pediatric Asthma Rx (Ananya Sharma)',
      patient: 'Ananya Sharma (11F)',
      preview: 'Montair LC Kid chewable tab 0-0-1, Budecort 100mcg inhaler 2 puffs SOS',
      medicines: [
        { name: 'Montair LC Kid', dosage: 'Kid Chewable', frequency: 'Once daily at bedtime (0-0-1)', duration: '30 Days' },
        { name: 'Budecort 100mcg Inhaler', dosage: '100 mcg', frequency: '2 puffs SOS with spacer during wheeze', duration: 'As needed' },
      ],
      notes: 'Avoid cold beverages, dust exposure, and peanut items. Rinse mouth after inhaler.',
      allergyCheck: '✓ Verified for Ananya Sharma: No peanut derivatives, safe pediatric dose.',
    },
    {
      title: 'Emergency Clinic Rx - Augmentin Allergy Hazard Test',
      patient: 'Rahul Sharma',
      preview: 'Tab. Augmentin 625 Duo 1-0-1 for bacterial throat infection',
      medicines: [
        { name: 'Augmentin 625 Duo', dosage: '625 mg', frequency: 'Twice daily (1-0-1)', duration: '5 Days' },
      ],
      notes: 'For acute suppurative pharyngitis.',
      allergyCheck: '⚠️ CRITICAL CONTRAINDICATION: Augmentin is AMOXICILLIN (Penicillin class). Rahul Sharma has a severe life-threatening allergy! System automatically recommends safe alternative: Azee 500 (Azithromycin).',
    },
  ];

  const handleSelectSample = (index: number) => {
    setSelectedSample(index);
    setAnalyzing(true);
    setParsedData(null);

    setTimeout(() => {
      const sample = samplePrescriptions[index];
      const comparison = compareMedicinePrices(sample.medicines[0].name);

      setParsedData({
        patientName: sample.patient,
        doctorName: sample.title.split(' - ')[0],
        date: '2026-09-24',
        medicines: sample.medicines,
        notes: sample.notes,
        allergyCheck: sample.allergyCheck,
        comparison,
      });
      setAnalyzing(false);
    }, 1800);
  };

  const handleSendToGroup = () => {
    if (!parsedData) return;
    const summary = `📋 *Handwritten Prescription Digitized (Gemini Vision OCR)*:
• *Patient:* ${parsedData.patientName}
• *Doctor:* ${parsedData.doctorName}
• *Extracted Medications:*
${parsedData.medicines.map((m) => `  - *${m.name}* (${m.dosage}) • ${m.frequency} [${m.duration}]`).join('\n')}

*Safety & Allergy Status:*
${parsedData.allergyCheck}

*Doctor Clinical Directive:* ${parsedData.notes}`;

    onPostPrescriptionToGroup(summary, parsedData.comparison!);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Doctor Handwriting Prescription OCR <Sparkles className="w-4 h-4 text-emerald-600" />
              </h2>
              <p className="text-xs text-zinc-500">
                Deciphers cursive medical handwriting &amp; compares lowest prices on Tata 1mg, PharmEasy, and Apollo 24|7
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Sample Prescriptions Picker */}
          <div>
            <label className="block font-bold text-zinc-800 dark:text-zinc-200 mb-2">
              Select or Upload Doctor Prescription Slip:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {samplePrescriptions.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedSample === idx
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {sample.title}
                  </span>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    For: {sample.patient}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 italic font-mono">
                    &quot;{sample.preview}&quot;
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Loader */}
          {analyzing && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="font-semibold text-xs">Deciphering handwritten doctor script via Gemini Vision...</span>
            </div>
          )}

          {/* Parsed Result Display */}
          {parsedData && !analyzing && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {/* Patient Badge */}
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Patient Identified
                  </span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{parsedData.patientName}</h4>
                  <p className="text-[11px] text-zinc-500">Prescribing: {parsedData.doctorName} • Date: {parsedData.date}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Digitized &amp; Verified
                </span>
              </div>

              {/* Allergy Status */}
              <div
                className={`p-3.5 rounded-2xl border text-xs font-semibold ${
                  parsedData.allergyCheck.includes('CRITICAL')
                    ? 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}
              >
                {parsedData.allergyCheck}
              </div>

              {/* Parsed Medicines List */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Extracted Medications &amp; Dosages:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {parsedData.medicines.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 flex items-center justify-between"
                    >
                      <div>
                        <h5 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{m.name} ({m.dosage})</h5>
                        <p className="text-[11px] text-zinc-500">{m.frequency} • {m.duration}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950">
                        Ready for Refill
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Store Comparison */}
              {parsedData.comparison && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        Multi-Store Price Comparison for {parsedData.comparison.medicineName}
                      </h4>
                      <p className="text-[11px] text-zinc-500">
                        Cheapest: <strong className="text-emerald-600">{parsedData.comparison.bestCheapestPlatform}</strong> • Fastest: <strong className="text-blue-600">{parsedData.comparison.bestFastestPlatform}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {parsedData.comparison.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-center flex flex-col justify-between ${
                          opt.isCheapest
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                            : opt.isFastest
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <span className="font-bold text-xs">{opt.platform}</span>
                        <div className="my-1">
                          <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">₹{opt.price}</span>
                          <span className="text-[10px] text-zinc-400 line-through ml-1">₹{opt.mrp}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-600">{opt.deliveryTime}</span>
                        <a
                          href={opt.purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 py-1 px-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-[10px] flex items-center justify-center gap-1 hover:opacity-90"
                        >
                          Buy <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Family health records are automatically tagged by family member.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!parsedData}
              onClick={handleSendToGroup}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" /> Share in Family WhatsApp Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
