import { Medicine, MedicineOrder, OrderItem } from '../types.ts';

export const MEDICINES: Medicine[] = [
  {
    id: 'med_glycomet',
    name: 'Glycomet 500 SR',
    genericName: 'Metformin Hydrochloride (Sustained Release)',
    category: 'Diabetes',
    dosage: '500 mg',
    packSize: 'Strip of 20 tablets',
    price: 48,
    requiresPrescription: true,
    inStock: true,
    stockCount: 85,
    description: 'First-line anti-hyperglycemic agent for Type 2 Diabetes management. Helps lower blood sugar levels.',
    manufacturer: 'USV Pvt Ltd',
  },
  {
    id: 'med_telma',
    name: 'Telma 40',
    genericName: 'Telmisartan Tablets IP',
    category: 'Cardiology',
    dosage: '40 mg',
    packSize: 'Strip of 15 tablets',
    price: 112,
    requiresPrescription: true,
    inStock: true,
    stockCount: 110,
    description: 'Angiotensin II receptor blocker (ARB) used to treat high blood pressure (hypertension) and protect heart health.',
    manufacturer: 'Glenmark Pharmaceuticals',
  },
  {
    id: 'med_rozavel',
    name: 'Rozavel 10',
    genericName: 'Rosuvastatin Calcium',
    category: 'Cardiology',
    dosage: '10 mg',
    packSize: 'Strip of 10 tablets',
    price: 154,
    requiresPrescription: true,
    inStock: true,
    stockCount: 65,
    description: 'Statin lipid-lowering medication. Reduces LDL cholesterol and triglycerides while raising HDL.',
    manufacturer: 'Sun Pharmaceutical',
  },
  {
    id: 'med_dolo',
    name: 'Dolo 650',
    genericName: 'Paracetamol / Acetaminophen',
    category: 'Pain Relief',
    dosage: '650 mg',
    packSize: 'Strip of 15 tablets',
    price: 34,
    requiresPrescription: false,
    inStock: true,
    stockCount: 300,
    description: 'Analgesic and antipyretic for fast relief from mild-to-moderate fever, headache, and body aches.',
    manufacturer: 'Micro Labs Ltd',
  },
  {
    id: 'med_pan40',
    name: 'Pan 40',
    genericName: 'Pantoprazole Gastro-resistant Tablets',
    category: 'Gastro',
    dosage: '40 mg',
    packSize: 'Strip of 15 tablets',
    price: 94,
    requiresPrescription: false,
    inStock: true,
    stockCount: 140,
    description: 'Proton Pump Inhibitor (PPI) that decreases stomach acid production for acidity, GERD, and gastritis.',
    manufacturer: 'Alkem Laboratories',
  },
  {
    id: 'med_cetzine',
    name: 'Cetzine 10',
    genericName: 'Cetirizine Hydrochloride',
    category: 'Pain Relief',
    dosage: '10 mg',
    packSize: 'Strip of 10 tablets',
    price: 44,
    requiresPrescription: false,
    inStock: true,
    stockCount: 180,
    description: 'Second-generation non-drowsy antihistamine for allergic rhinitis, watery eyes, sneezing, and skin hives.',
    manufacturer: 'Dr. Reddy’s Laboratories',
  },
  {
    id: 'med_augmentin',
    name: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin and Potassium Clavulanate (PENICILLIN CLASS)',
    category: 'Antibiotics',
    dosage: '625 mg',
    packSize: 'Strip of 10 tablets',
    price: 215,
    requiresPrescription: true,
    inStock: true,
    stockCount: 40,
    description: 'Broad-spectrum beta-lactam penicillin antibiotic. [WARNING: CONTRAINDICATED IN PENICILLIN ALLERGIC PATIENTS].',
    manufacturer: 'GlaxoSmithKline (GSK)',
  },
  {
    id: 'med_azee',
    name: 'Azee 500',
    genericName: 'Azithromycin Tablets IP (Macrolide Class)',
    category: 'Antibiotics',
    dosage: '500 mg',
    packSize: 'Strip of 5 tablets',
    price: 132,
    requiresPrescription: true,
    inStock: true,
    stockCount: 75,
    description: 'Macrolide antibiotic for upper and lower respiratory tract infections. Safe alternative for penicillin-allergic patients.',
    manufacturer: 'Cipla Ltd',
  },
  {
    id: 'med_foracort',
    name: 'Foracort 200 Inhaler',
    genericName: 'Budesonide + Formoterol Fumarate',
    category: 'Respiratory',
    dosage: '200 mcg',
    packSize: 'Inhaler 120 metered doses',
    price: 385,
    requiresPrescription: true,
    inStock: true,
    stockCount: 30,
    description: 'Corticosteroid and long-acting bronchodilator for maintenance treatment of asthma and chronic bronchospasm.',
    manufacturer: 'Cipla Ltd',
  },
  {
    id: 'med_calcirol',
    name: 'Calcirol 60K',
    genericName: 'Cholecalciferol (Vitamin D3)',
    category: 'Vitamins',
    dosage: '60,000 IU',
    packSize: 'Pack of 4 capsules',
    price: 68,
    requiresPrescription: false,
    inStock: true,
    stockCount: 160,
    description: 'High-potency Vitamin D3 for bone density, immune health, and correcting vitamin D deficiency.',
    manufacturer: 'Cadila Pharmaceuticals',
  },
  {
    id: 'med_becadexamin',
    name: 'Becadexamin Capsules',
    genericName: 'Multivitamin and Minerals with Zinc',
    category: 'Vitamins',
    dosage: 'Standard',
    packSize: 'Bottle of 30 capsules',
    price: 52,
    requiresPrescription: false,
    inStock: true,
    stockCount: 220,
    description: 'Essential daily multivitamin, zinc, and antioxidant supplement to support vitality and immunity.',
    manufacturer: 'GlaxoSmithKline (GSK)',
  },
];

export const INITIAL_ORDERS: MedicineOrder[] = [
  {
    id: 'ord_301',
    patientName: 'Rahul Sharma',
    patientPhone: '+91 98765 43210',
    items: [
      { medicineId: 'med_glycomet', name: 'Glycomet 500 SR', dosage: '500 mg', price: 48, quantity: 2 },
      { medicineId: 'med_telma', name: 'Telma 40', dosage: '40 mg', price: 112, quantity: 1 },
      { medicineId: 'med_rozavel', name: 'Rozavel 10', dosage: '10 mg', price: 154, quantity: 1 },
    ],
    subtotal: 362,
    deliveryFee: 30,
    total: 392,
    deliveryAddress: 'Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru - 560103',
    deliveryEta: 'Delivered Yesterday at 04:30 PM',
    status: 'delivered',
    paymentMethod: 'Cash on Delivery (WhatsApp Pay)',
    createdAt: '2026-09-23T14:20:00Z',
  },
];

class PharmacyStore {
  private medicines: Medicine[] = [...MEDICINES];
  private orders: MedicineOrder[] = [...INITIAL_ORDERS];

  public getAllMedicines(): Medicine[] {
    return this.medicines;
  }

  public searchMedicines(query: string): Medicine[] {
    const q = query.toLowerCase();
    return this.medicines.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }

  public getMedicineById(id: string): Medicine | undefined {
    return this.medicines.find((m) => m.id === id);
  }

  public getOrders(): MedicineOrder[] {
    return [...this.orders];
  }

  /**
   * Safety check: detects penicillin allergy risk
   */
  public checkAllergyRisk(medicineNames: string[]): { hasRisk: boolean; riskyItem?: string; explanation?: string } {
    for (const name of medicineNames) {
      const lower = name.toLowerCase();
      if (
        lower.includes('amoxicillin') ||
        lower.includes('augmentin') ||
        lower.includes('penicillin') ||
        lower.includes('ampicillin')
      ) {
        return {
          hasRisk: true,
          riskyItem: name,
          explanation:
            'CRITICAL SAFETY WARNING: Patient Rahul Sharma has a documented severe allergy to Penicillin and Beta-Lactam antibiotics (causes hives and bronchospasm). Augmentin/Amoxicillin is strictly contraindicated. Consider safe alternative such as Azithromycin (Azee 500) after doctor confirmation.',
        };
      }
    }
    return { hasRisk: false };
  }

  public createOrder(params: {
    patientName: string;
    patientPhone?: string;
    items: OrderItem[];
    deliveryAddress?: string;
    paymentMethod?: 'Cash on Delivery (WhatsApp Pay)' | 'UPI' | 'Card';
  }): { order?: MedicineOrder; error?: string; allergyWarning?: string } {
    const allergyCheck = this.checkAllergyRisk(params.items.map((i) => i.name));
    if (allergyCheck.hasRisk) {
      return {
        error: allergyCheck.explanation,
        allergyWarning: allergyCheck.explanation,
      };
    }

    const subtotal = params.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 300 ? 0 : 35;
    const total = subtotal + deliveryFee;

    const newOrder: MedicineOrder = {
      id: `ord_${Date.now()}`,
      patientName: params.patientName || 'Rahul Sharma',
      patientPhone: params.patientPhone || '+91 98765 43210',
      items: params.items,
      subtotal,
      deliveryFee,
      total,
      deliveryAddress:
        params.deliveryAddress || 'Flat 402, Green Glen Layout, Outer Ring Road, Bellandur, Bengaluru - 560103',
      deliveryEta: 'Express Delivery in 45-60 mins (Driver: Ramesh K.)',
      status: 'received',
      paymentMethod: params.paymentMethod || 'Cash on Delivery (WhatsApp Pay)',
      createdAt: new Date().toISOString(),
    };

    this.orders.unshift(newOrder);
    return { order: newOrder };
  }
}

export const pharmacyStore = new PharmacyStore();
