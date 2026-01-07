'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getQueueState, getDepartmentStats } from '@/lib/queueManager';
import { Patient, Department } from '@/types/queue';
import { Clock, Users, CheckCircle2, Activity } from 'lucide-react';

export default function QueueTrackingPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadData = () => {
      const state = getQueueState();
      setDepartments(state.departments);
      setPatients(state.patients);
    };

    loadData();
    const interval = setInterval(loadData, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const getCurrentlyServing = (deptId: string) => {
    return patients
      .filter(p => p.department === deptId && p.status === 'in-consultation')
      .sort((a, b) => (b.calledAt?.getTime() || 0) - (a.calledAt?.getTime() || 0));
  };

  const getNextInQueue = (deptId: string) => {
    return patients
      .filter(p => p.department === deptId && p.status === 'waiting')
      .sort((a, b) => a.joinedAt.getTime() - b.joinedAt.getTime())
      .slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Activity className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-400 to-slate-400">
                LIVE QUEUE
              </h1>
              <p className="text-slate-400 font-medium tracking-widest uppercase text-xs mt-1">
                Real-time Hospital Status Monitor
              </p>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl flex items-center gap-6">
            <div className="text-right">
              <div className="text-4xl font-mono font-bold text-blue-400">
                {currentTime.toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                {currentTime.toLocaleDateString('en-IN', { 
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'WAITING', value: patients.filter(p => p.status === 'waiting').length, icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'SERVING', value: patients.filter(p => p.status === 'in-consultation').length, icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'COMPLETED', value: patients.filter(p => p.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'DEPTS', value: departments.length, icon: Clock, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 p-6 rounded-2xl hover:border-blue-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
              </div>
              <div className={`text-4xl font-black ${stat.color}`}>
                {stat.value.toString().padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {departments.map((dept) => {
            const stats = getDepartmentStats(dept.id);
            const serving = getCurrentlyServing(dept.id);
            const nextInQueue = getNextInQueue(dept.id);

            return (
              <div key={dept.id} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/20 to-transparent rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                <div className="relative bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-full">
                  <div className="p-6 border-b border-slate-800/50">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        {dept.name}
                      </h2>
                      <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 tracking-wider uppercase">
                        {dept.counters} COUNTERS
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1.5 rounded-xl border border-slate-700/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">WAITING: {stats.waiting}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1.5 rounded-xl border border-slate-700/50">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">SERVING: {stats.inConsultation}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-800/30 px-3 py-1.5 rounded-xl border border-slate-700/50 ml-auto">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">~{dept.averageWaitTime}M WAIT</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                    {/* Currently Serving */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-blue-400/80 tracking-[0.25em] uppercase px-1">
                        NOW SERVING
                      </h3>
                      <div className="space-y-3">
                        {serving.length > 0 ? (
                          serving.map((patient) => (
                            <div
                              key={patient.id}
                              className="relative overflow-hidden p-4 bg-gradient-to-br from-blue-600/20 to-blue-900/10 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-blue-100">{patient.name}</span>
                                <span className="text-[10px] font-black text-blue-400">COUNTER {Math.ceil(Math.random() * dept.counters)}</span>
                              </div>
                              <div className="text-4xl font-black text-white tracking-tighter">
                                {patient.tokenNumber}
                              </div>
                              <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Activity className="h-12 w-12" />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center p-8 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/50 text-slate-500 text-xs font-bold uppercase tracking-widest text-center">
                            NO ACTIVE SESSIONS
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Next in Queue */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase px-1">
                        NEXT IN QUEUE
                      </h3>
                      <div className="space-y-2">
                        {nextInQueue.length > 0 ? (
                          nextInQueue.map((patient, index) => (
                            <div
                              key={patient.id}
                              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                index === 0 
                                  ? 'bg-slate-800/80 border-slate-600 shadow-lg' 
                                  : 'bg-slate-900/40 border-slate-800/50'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`text-2xl font-black tracking-tighter ${
                                  index === 0 ? 'text-blue-400' : 'text-slate-600'
                                }`}>
                                  {patient.tokenNumber}
                                </div>
                                <div className={`text-xs font-bold uppercase tracking-tight ${
                                  index === 0 ? 'text-slate-200' : 'text-slate-600'
                                }`}>
                                  {patient.name}
                                </div>
                              </div>
                              {index === 0 && (
                                <div className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 animate-pulse">
                                  UP NEXT
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="h-full flex items-center justify-center p-8 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700/50 text-slate-500 text-xs font-bold uppercase tracking-widest text-center">
                            QUEUE EMPTY
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center justify-between py-6 border-t border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            <span className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase">SYSTEM ACTIVE • SYNCING REAL-TIME</span>
          </div>
          <div className="text-[10px] font-black text-slate-600 tracking-[0.1em] uppercase">
            REFRESH RATE: 2000MS
          </div>
        </div>
      </div>
    </div>
  );
}