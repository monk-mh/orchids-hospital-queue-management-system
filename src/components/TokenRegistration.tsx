'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addPatient, getQueueState } from '@/lib/queueManager';
import { supabase } from '@/lib/supabase';
import { Patient } from '@/types/queue';
import { CreditCard, CheckCircle2, Sparkles, ShieldCheck, ArrowRight, Loader2, Landmark, Wallet, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface TokenRegistrationProps {
  onRegistered: (patient: Patient) => void;
}

interface PatientData {
  name: string;
  phone: string;
  department: string;
  medicineInfo: string;
}

type RegistrationStep = 'details' | 'payment' | 'processing' | 'success';

const brushedMetalOverlay = "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAuMDMiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIwLjA4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAuMDMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIvPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjAiIHkxPSIyIiB4Mj0iMTAwIiB5Mj0iMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIwLjMiLz48bGluZSB4MT0iMCIgeTE9IjQiIHgyPSIxMDAiIHkyPSI0IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSIwIiB5MT0iNiIgeDI9IjEwMCIgeTI9IjYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMC4zIi8+PC9zdmc+')] bg-repeat";

function PaymentForm({ 
  onSuccess, 
  onCancel 
}: { 
  onSuccess: () => void; 
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !isReady) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-1 rounded-[2rem] bg-gradient-to-br from-[#1a365d] via-[#2c5282] to-[#1e4e8c] shadow-2xl relative"
      >
        <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-30 pointer-events-none rounded-[2rem]`} />
        <div className="bg-[#0a1628]/90 backdrop-blur-3xl rounded-[1.9rem] p-6 border border-white/10 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                <Globe className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">Secure Checkout</span>
            </div>
            <div className="flex gap-2">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <Landmark className="w-4 h-4 text-slate-500" />
              <Wallet className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="min-h-[250px] overflow-y-auto custom-scrollbar">
            <PaymentElement 
              onReady={() => setIsReady(true)}
              options={{
                layout: 'tabs',
              }}
            />
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl"
            >
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider">{error}</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 h-14 text-slate-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !isReady || isProcessing}
          className="flex-1 h-14 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-900/40 transition-all disabled:opacity-50 relative overflow-hidden group"
        >
          <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-30 group-hover:opacity-50 transition-opacity`} />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing</>
            ) : !isReady ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Initializing</>
            ) : (
              <>Complete Payment ₹50</>
            )}
          </span>
        </Button>
      </div>
    </form>
  );
}

export default function TokenRegistration({ onRegistered }: TokenRegistrationProps) {
  const [step, setStep] = useState<RegistrationStep>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [doctorId, setDoctorId] = useState('any');
  const [reservationTime, setReservationTime] = useState('Immediate');
  const [medicineInfo, setMedicineInfo] = useState('');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<{id: string, name: string}[]>([]);
  const [doctors, setDoctors] = useState<{id: string, name: string, department: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: doctorsData } = await supabase
        .from('doctors')
        .select('id, name, department');
      
      if (doctorsData) {
        setDoctors(doctorsData);
        const uniqueDepts = Array.from(new Set(doctorsData.map(d => d.department)))
          .map((name, index) => ({ id: name, name }));
        setDepartments(uniqueDepts);
      }
    };
    fetchData();
  }, []);

  const filteredDoctors = doctors.filter(d => d.department === department);

  const handleStartPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !department) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData: { 
            name, 
            phone, 
            department, 
            medicineInfo,
            doctorId: doctorId === 'any' ? undefined : doctorId,
            reservationTime: reservationTime === 'Immediate' ? undefined : reservationTime
          },
        }),
      });

      const data = await response.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setStep('payment');
      } else {
        throw new Error(data.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment setup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    setStep('processing');
    
    try {
      // Save to Supabase and retrieve the inserted row with token_number
      const { data: insertedData, error: supabaseError } = await supabase
        .from('patients')
        .insert([
          { 
            name, 
            phone, 
            department, 
            medicine_info: medicineInfo,
            doctor_id: doctorId === 'any' ? null : doctorId,
            reservation_time: reservationTime === 'Immediate' ? null : reservationTime,
            type: 'online',
            status: 'waiting'
          }
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('success');
      
      setTimeout(() => {
        onRegistered(insertedData as any);
        setName('');
        setPhone('');
        setDepartment('');
        setStep('details');
        setClientSecret(null);
      }, 2000);
    } catch (error) {
      console.error('Registration failed:', error);
      setStep('details');
    }
  };

  const handleCancel = () => {
    setStep('details');
    setClientSecret(null);
  };

  if (step === 'processing' || step === 'success') {
    return (
      <div className="flex flex-col items-center space-y-6 py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/50 border border-white/20"
        >
          <CheckCircle2 className="w-12 h-12 text-white" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight">
            {step === 'processing' ? 'VERIFYING...' : 'REGISTERED!'}
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            {step === 'processing' ? 'Finalizing security checks' : 'Generating your queue token'}
          </p>
        </div>
        {step === 'processing' && (
          <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5 }}
            />
          </div>
        )}
      </div>
    );
  }

  if (step === 'payment' && clientSecret) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black bg-gradient-to-r from-white via-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter uppercase">
            Payment
          </h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
            Consultation Fee: ₹50
          </p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'night',
              variables: {
                colorPrimary: '#3b82f6',
                colorBackground: '#0a1628',
                colorText: '#f1f5f9',
                colorDanger: '#ef4444',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '16px',
                colorTextSecondary: '#94a3b8',
                colorTextPlaceholder: '#475569',
              },
              rules: {
                '.Input': {
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                },
                '.Tab': {
                  border: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                },
                '.Tab--selected': {
                  border: '1px solid #3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }
              }
            },
          }}
        >
          <PaymentForm
            onSuccess={handlePaymentSuccess}
            onCancel={handleCancel}
          />
        </Elements>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black bg-gradient-to-r from-white via-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tighter uppercase">
          Register
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">
          Fill details to join queue
        </p>
      </div>

      <form onSubmit={handleStartPayment} className="space-y-6">
        <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Patient Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 transition-all text-slate-200 font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 transition-all text-slate-200 font-medium"
                required
              />
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Unit</Label>
                <Select value={department} onValueChange={setDepartment} required>
                  <SelectTrigger className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 text-slate-200">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id} className="text-slate-300 focus:bg-blue-500/20 focus:text-blue-200">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="doctor" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Preferred Doctor</Label>
                <Select value={doctorId} onValueChange={setDoctorId} disabled={!department}>
                  <SelectTrigger className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 text-slate-200">
                    <SelectValue placeholder="Any Available" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                    <SelectItem value="any" className="text-slate-300 focus:bg-blue-500/20 focus:text-blue-200">Any Available</SelectItem>
                    {filteredDoctors.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id} className="text-slate-300 focus:bg-blue-500/20 focus:text-blue-200">
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="time" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Reservation Time</Label>
              <Select value={reservationTime} onValueChange={setReservationTime}>
                <SelectTrigger className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 text-slate-200">
                  <SelectValue placeholder="Immediate" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 rounded-xl">
                  <SelectItem value="Immediate" className="text-slate-300 focus:bg-blue-500/20 focus:text-blue-200">Immediate (Next Available)</SelectItem>
                  {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'].map((time) => (
                    <SelectItem key={time} value={time} className="text-slate-300 focus:bg-blue-500/20 focus:text-blue-200">
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


          <div className="space-y-1.5">
            <Label htmlFor="medicineInfo" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Medicine/Reason (Optional)</Label>
            <Input
              id="medicineInfo"
              value={medicineInfo}
              onChange={(e) => setMedicineInfo(e.target.value)}
              placeholder="Medicine required or reason for visit"
              className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 transition-all text-slate-200 font-medium"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-16 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-900/40 transition-all duration-300 relative overflow-hidden group border border-white/5"
        >
          <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-20 group-hover:opacity-40 transition-opacity`} />
          <span className="relative z-10 flex items-center justify-center gap-3">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Preparing Checkout</>
            ) : (
              <>
                Proceed to Pay ₹50
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </Button>

          <div className="flex flex-col items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                SECURE SSL
              </div>
              <div className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-blue-500" />
                INSTANT TOKEN
              </div>
            </div>
            <div className="px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider">UPI & Bank Transfer Available</span>
              </div>
            </div>
          </div>
      </form>
    </div>
  );
}
