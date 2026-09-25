import React, { useState } from 'react';
import {
  AlertTriangle,
  Siren,
  PhoneCall,
  MapPin,
  Clock,
  ShieldAlert,
  Send,
  X,
  CheckCircle2,
  HeartPulse,
} from 'lucide-react';
import { FamilyMember, EmergencySOSAlert } from '../types.ts';
import { FAMILY_MEMBERS } from '../server/familyData.ts';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchSOS: (sosAlert: EmergencySOSAlert) => void;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  onDispatchSOS,
}) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember>(FAMILY_MEMBERS[0]);
  const [reason, setReason] = useState('Severe Chest Discomfort & Shortness of Breath');
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchedAlert, setDispatchedAlert] = useState<EmergencySOSAlert | null>(null);

  if (!isOpen) return null;

  const handleTriggerSOS = () => {
    const alert: EmergencySOSAlert = {
      id: `sos_${Date.now()}`,
      patientName: selectedMember.name,
      relation: selectedMember.relation,
      age: selectedMember.age,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: {
        address: 'Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru - 560103',
        lat: 12.9279,
        lng: 77.6784,
        googleMapsUrl: 'https://maps.google.com/?q=12.9279,77.6784',
      },
      triggerReason: reason,
      criticalDossier: {
        bloodGroup: selectedMember.bloodGroup,
        knownAllergies: selectedMember.allergies,
        chronicConditions: selectedMember.conditions,
        emergencyContact: '+91 98765 43210 (Rahul Sharma)',
      },
      hospitalDispatched: {
        name: 'City Heart Emergency & Trauma Care / 108 Ambulance Hub',
        distance: '2.1 km away',
        ambulanceETA: '7 - 9 Minutes (Sirens Active)',
        emergencyHotline: '108 / +91 80 4123 9999',
      },
      status: 'dispatched',
    };

    setDispatchedAlert(alert);
    setIsDispatched(true);
    onDispatchSOS(alert);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 text-white rounded-3xl shadow-2xl border-2 border-red-600 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-900 to-red-950 border-b border-red-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center animate-pulse shadow-lg">
              <Siren className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-white uppercase flex items-center gap-2">
                Emergency SOS Dispatch
              </h2>
              <p className="text-xs text-red-200">
                1-Tap Ambulance, Emergency Room &amp; Family Medical Dossier Alert
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-red-800/60 text-red-300 hover:text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isDispatched && dispatchedAlert ? (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="p-4 rounded-2xl bg-red-950/80 border-2 border-red-500 text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto animate-bounce">
                <HeartPulse className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-red-100 uppercase tracking-wider">
                Ambulance &amp; ER Dispatched!
              </h3>
              <p className="text-xs text-red-300">
                Emergency services have received the GPS coordinates and the patient&apos;s critical allergy/cardiac dossier.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-zinc-300">
                <span>Patient:</span>
                <strong className="text-white text-sm">{dispatchedAlert.patientName} ({dispatchedAlert.age}y, {dispatchedAlert.relation})</strong>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>Hospital &amp; Squad:</span>
                <span className="text-red-400 font-semibold">{dispatchedAlert.hospitalDispatched.name}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>Ambulance ETA:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {dispatchedAlert.hospitalDispatched.ambulanceETA}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-300">
                <span>GPS Address:</span>
                <span className="text-zinc-400 text-right max-w-[220px] truncate">{dispatchedAlert.location.address}</span>
              </div>
            </div>

            {/* Critical Dossier Broadcast */}
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-800 text-xs space-y-1.5 text-red-200">
              <div className="font-bold flex items-center gap-1.5 text-red-400">
                <ShieldAlert className="w-4 h-4" /> BROADCASTED ALLERGY &amp; CLINICAL DOSSIER
              </div>
              <p>• Blood Group: <strong>{dispatchedAlert.criticalDossier.bloodGroup}</strong></p>
              <p>• Severe Allergies: <strong className="text-red-300">{dispatchedAlert.criticalDossier.knownAllergies.join(', ')}</strong></p>
              <p>• Chronic Conditions: {dispatchedAlert.criticalDossier.chronicConditions.join(', ')}</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-xs shadow-lg cursor-pointer transition-all active:scale-95"
            >
              Return to WhatsApp Group Feed
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4 overflow-y-auto text-xs">
            {/* Family Member Selection */}
            <div>
              <label className="block font-bold text-zinc-300 mb-2">
                Who requires immediate emergency medical attention?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FAMILY_MEMBERS.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setSelectedMember(member)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      selectedMember.id === member.id
                        ? 'border-red-500 bg-red-950/70 text-white ring-2 ring-red-500/40'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
                    }`}
                  >
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-white">{member.name}</h4>
                      <p className="text-[10px] text-zinc-400">{member.relation} • {member.age} yrs</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Symptom */}
            <div>
              <label className="block font-bold text-zinc-300 mb-1.5">Emergency Nature / Symptoms</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white font-medium focus:outline-red-500"
              >
                <option value="Severe Chest Pain & Radiation to Left Arm (Cardiac)">
                  🫀 Severe Chest Pain &amp; Radiation to Arm (Cardiac SOS)
                </option>
                <option value="Acute Severe Asthma Attack / Inability to Breathe">
                  🫁 Acute Severe Asthma Attack / Gasping
                </option>
                <option value="Unconscious / Unresponsive / Fainting Episode">
                  ⚠️ Unconscious / Unresponsive / Syncope
                </option>
                <option value="Severe Allergic Reaction / Anaphylaxis (Penicillin/Food)">
                  🚨 Severe Allergic Reaction / Throat Swelling
                </option>
                <option value="Accidental Fall / Head Injury / Severe Bleeding">
                  🩸 Severe Fall / Head Injury / Bleeding
                </option>
              </select>
            </div>

            {/* GPS Live Location */}
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Live GPS Acquired
                </span>
                <p className="text-xs text-zinc-200 truncate">Flat 402, Green Glen Layout, Bellandur, Bengaluru</p>
              </div>
            </div>

            {/* Trigger Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTriggerSOS}
                className="w-full py-4 bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:to-red-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-red-950 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Siren className="w-5 h-5" /> Broadcast Emergency SOS to Group &amp; Call Ambulance
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
