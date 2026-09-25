import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Truck,
  Plus,
  Minus,
  MessageSquare,
  ShieldAlert,
  Clock,
} from 'lucide-react';
import { Medicine, MedicineOrder, OrderItem } from '../types.ts';

interface PharmacyStoreProps {
  onOrderViaBot: (medicinesText: string) => void;
}

export const PharmacyStore: React.FC<PharmacyStoreProps> = ({ onOrderViaBot }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [orders, setOrders] = useState<MedicineOrder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<MedicineOrder | null>(null);
  const [allergyAlert, setAllergyAlert] = useState<string | null>(null);

  const fetchPharmacyData = async () => {
    try {
      const [resMeds, resOrders] = await Promise.all([
        fetch('/api/medicines').then((r) => r.json()),
        fetch('/api/orders').then((r) => r.json()),
      ]);

      if (resMeds.success) setMedicines(resMeds.medicines);
      if (resOrders.success) setOrders(resOrders.orders);
    } catch (e) {
      console.error('Fetch pharmacy error:', e);
    }
  };

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const categories = ['all', 'Diabetes', 'Cardiology', 'Pain Relief', 'Antibiotics', 'Gastro', 'Respiratory', 'Vitamins'];

  const filteredMedicines = medicines.filter((m) => {
    const matchCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (med: Medicine) => {
    // Allergy Check for Rahul Sharma
    if (
      med.name.toLowerCase().includes('augmentin') ||
      med.genericName.toLowerCase().includes('amoxicillin') ||
      med.genericName.toLowerCase().includes('penicillin')
    ) {
      setAllergyAlert(
        `CRITICAL ALLERGY ALERT: Patient Rahul Sharma has a severe documented allergy to Penicillin and Beta-Lactam antibiotics (Amoxicillin / Augmentin). This medication is contraindicated! Safe alternative: Azee 500 (Azithromycin).`
      );
      return;
    }

    setCart((prev) => ({
      ...prev,
      [med.id]: (prev[med.id] || 0) + 1,
    }));
  };

  const removeFromCart = (medId: string) => {
    setCart((prev) => {
      const current = prev[medId] || 0;
      if (current <= 1) {
        const { [medId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [medId]: current - 1 };
    });
  };

  const cartItemsCount = Object.values(cart).reduce((sum, count) => sum + count, 0);

  const cartDetails: { medicine: Medicine; quantity: number }[] = Object.entries(cart)
    .map(([medId, quantity]) => {
      const medicine = medicines.find((m) => m.id === medId);
      return medicine ? { medicine, quantity } : null;
    })
    .filter(Boolean) as any[];

  const subtotal = cartDetails.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const deliveryFee = subtotal > 300 || subtotal === 0 ? 0 : 35;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cartDetails.length === 0) return;

    const items: OrderItem[] = cartDetails.map((item) => ({
      medicineId: item.medicine.id,
      name: item.medicine.name,
      dosage: item.medicine.dosage,
      price: item.medicine.price,
      quantity: item.quantity,
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: 'Rahul Sharma',
          patientPhone: '+91 98765 43210',
          items,
          deliveryAddress: 'Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103',
          paymentMethod: 'Cash on Delivery (WhatsApp Pay)',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderSuccess(data.order);
        setCart({});
        setShowCartDrawer(false);
        fetchPharmacyData();
      } else if (data.allergyWarning) {
        setAllergyAlert(data.allergyWarning);
      }
    } catch (e: any) {
      console.error('Order placing failed:', e);
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
                <Pill className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Pharmacy &amp; Prescription Refills
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Automated allergy verification, 45-min express delivery &amp; WhatsApp status tracking
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer relative"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
              {cartItemsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 font-bold text-[11px] flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search & Category Pills */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicines (e.g. Glycomet, Telma, Dolo, Pan 40)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm focus:outline-emerald-600 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === c
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {c === 'all' ? 'All Medicines' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Allergy Alert Banner */}
      {allergyAlert && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-red-800 dark:text-red-300">Medication Safety Guard Triggered</h4>
            <p className="mt-1 leading-relaxed">{allergyAlert}</p>
          </div>
          <button
            onClick={() => setAllergyAlert(null)}
            className="text-red-600 font-bold p-1 hover:bg-red-100 rounded-md cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Order Success Notice */}
      {orderSuccess && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">Order #{orderSuccess.id} Placed!</h4>
            <p className="mt-1">
              Express delivery dispatched to Bellandur. Estimated ETA: 45 mins. WhatsApp updates active!
            </p>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="text-emerald-600 font-bold p-1 hover:bg-emerald-100 rounded-md cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Active Orders Tracker */}
        {orders.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" /> WhatsApp Medicine Deliveries
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300">
                      Order #{ord.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 capitalize">
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-1">
                    {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-100 dark:border-zinc-800 text-zinc-500">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {ord.deliveryEta}
                    </span>
                    <strong className="text-zinc-900 dark:text-zinc-100">₹{ord.total}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medicines Catalog */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
            Available Medicines ({filteredMedicines.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedicines.map((med) => {
              const isPenicillinRisky =
                med.name.toLowerCase().includes('augmentin') ||
                med.genericName.toLowerCase().includes('amoxicillin');

              const inCartCount = cart[med.id] || 0;

              return (
                <div
                  key={med.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isPenicillinRisky
                      ? 'border-red-300 dark:border-red-900/60 bg-red-50/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/50'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {med.category}
                        </span>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{med.name}</h3>
                      </div>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">₹{med.price}</span>
                    </div>

                    <p className="text-xs text-zinc-500 mt-1 italic">{med.genericName}</p>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
                      {med.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {med.packSize}
                      </span>
                      {med.requiresPrescription ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                          Rx Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          OTC / Refill
                        </span>
                      )}
                    </div>

                    {isPenicillinRisky && (
                      <div className="mt-3 p-2 rounded-xl bg-red-100/70 dark:bg-red-950/60 border border-red-300 text-red-900 dark:text-red-300 text-[11px] font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        Penicillin Allergy Hazard for Patient!
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onOrderViaBot(`I want to order ${med.name} (${med.dosage}) to my address`)}
                      className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp Order
                    </button>

                    {inCartCount > 0 ? (
                      <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 p-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <button
                          type="button"
                          onClick={() => removeFromCart(med.id)}
                          className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center cursor-pointer hover:bg-emerald-700"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100 px-1">
                          {inCartCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => addToCart(med)}
                          className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center cursor-pointer hover:bg-emerald-700"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => addToCart(med)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isPenicillinRisky
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">Medicine Order Cart</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCartDrawer(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cartDetails.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Your medicine cart is empty.</p>
                </div>
              ) : (
                cartDetails.map(({ medicine, quantity }) => (
                  <div
                    key={medicine.id}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{medicine.name}</h4>
                      <p className="text-[11px] text-zinc-500">₹{medicine.price} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => removeFromCart(medicine.id)}
                        className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer text-zinc-700 dark:text-zinc-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                      <button
                        onClick={() => addToCart(medicine)}
                        className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartDetails.length > 0 && (
              <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Delivery (Express 45m)</span>
                    <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <span>Total Amount</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" /> Place Express Order (COD / WhatsApp Pay)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
