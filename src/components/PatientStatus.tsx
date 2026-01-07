'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Activity, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Patient } from '@/types/queue';
import { getPatientPosition, getEstimatedWaitTime, getQueueState } from '@/lib/queueManager';

interface PatientStatusProps {
  patient: Patient;
}

const metallicBlueGradient = 'bg-gradient-to-br from-[#1a365d] via-[#2c5282] to-[#1e4e8c]';
const brushedMetalOverlay = "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAuMDMiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2ZmZiIgc3RvcC1vcGFjaXR5PSIwLjA4Ii8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAuMDMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIvPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PGxpbmUgeDE9IjAiIHkxPSIyIiB4Mj0iMTAwIiB5Mj0iMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wMyIgc3Ryb2tlLXdpZHRoPSIwLjMiLz48bGluZSB4MT0iMCIgeTE9IjQiIHgyPSIxMDAiIHkyPSI0IiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjAuNSIvPjxsaW5lIHgxPSIwIiB5MT0iNiIgeDI9IjEwMCIgeTI9IjYiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMC4zIi8+PC9zdmc+')] bg-repeat";

export default function PatientStatus({ patient }: PatientStatusProps) {
  const [position, setPosition] = useState(0);
  const [waitTime, setWaitTime] = useState(0);
  const [currentPatient, setCurrentPatient] = useState(patient);

    useEffect(() => {
      const updateStatus = async () => {
        const { data: updatedPatient, error } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patient.id)
          .single();
        
        if (!error && updatedPatient) {
          setCurrentPatient(updatedPatient);
          
          // Fetch position in queue
          const { count } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('department', updatedPatient.department)
            .eq('status', 'waiting')
            .lt('token_number', updatedPatient.token_number);
          
          setPosition((count || 0) + 1);
          setWaitTime(((count || 0) + 1) * 15); // Simple estimate
        }
      };

      updateStatus();
      
      const channel = supabase
        .channel(`patient-${patient.id}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'patients',
          filter: `id=eq.${patient.id}`
        }, (payload) => {
          setCurrentPatient(payload.new as any);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [patient.id]);

  const getStatusText = () => {
    switch (currentPatient.status) {
      case 'waiting':
        return 'Waiting';
      case 'calling':
        return 'In Consultation';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const progress = position > 0 ? Math.max(0, 100 - (position * 10)) : 100;


  return (
    <div className="space-y-6 w-full max-w-2xl relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-[#0a1628]/95 backdrop-blur-2xl border border-[#3d5a80]/50 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#1a365d]/40"
      >
        <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-20 pointer-events-none`} />
        <div className="relative h-2 bg-gradient-to-r from-[#1a365d] via-[#3182ce] to-[#1a365d]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
        
        <CardHeader className="pb-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-[#7f8c9a] uppercase tracking-[0.4em]">Patient Token</div>
              <CardTitle className="text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-[#63b3ed] to-[#3182ce]">
                #{currentPatient.token_number}
              </CardTitle>
            </div>
            <motion.div 
              animate={currentPatient.status === 'in-consultation' ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`px-6 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest shadow-lg relative overflow-hidden ${
                currentPatient.status === 'in-consultation' 
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                  : 'bg-[#2c5282]/20 border-[#3d5a80]/40 text-[#63b3ed]'
              }`}
            >
              <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-30`} />
              <span className="relative z-10">{getStatusText()}</span>
            </motion.div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-10 pb-12 relative z-10">
          <div className="space-y-5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-[#7f8c9a]">
              <span className="flex items-center gap-2">
                <Building2 className="w-3 h-3 text-[#3182ce]" />
                Unit: {department?.name}
              </span>
              <span>Queue Progression</span>
            </div>
            <div className="relative h-4 bg-[#0c1929] rounded-full overflow-hidden border border-[#3d5a80]/30 p-1 shadow-inner">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[#1a365d] via-[#3182ce] to-[#63b3ed] rounded-full relative"
              >
                <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-30`} />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/20" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: Users, label: 'QUEUE POS', value: position, color: 'text-[#63b3ed]' },
              { icon: Clock, label: 'EST. WAIT', value: `${waitTime}M`, color: 'text-[#63b3ed]' },
              { icon: Activity, label: 'COUNTERS', value: department?.counters || 0, color: 'text-[#7f8c9a]' }
            ].map((stat, i) => (
              <div key={i} className="bg-gradient-to-br from-[#1a365d]/40 to-[#0c1929]/60 border border-[#3d5a80]/30 p-6 rounded-[2rem] flex flex-col items-center gap-4 group hover:border-[#63b3ed]/50 transition-all shadow-xl relative overflow-hidden">
                <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-10`} />
                <stat.icon className={`h-6 w-6 ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity relative z-10`} />
                <div className="text-3xl font-black text-white tracking-tighter relative z-10">{stat.value}</div>
                <div className="text-[9px] font-black text-[#4a5568] tracking-[0.3em] uppercase relative z-10">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3182ce]/20 to-transparent" />
      </motion.div>

      <AnimatePresence>
        {currentPatient.status === 'waiting' && position <= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-amber-500/10 border border-amber-500/30 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group"
          >
            <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-10`} />
            <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
            <div className="relative flex items-center gap-6">
              <div className="p-4 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/40 border border-amber-400/50">
                <Activity className="h-7 w-7 text-black" />
              </div>
              <div className="space-y-1">
                <p className="text-amber-400 font-black uppercase tracking-widest text-[10px]">Action Required</p>
                <p className="text-xs font-bold text-amber-100/90 uppercase tracking-widest leading-relaxed">
                  Your turn is approaching! Please be ready near the consultation area.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {currentPatient.status === 'in-consultation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-emerald-500/10 border border-emerald-500/30 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl relative overflow-hidden group"
          >
            <div className={`absolute inset-0 ${brushedMetalOverlay} opacity-10`} />
            <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
            <div className="relative flex items-center gap-6">
              <div className="p-4 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/40 border border-emerald-400/50">
                <CheckCircle2 className="h-7 w-7 text-black" />
              </div>
              <div className="space-y-1">
                <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px]">Current Status</p>
                <p className="text-xs font-bold text-emerald-100/90 uppercase tracking-widest leading-relaxed">
                  Please proceed to the consultation room now!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-3 text-[9px] font-black text-[#4a5568] uppercase tracking-[0.5em] mt-4">
        <Sparkles className="w-3 h-3 text-[#3182ce]/30" />
        Real-time Queue Sync
        <Sparkles className="w-3 h-3 text-[#3182ce]/30" />
      </div>
    </div>
  );
}

// Helper icons
function Building2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/>
      <path d="M10 10h4"/>
      <path d="M10 14h4"/>
      <path d="M10 18h4"/>
    </svg>
  );
}
