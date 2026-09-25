import React, { useState } from 'react';
import { Terminal, Send, CheckCircle2, Copy, Sparkles } from 'lucide-react';

interface WebhookTesterProps {
  onSimulateWebhook: (text: string) => void;
}

export const WebhookTester: React.FC<WebhookTesterProps> = ({ onSimulateWebhook }) => {
  const [sampleText, setSampleText] = useState('What was my HbA1c in the last blood test and can I take Augmentin for throat ache?');
  const [simulatedStatus, setSimulatedStatus] = useState<string | null>(null);

  const presets = [
    {
      label: 'RAG Lab Query',
      text: 'What was my HbA1c in the last blood test and what is my target?',
    },
    {
      label: 'Allergy Hazard Check',
      text: 'My doctor suggested Augmentin 625 for a sinus infection. Can I order it from pharmacy?',
    },
    {
      label: 'Cardiology Appointment',
      text: 'I want to book an appointment with Dr. Anand Mehta at City Heart for tomorrow 11:30 AM',
    },
    {
      label: 'Medicine Refill',
      text: 'Order 2 strips of Glycomet 500 SR and 1 strip of Telma 40 to my address',
    },
    {
      label: 'New Lab Record Ingest',
      text: 'I just got my KFT report: Serum Creatinine is 0.9 mg/dL and Urea is 22 mg/dL. Save this to my records.',
    },
  ];

  const handleSend = () => {
    onSimulateWebhook(sampleText);
    setSimulatedStatus('Webhook dispatched to WhatsApp conversational pipeline! Check the WhatsApp Chat tab.');
    setTimeout(() => setSimulatedStatus(null), 4000);
  };

  const sampleMetaPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '905043596815',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '+91 80 2553 1122',
                phone_number_id: '1098421098421',
              },
              contacts: [{ profile: { name: 'Rahul Sharma' }, wa_id: '919876543210' }],
              messages: [
                {
                  from: '919876543210',
                  id: `wamid.HBgMOTE5ODc2NTQzMjEwFQIAEhg${Date.now()}`,
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  text: { body: sampleText },
                  type: 'text',
                },
              ],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            WhatsApp Business API Webhook Simulator
          </h2>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Simulate incoming Meta Cloud API or Twilio WhatsApp incoming webhook payloads. Tests RAG retrieval, Gnani speech synthesis, and action execution.
        </p>

        {/* Quick Presets */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            Clinical Scenario Presets:
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSampleText(p.text)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:border-emerald-500 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="mt-4">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
            Simulated Inbound Message Body:
          </label>
          <textarea
            rows={3}
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs sm:text-sm font-sans text-zinc-900 dark:text-zinc-100 focus:outline-emerald-600"
          />
        </div>

        {/* Dispatch Button */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-zinc-500">From: Rahul Sharma (+91 98765 43210)</span>
          <button
            type="button"
            onClick={handleSend}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
          >
            <Send className="w-4 h-4" /> Trigger WhatsApp Webhook
          </button>
        </div>

        {simulatedStatus && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {simulatedStatus}
          </div>
        )}
      </div>

      {/* Raw JSON Webhook Payload Preview */}
      <div className="bg-zinc-900 text-zinc-200 rounded-2xl p-5 border border-zinc-800 font-mono text-xs overflow-x-auto shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 text-zinc-400">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Meta Cloud WhatsApp Webhook Payload Preview
          </span>
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(sampleMetaPayload, null, 2))}
            className="flex items-center gap-1 text-[11px] hover:text-white cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Copy JSON
          </button>
        </div>
        <pre className="text-[11px] leading-relaxed text-emerald-300/90 whitespace-pre-wrap">
          {JSON.stringify(sampleMetaPayload, null, 2)}
        </pre>
      </div>
    </div>
  );
};
