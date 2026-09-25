import { MedicinePriceComparison, PlatformPriceOption } from '../types.ts';

interface LocalPharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  rating: number;
  isOpen24Hours: boolean;
  deliveryAvailable: boolean;
}

export const LOCAL_PHARMACIES: LocalPharmacy[] = [
  {
    id: 'ph_apollo_koramangala',
    name: 'Apollo Pharmacy 24x7',
    address: 'Plot 18, 80 Feet Road, 4th Block, Koramangala, Bengaluru',
    distance: '450 meters (3 min drive)',
    phone: '+91 80 4112 8899',
    rating: 4.8,
    isOpen24Hours: true,
    deliveryAvailable: true,
  },
  {
    id: 'ph_medplus_100ft',
    name: 'MedPlus Health & Diagnostics',
    address: 'Near Sony World Signal, 100 Feet Road, Koramangala',
    distance: '750 meters (5 min drive)',
    phone: '+91 80 2553 4422',
    rating: 4.7,
    isOpen24Hours: false,
    deliveryAvailable: true,
  },
  {
    id: 'ph_frank_ross',
    name: 'Frank Ross Care Pharmacy',
    address: '5th Block Industrial Layout, Koramangala',
    distance: '1.2 km (8 min drive)',
    phone: '+91 80 4123 7711',
    rating: 4.6,
    isOpen24Hours: false,
    deliveryAvailable: true,
  },
  {
    id: 'ph_guardian',
    name: 'Guardian 24/7 Lifecare',
    address: '12th Main, HAL 2nd Stage, Indiranagar, Bengaluru',
    distance: '2.4 km (12 min drive)',
    phone: '+91 80 2520 9900',
    rating: 4.9,
    isOpen24Hours: true,
    deliveryAvailable: true,
  },
];

// Price database for multi-platform aggregation
const BASE_MEDICINES_DATA: Record<string, { generic: string; dosage: string; pack: string; mrp: number }> = {
  glycomet: { generic: 'Metformin Hydrochloride SR', dosage: '500 mg', pack: 'Strip of 20 tablets', mrp: 62 },
  telma: { generic: 'Telmisartan IP', dosage: '40 mg', pack: 'Strip of 15 tablets', mrp: 145 },
  rozavel: { generic: 'Rosuvastatin Calcium', dosage: '10 mg', pack: 'Strip of 10 tablets', mrp: 198 },
  dolo: { generic: 'Paracetamol / Acetaminophen', dosage: '650 mg', pack: 'Strip of 15 tablets', mrp: 42 },
  pan: { generic: 'Pantoprazole Gastro-Resistant', dosage: '40 mg', pack: 'Strip of 15 tablets', mrp: 120 },
  cetzine: { generic: 'Cetirizine Hydrochloride', dosage: '10 mg', pack: 'Strip of 10 tablets', mrp: 55 },
  montair: { generic: 'Montelukast Sodium + Levocetirizine', dosage: 'Kid Chewable', pack: 'Strip of 10 tablets', mrp: 175 },
  thyronorm: { generic: 'Thyroxine Sodium IP', dosage: '25 mcg', pack: 'Bottle of 120 tablets', mrp: 210 },
  budecort: { generic: 'Budesonide Inhalation Suspension', dosage: '100 mcg', pack: 'Metered Dose Inhaler 200 doses', mrp: 380 },
  ecosprin: { generic: 'Enteric Coated Aspirin + Atorvastatin', dosage: '75/20 mg', pack: 'Strip of 15 capsules', mrp: 185 },
  azee: { generic: 'Azithromycin Tablets IP', dosage: '500 mg', pack: 'Strip of 5 tablets', mrp: 155 },
  calcirol: { generic: 'Cholecalciferol Vitamin D3', dosage: '60,000 IU', pack: 'Pack of 4 capsules', mrp: 85 },
};

export function compareMedicinePrices(query: string): MedicinePriceComparison {
  const q = query.toLowerCase();
  let matchedKey = Object.keys(BASE_MEDICINES_DATA).find((k) => q.includes(k));
  if (!matchedKey) matchedKey = 'glycomet';

  const base = BASE_MEDICINES_DATA[matchedKey];
  const mrp = base.mrp;

  const options: PlatformPriceOption[] = [
    {
      platform: 'Apollo 24|7',
      price: Math.round(mrp * 0.88),
      mrp,
      discountPercent: 12,
      deliveryTime: '19 - 30 Mins (Express Store Rider)',
      deliveryBadge: '⚡ FASTEST DELIVERY',
      isFastest: true,
      purchaseUrl: `https://www.apollo247.com/pharmacy/search/${encodeURIComponent(query)}`,
      inStock: true,
    },
    {
      platform: 'PharmEasy',
      price: Math.round(mrp * 0.76),
      mrp,
      discountPercent: 24,
      deliveryTime: 'Today by 8:00 PM',
      deliveryBadge: '💰 LOWEST PRICE (24% OFF)',
      isCheapest: true,
      purchaseUrl: `https://pharmeasy.in/search/all?name=${encodeURIComponent(query)}`,
      inStock: true,
    },
    {
      platform: 'Tata 1mg',
      price: Math.round(mrp * 0.82),
      mrp,
      discountPercent: 18,
      deliveryTime: 'Tomorrow Morning',
      deliveryBadge: '⭐ TRUSTED CARE (18% OFF)',
      purchaseUrl: `https://www.1mg.com/search/all?name=${encodeURIComponent(query)}`,
      inStock: true,
    },
    {
      platform: 'Netmeds',
      price: Math.round(mrp * 0.80),
      mrp,
      discountPercent: 20,
      deliveryTime: 'Tomorrow by 2:00 PM',
      deliveryBadge: '20% OFF',
      purchaseUrl: `https://www.netmeds.com/catalogsearch/result/${encodeURIComponent(query)}/all`,
      inStock: true,
    },
  ];

  return {
    medicineName: query.trim(),
    genericName: base.generic,
    dosage: base.dosage,
    packSize: base.pack,
    bestCheapestPlatform: 'PharmEasy (₹' + options[1].price + ' - 24% Off)',
    bestFastestPlatform: 'Apollo 24|7 (19 mins via express rider)',
    options,
  };
}
