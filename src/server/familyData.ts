import { FamilyMember } from '../types.ts';

export const FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'mem_rahul',
    name: 'Rahul Sharma',
    relation: 'Self',
    age: 42,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    bloodGroup: 'B Positive',
    conditions: ['Type 2 Diabetes Mellitus', 'Stage 1 Essential Hypertension'],
    allergies: ['Penicillin & Beta-Lactams (Severe Anaphylactoid - Augmentin)'],
    activeMeds: ['Glycomet 500 SR (Metformin)', 'Telma 40 (Telmisartan)', 'Rozavel 10 (Rosuvastatin)'],
    lastCheckup: '2026-08-15 (Dr. Sunita Rao)',
  },
  {
    id: 'mem_sunita',
    name: 'Sunita Sharma',
    relation: 'Wife',
    age: 39,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
    bloodGroup: 'O Positive',
    conditions: ['Chronic Migraine', 'Subclinical Hypothyroidism'],
    allergies: ['Sulfa drugs (Cotrimoxazole - skin rash)'],
    activeMeds: ['Thyronorm 25mcg (Morning empty stomach)', 'Rizatriptan 10mg (SOS for acute migraine)'],
    lastCheckup: '2026-09-02 (Dr. Priya Sharma)',
  },
  {
    id: 'mem_ramesh',
    name: 'Ramesh Sharma',
    relation: 'Father',
    age: 71,
    gender: 'Male',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    bloodGroup: 'B Positive',
    conditions: ['Coronary Artery Disease (Post-Stent 2022)', 'Hypertension', 'Knee Osteoarthritis'],
    allergies: ['Aspirin sensitive (GI bleeding history; uses enteric-coated clopidogrel)'],
    activeMeds: ['Amlodipine 5mg', 'Atorvastatin 20mg', 'Clopidogrel 75mg', 'Shelcal 500mg'],
    lastCheckup: '2026-08-20 (Dr. Anand Mehta)',
  },
  {
    id: 'mem_ananya',
    name: 'Ananya Sharma',
    relation: 'Daughter',
    age: 11,
    gender: 'Female',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
    bloodGroup: 'B Positive',
    conditions: ['Pediatric Allergic Bronchial Asthma', 'Allergic Rhinitis'],
    allergies: ['Peanuts (mild hives)', 'Dust mites / Cat dander'],
    activeMeds: ['Montair LC Kid (Chewable)', 'Budecort 100mcg Inhaler (SOS)', 'Ascoril LS Syrup'],
    lastCheckup: '2026-09-12 (Dr. Rohan Verma)',
  },
];

export function detectFamilyMember(text: string): FamilyMember {
  const t = text.toLowerCase();
  if (t.includes('sunita') || t.includes('wife') || t.includes('migraine') || t.includes('thyronorm') || t.includes('thyroid')) {
    return FAMILY_MEMBERS[1];
  }
  if (t.includes('ramesh') || t.includes('father') || t.includes('dad') || t.includes('papa') || t.includes('stent') || t.includes('clopidogrel') || t.includes('amlodipine') || t.includes('71')) {
    return FAMILY_MEMBERS[2];
  }
  if (t.includes('ananya') || t.includes('daughter') || t.includes('kid') || t.includes('child') || t.includes('montair') || t.includes('asthma') || t.includes('inhaler') || t.includes('11 yr')) {
    return FAMILY_MEMBERS[3];
  }
  return FAMILY_MEMBERS[0]; // Default to Rahul Sharma (Self)
}
