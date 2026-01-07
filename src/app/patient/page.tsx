'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TokenRegistration from '@/components/TokenRegistration';
import PatientStatus from '@/components/PatientStatus';
import { Patient } from '@/types/queue';

export default function PatientPage() {
  const [registeredPatient, setRegisteredPatient] = useState<Patient | null>(null);

  const handleRegistered = (patient: Patient) => {
    setRegisteredPatient(patient);
  };

  const handleNewRegistration = () => {
    setRegisteredPatient(null);
  };

    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-hidden">
        {/* Background Decor */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 py-8 relative">
          <div className="mb-12">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Portal
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-400 to-slate-400">
                PATIENT PORTAL
              </h1>
              <p className="text-slate-400 font-medium tracking-[0.2em] uppercase text-xs">
                SECURE QUEUE REGISTRATION & TRACKING
              </p>
            </div>

            {!registeredPatient ? (
              <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                <div className="relative">
                  <TokenRegistration onRegistered={handleRegistered} />
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center space-y-8">
                <div className="w-full max-w-2xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
                  <PatientStatus patient={registeredPatient} />
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleNewRegistration}
                  className="bg-transparent border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/5 transition-all px-8 py-6 rounded-2xl font-bold uppercase tracking-widest text-xs"
                >
                  Register Another Patient
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
}