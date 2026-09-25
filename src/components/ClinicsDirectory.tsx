import React, { useState, useEffect } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Search,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Clinic, Doctor, Appointment } from '../types.ts';

interface ClinicsDirectoryProps {
  onBookViaBot: (doctorName: string, clinicName: string, specialty: string, slot?: string) => void;
}

export const ClinicsDirectory: React.FC<ClinicsDirectoryProps> = ({ onBookViaBot }) => {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [searchDoctor, setSearchDoctor] = useState('');
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-09-29');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<Appointment | null>(null);

  const fetchData = async () => {
    try {
      const [resClinics, resDoctors, resApts] = await Promise.all([
        fetch('/api/clinics').then((r) => r.json()),
        fetch('/api/doctors').then((r) => r.json()),
        fetch('/api/appointments').then((r) => r.json()),
      ]);

      if (resClinics.success) setClinics(resClinics.clinics);
      if (resDoctors.success) setDoctors(resDoctors.doctors);
      if (resApts.success) setAppointments(resApts.appointments);
    } catch (e) {
      console.error('Fetch error:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const specialties = ['all', 'Cardiology', 'Diabetology', 'Medicine', 'Dermatology', 'Orthopedics', 'ENT'];

  const filteredDoctors = doctors.filter((doc) => {
    const matchSpecialty = selectedSpecialty === 'all' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchSearch =
      doc.name.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchDoctor.toLowerCase()) ||
      doc.clinicName.toLowerCase().includes(searchDoctor.toLowerCase());
    return matchSpecialty && matchSearch;
  });

  const handleConfirmDirectBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorForBooking || !selectedSlot) return;

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctorForBooking.id,
          date: bookingDate,
          timeSlot: selectedSlot,
          patientName: 'Rahul Sharma',
          patientPhone: '+91 98765 43210',
          symptomsNotes: 'Booked via MedPulse Health Portal',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.appointment);
        fetchData();
      }
    } catch (err) {
      console.error('Booking failed:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 sm:p-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Partner Clinics &amp; Hospital Appointments
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Direct token generation, real-time availability slots &amp; WhatsApp calendar sync
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {appointments.filter((a) => a.status === 'confirmed').length} Active Appointments
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchDoctor}
              onChange={(e) => setSearchDoctor(e.target.value)}
              placeholder="Search by doctor name, hospital, or medical symptom..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm focus:outline-emerald-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {specialties.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSpecialty(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedSpecialty === s
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {s === 'all' ? 'All Specialties' : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Active Appointments Carousel/Notice */}
        {appointments.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Confirmed Clinic Consultations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                        Token: {apt.tokenNumber}
                      </span>
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
                        {apt.specialty}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{apt.doctorName}</h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {apt.clinicName}
                    </p>
                    <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 pt-1">
                      <Calendar className="w-3.5 h-3.5" /> {apt.date} at {apt.timeSlot}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{apt.consultationFee}
                    </span>
                    <p className="text-[10px] text-zinc-500">Pay at Clinic</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctors Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
            Available Doctors &amp; Specialists ({filteredDoctors.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-emerald-500/50 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{doc.specialty}</p>
                      <p className="text-[11px] text-zinc-500 line-clamp-1">{doc.qualification}</p>
                      <span className="text-[10px] text-zinc-400">{doc.experience}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <p className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {doc.clinicName}
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Fee: <strong className="text-zinc-900 dark:text-zinc-100">₹{doc.consultationFee}</strong></span>
                      <span className="text-emerald-600 font-semibold">Available Today</span>
                    </div>
                  </div>

                  {/* Available Slot Chips */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {doc.availableSlots.slice(0, 3).map((slot, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      >
                        {slot}
                      </span>
                    ))}
                    {doc.availableSlots.length > 3 && (
                      <span className="text-[10px] text-zinc-400 self-center">
                        +{doc.availableSlots.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Booking Action Buttons */}
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDoctorForBooking(doc);
                      setSelectedSlot(doc.availableSlots[0]);
                      setBookingSuccess(null);
                    }}
                    className="flex-1 py-2 px-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Quick Slot
                  </button>
                  <button
                    type="button"
                    onClick={() => onBookViaBot(doc.name, doc.clinicName, doc.specialty, doc.availableSlots[0])}
                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Book on WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Clinics Information */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Partner Hospital Hubs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {clinics.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              >
                <img src={c.image} alt={c.name} className="w-full h-24 rounded-xl object-cover mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">{c.type}</span>
                  <span className="text-xs font-bold flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3 h-3 fill-current" /> {c.rating}
                  </span>
                </div>
                <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 mt-1 line-clamp-1">{c.name}</h3>
                <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-1 line-clamp-1">
                  <MapPin className="w-3 h-3 text-zinc-400 shrink-0" /> {c.distance} • {c.address}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Direct Booking Modal */}
      {selectedDoctorForBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Schedule Appointment</h3>
              <button
                type="button"
                onClick={() => setSelectedDoctorForBooking(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Appointment Confirmed!</h4>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-left text-xs space-y-1">
                  <p><strong>Doctor:</strong> {bookingSuccess.doctorName}</p>
                  <p><strong>Hospital:</strong> {bookingSuccess.clinicName}</p>
                  <p><strong>Date &amp; Time:</strong> {bookingSuccess.date} at {bookingSuccess.timeSlot}</p>
                  <p><strong>Token Number:</strong> <span className="text-emerald-600 font-bold">{bookingSuccess.tokenNumber}</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDoctorForBooking(null);
                    setBookingSuccess(null);
                  }}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl font-semibold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmDirectBooking} className="p-5 space-y-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
                  <img
                    src={selectedDoctorForBooking.avatar}
                    alt={selectedDoctorForBooking.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{selectedDoctorForBooking.name}</h4>
                    <p className="text-xs text-emerald-600 font-medium">{selectedDoctorForBooking.specialty}</p>
                    <p className="text-[11px] text-zinc-500">{selectedDoctorForBooking.clinicName}</p>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Appointment Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-zinc-700 dark:text-zinc-300">Select Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctorForBooking.availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          selectedSlot === slot
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorForBooking(null)}
                    className="px-4 py-2 text-zinc-600 dark:text-zinc-400 font-medium text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
