import { Clinic, Doctor, Appointment } from '../types.ts';

export const CLINICS: Clinic[] = [
  {
    id: 'cln_apollo',
    name: 'Apollo Multi-Specialty Clinic',
    type: 'Multi-Specialty Clinic',
    address: 'Plot 42, 80 Feet Road, Koramangala 4th Block, Bengaluru',
    distance: '1.8 km',
    rating: 4.8,
    phone: '+91 80 2553 1122',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80',
  },
  {
    id: 'cln_cityheart',
    name: 'City Heart & Vascular Institute',
    type: 'Hospital',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    distance: '3.2 km',
    rating: 4.9,
    phone: '+91 80 4123 9988',
    image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80',
  },
  {
    id: 'cln_fortis',
    name: 'Fortis Health Pavilion',
    type: 'Hospital',
    address: 'Bannerghatta Main Road, Opp. IIMB, Bengaluru',
    distance: '5.4 km',
    rating: 4.7,
    phone: '+91 80 6621 4400',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=400&q=80',
  },
  {
    id: 'cln_manipal',
    name: 'Manipal Specialty Care Clinic',
    type: 'Multi-Specialty Clinic',
    address: 'Old Airport Road, Kodihalli, Bengaluru',
    distance: '4.1 km',
    rating: 4.8,
    phone: '+91 80 2502 4444',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80',
  },
];

export const DOCTORS: Doctor[] = [
  {
    id: 'doc_sunita',
    clinicId: 'cln_apollo',
    clinicName: 'Apollo Multi-Specialty Clinic',
    name: 'Dr. Sunita Rao',
    specialty: 'Diabetology & Endocrinology',
    qualification: 'MD (Med), DM (Endo), FRCP',
    experience: '16 Years Experience',
    consultationFee: 800,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:30 AM', '11:00 AM', '02:30 PM', '05:00 PM', '06:30 PM'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&q=80',
  },
  {
    id: 'doc_anand',
    clinicId: 'cln_cityheart',
    clinicName: 'City Heart & Vascular Institute',
    name: 'Dr. Anand Mehta',
    specialty: 'Cardiology & Hypertension',
    qualification: 'MD, DM (Cardiology), FACC',
    experience: '20 Years Experience',
    consultationFee: 1000,
    availableDays: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
    availableSlots: ['10:00 AM', '11:30 AM', '03:00 PM', '04:30 PM', '06:00 PM'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&q=80',
  },
  {
    id: 'doc_rajesh',
    clinicId: 'cln_apollo',
    clinicName: 'Apollo Multi-Specialty Clinic',
    name: 'Dr. Rajesh Nair',
    specialty: 'General Internal Medicine',
    qualification: 'MBBS, MD (General Medicine)',
    experience: '14 Years Experience',
    consultationFee: 650,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    availableSlots: ['09:00 AM', '10:30 AM', '12:00 PM', '04:00 PM', '05:30 PM'],
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&q=80',
  },
  {
    id: 'doc_priya',
    clinicId: 'cln_fortis',
    clinicName: 'Fortis Health Pavilion',
    name: 'Dr. Priya Sharma',
    specialty: 'Dermatology & Skin Care',
    qualification: 'MD (Dermatology, Venereology & Leprosy)',
    experience: '11 Years Experience',
    consultationFee: 750,
    availableDays: ['Tuesday', 'Thursday', 'Saturday'],
    availableSlots: ['11:00 AM', '01:00 PM', '03:30 PM', '05:00 PM'],
    avatar: 'https://images.unsplash.com/photo-1594824813580-5a3311ef34a0?w=150&q=80',
  },
  {
    id: 'doc_vikram',
    clinicId: 'cln_fortis',
    clinicName: 'Fortis Health Pavilion',
    name: 'Dr. Vikram Sen',
    specialty: 'Orthopedics & Joint Replacement',
    qualification: 'MS (Ortho), MCh (Ortho, UK)',
    experience: '18 Years Experience',
    consultationFee: 900,
    availableDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
    availableSlots: ['10:00 AM', '12:30 PM', '04:00 PM', '06:00 PM'],
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&q=80',
  },
  {
    id: 'doc_rohan',
    clinicId: 'cln_manipal',
    clinicName: 'Manipal Specialty Care Clinic',
    name: 'Dr. Rohan Verma',
    specialty: 'ENT & Allergy Specialist',
    qualification: 'MS (ENT), DNB',
    experience: '9 Years Experience',
    consultationFee: 700,
    availableDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
    availableSlots: ['09:30 AM', '11:30 AM', '02:00 PM', '04:30 PM'],
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&q=80',
  },
];

// Initial bookings
export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_901',
    patientName: 'Rahul Sharma',
    patientPhone: '+91 98765 43210',
    doctorId: 'doc_anand',
    doctorName: 'Dr. Anand Mehta',
    specialty: 'Cardiology & Hypertension',
    clinicName: 'City Heart & Vascular Institute',
    clinicAddress: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    date: '2026-09-28',
    timeSlot: '11:30 AM',
    tokenNumber: 'CARD-42',
    status: 'confirmed',
    consultationFee: 1000,
    symptomsNotes: 'Routine 4-month BP & lipid review. Bring home BP records.',
    createdAt: '2026-09-22T10:15:00Z',
  },
];

class ClinicStore {
  private appointments: Appointment[] = [...INITIAL_APPOINTMENTS];

  public getClinics(): Clinic[] {
    return CLINICS;
  }

  public getDoctors(specialty?: string, clinicId?: string): Doctor[] {
    return DOCTORS.filter((d) => {
      if (specialty && !d.specialty.toLowerCase().includes(specialty.toLowerCase())) return false;
      if (clinicId && d.clinicId !== clinicId) return false;
      return true;
    });
  }

  public getDoctorById(id: string): Doctor | undefined {
    return DOCTORS.find((d) => d.id === id);
  }

  public getAppointments(): Appointment[] {
    return [...this.appointments];
  }

  public bookAppointment(params: {
    patientName: string;
    patientPhone?: string;
    doctorId: string;
    date: string;
    timeSlot: string;
    symptomsNotes?: string;
  }): Appointment {
    const doctor = this.getDoctorById(params.doctorId) || DOCTORS[0];
    const clinic = CLINICS.find((c) => c.id === doctor.clinicId) || CLINICS[0];

    const tokenNumber = `${doctor.specialty.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      patientName: params.patientName || 'Rahul Sharma',
      patientPhone: params.patientPhone || '+91 98765 43210',
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      clinicName: clinic.name,
      clinicAddress: clinic.address,
      date: params.date,
      timeSlot: params.timeSlot,
      tokenNumber,
      status: 'confirmed',
      consultationFee: doctor.consultationFee,
      symptomsNotes: params.symptomsNotes || 'Booked via MedPulse WhatsApp Bot',
      createdAt: new Date().toISOString(),
    };

    this.appointments.unshift(newAppointment);
    return newAppointment;
  }

  public cancelAppointment(id: string): boolean {
    const apt = this.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = 'cancelled';
      return true;
    }
    return false;
  }
}

export const clinicStore = new ClinicStore();
