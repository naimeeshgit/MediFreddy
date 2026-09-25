/**
 * MedPulse WhatsApp AI Assistant
 * Authentic WhatsApp Family Group Interface
 * Powered by Gemini AI (Intelligence) & Gnani.ai (Speech-To-Text & Text-To-Speech)
 */

import React, { useState } from 'react';
import { WhatsAppChat } from './components/WhatsAppChat.tsx';
import { GnaniSettingsModal } from './components/GnaniSettingsModal.tsx';
import { TestFilesModal } from './components/TestFilesModal.tsx';
import { GnaniVoiceSettings } from './types.ts';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTestFilesOpen, setIsTestFilesOpen] = useState(false);
  const [settings, setSettings] = useState<GnaniVoiceSettings>({
    model: 'timbre-v2.5',
    voice: 'Nalini',
    language: 'en-IN',
    autoSpeak: false,
    speed: 1,
  });

  const handleSendTestFileToBot = async (filename: string, content: string) => {
    try {
      // Send custom event to WhatsAppChat to handle intelligent family-member detection and group ingestion
      window.dispatchEvent(
        new CustomEvent('medpulse_send_test_file', {
          detail: {
            filename,
            content,
          },
        })
      );
    } catch (e) {
      console.error('Error sending test file:', e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#efeae2] dark:bg-[#0b141a] font-sans text-zinc-900 dark:text-zinc-100 select-none">
      {/* WhatsApp Fullscreen Group Experience */}
      <WhatsAppChat
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTestFiles={() => setIsTestFilesOpen(true)}
      />

      {/* Gnani Voice Settings Modal */}
      <GnaniSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
      />

      {/* Test Medical Files Modal (Select any generated test file to send into family group) */}
      <TestFilesModal
        isOpen={isTestFilesOpen}
        onClose={() => setIsTestFilesOpen(false)}
        onSendToBot={handleSendTestFileToBot}
        onIndexIntoVault={async (title, content) => {
          await fetch('/api/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              type: 'lab_report',
              rawText: content,
              summary: content.slice(0, 160) + '...',
              tags: ['test_file'],
            }),
          });
          // Dispatch prompt into WhatsApp Chat
          window.dispatchEvent(
            new CustomEvent('medpulse_inject_prompt', {
              detail: {
                prompt: `I just saved "${title}" to our Family Vault. Can you analyze the findings and confirm if any action is needed?`,
              },
            })
          );
        }}
      />
    </div>
  );
}
