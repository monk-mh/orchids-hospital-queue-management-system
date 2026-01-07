'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Activity, LogOut, Users, CheckCircle2, PhoneForwarded, User, ClipboardList, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  phone: string;
  department: string;
  medicine_info: string;
  status: string;
  token_number: number;
  created_at: string;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedDoctor = sessionStorage.getItem('doctor');
    if (!storedDoctor) {
      router.push('/doctor/login');
      return;
    }
    const doctorData = JSON.parse(storedDoctor);
    setDoctor(doctorData);
    fetchPatients(doctorData.department);

    // Subscribe to changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchPatients(doctorData.department);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPatients = async (dept: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('department', dept)
      .order('token_number', { ascending: true });

    if (!error && data) {
      setPatients(data);
      const calling = data.find(p => p.status === 'calling');
      setCurrentPatient(calling || null);
    }
    setLoading(false);
  };

    const handleCallNext = async () => {
      if (!doctor) return;
      setActionLoading(true);
  
      try {
        // 1. Mark current patient as completed if exists
        if (currentPatient) {
          await supabase
            .from('patients')
            .update({ status: 'completed' })
            .eq('id', currentPatient.id);
        }
  
        // 2. Find next patient:
        // Prioritize patients who chose THIS doctor specifically, 
        // then those who chose 'Any Available' (null doctor_id)
        const { data: nextPatients, error: nextError } = await supabase
          .from('patients')
          .select('*')
          .eq('department', doctor.department)
          .eq('status', 'waiting')
          .order('token_number', { ascending: true });
  
        if (nextError) throw nextError;
  
        // Filter: Specific match first, then null matches
        let targetPatient = nextPatients?.find(p => p.doctor_id === doctor.id);
        if (!targetPatient) {
          targetPatient = nextPatients?.find(p => !p.doctor_id);
        }
  
        if (targetPatient) {
          await supabase
            .from('patients')
            .update({ status: 'calling', doctor_id: doctor.id })
            .eq('id', targetPatient.id);
          toast.success(`Calling ${targetPatient.name}`);
        } else {
          toast.info('No eligible patients in queue');
        }
      } catch (err: any) {
        toast.error(err.message || 'Action failed');
      } finally {
        setActionLoading(false);
      }
    };


  const handleMarkChecked = async (patientId: string) => {
    setActionLoading(true);
    await supabase
      .from('patients')
      .update({ status: 'completed' })
      .eq('id', patientId);
    if (currentPatient?.id === patientId) setCurrentPatient(null);
    setActionLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('doctor');
    router.push('/doctor/login');
  };

  if (!doctor) return null;

  const waitingPatients = patients.filter(p => p.status === 'waiting');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
      {/* Sidebar/Header */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <div className="p-2.5 rounded-xl bg-blue-600 shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">{doctor.name}</h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{doctor.department} Department</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button 
                variant="ghost" 
                className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl px-4 text-xs font-bold uppercase tracking-widest"
              >
                Portal
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl px-4 text-xs font-bold uppercase tracking-widest"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Action Area */}
          <div className="lg:col-span-8 space-y-8">
            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <User className="w-64 h-64" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                  <div>
                    <h2 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Currently Serving</h2>
                    <h3 className="text-4xl font-black text-white tracking-tighter">
                      {currentPatient ? currentPatient.name : 'No Active Patient'}
                    </h3>
                  </div>
                  <Button 
                    onClick={handleCallNext}
                    disabled={actionLoading || (waitingPatients.length === 0 && !currentPatient)}
                    className="h-16 px-8 bg-white hover:bg-blue-500 text-black hover:text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-2xl group"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : (
                      <>
                        {currentPatient ? 'Call Next Patient' : 'Start Calling'}
                        <PhoneForwarded className="ml-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>

                {currentPatient ? (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Token No.</Label>
                        <span className="text-5xl font-black text-blue-500 tracking-tighter">#{currentPatient.token_number}</span>
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800/50">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Reason / Medicine</Label>
                        <p className="text-slate-300 font-medium">{currentPatient.medicine_info || 'Routine Checkup'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-end">
                      <Button 
                        onClick={() => handleMarkChecked(currentPatient.id)}
                        variant="outline"
                        className="h-16 border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                      >
                        <CheckCircle2 className="mr-3 h-5 w-5" />
                        Complete Checkup
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl">
                    <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for next patient in queue</p>
                  </div>
                )}
              </div>
            </section>

            {/* Waiting List */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-3">
                  <ClipboardList className="h-5 w-5 text-blue-500" />
                  Upcoming Patients
                </h3>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  {waitingPatients.length} Waiting
                </span>
              </div>
              
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {waitingPatients.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group bg-slate-900/40 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 group-hover:border-blue-500/30 transition-colors">
                            <span className="text-xl font-black text-slate-400 group-hover:text-blue-500">#{p.token_number}</span>
                          </div>
                          <div>
                            <h4 className="text-white font-bold">{p.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{p.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Status</p>
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            Waiting
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {waitingPatients.length === 0 && (
                    <div className="text-center py-12 text-slate-600 font-medium">
                      No patients waiting in queue
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* Stats/Info Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] p-8">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Department Stats</h3>
              <div className="space-y-6">
                {[
                  { label: 'Total Handled', val: patients.filter(p => p.status === 'completed').length, color: 'bg-emerald-500' },
                  { label: 'In Queue', val: waitingPatients.length, color: 'bg-blue-500' },
                  { label: 'Today Total', val: patients.length, color: 'bg-indigo-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                      <span className="text-xs font-bold text-slate-400">{stat.label}</span>
                    </div>
                    <span className="text-xl font-black text-white">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10">
              <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Professional Ethics</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Ensure patient privacy during consultation. Mark patients as checked up immediately after completion to maintain queue accuracy.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .Label { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
      `}</style>
    </div>
  );
}

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={`text-[10px] font-black uppercase tracking-widest ${className}`}>
    {children}
  </label>
);
