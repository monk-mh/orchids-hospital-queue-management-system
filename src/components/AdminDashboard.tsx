'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getQueueState } from '@/lib/queueManager';
import { Patient, Department } from '@/types/queue';
import { Users, Clock, Activity, CheckCircle, PhoneCall, Shield, Globe, UserMinus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    // Get departments from local state (static for now as per previous logic)
    const state = getQueueState();
    setDepartments(state.departments);
    if (!selectedDept && state.departments.length > 0) {
      setSelectedDept(state.departments[0].id);
    }

    // Get patients from Supabase
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPatients(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedDept]);

  const handleCallNext = async () => {
    const deptName = departments.find(d => d.id === selectedDept)?.name;
    if (!deptName) return;

    const nextPatient = patients.find(p => p.department === deptName && p.status === 'waiting');
    if (nextPatient) {
      const { error } = await supabase
        .from('patients')
        .update({ status: 'calling' })
        .eq('id', nextPatient.id);
      
      if (!error) {
        toast.success(`Calling ${nextPatient.name}`);
        fetchData();
      }
    }
  };

  const handleComplete = async (patientId: string) => {
    const { error } = await supabase
      .from('patients')
      .update({ status: 'completed' })
      .eq('id', patientId);
    
    if (!error) {
      toast.success('Consultation completed');
      fetchData();
    }
  };

  const selectedDeptName = departments.find(d => d.id === selectedDept)?.name;
  const deptPatients = patients.filter(p => p.department === selectedDeptName);
  
  const waiting = deptPatients.filter(p => p.status === 'waiting');
  const inConsultation = deptPatients.filter(p => p.status === 'calling');
  const completed = deptPatients.filter(p => p.status === 'completed');

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-8 p-8 bg-[#020617] min-h-screen">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'WAITING', value: waiting.length, color: 'text-amber-400', border: 'border-amber-500/20' },
          { icon: Activity, label: 'SERVING', value: inConsultation.length, color: 'text-blue-400', border: 'border-blue-500/20' },
          { icon: CheckCircle, label: 'DONE', value: completed.length, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { icon: Clock, label: 'DEPT', value: selectedDeptName?.substring(0, 4) || '...', color: 'text-indigo-400', border: 'border-indigo-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-slate-900/40 backdrop-blur-md border ${stat.border} p-6 rounded-2xl flex flex-col gap-2 hover:bg-slate-800/40 transition-all group`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">{stat.label}</span>
              <stat.icon className={`h-4 w-4 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Department Selection */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-200 tracking-tight uppercase">Department Logistics</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select unit to monitor</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {departments.map((dept) => (
            <Button
              key={dept.id}
              variant="ghost"
              onClick={() => setSelectedDept(dept.id)}
              className={`px-6 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all ${
                selectedDept === dept.id 
                  ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-blue-500/30 hover:text-blue-400'
              }`}
            >
              {dept.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Patient Tables */}
      <Tabs defaultValue="waiting" className="space-y-6">
        <TabsList className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl h-auto flex gap-1.5">
          {['waiting', 'calling', 'completed'].map((tab) => (
            <TabsTrigger 
              key={tab} 
              value={tab} 
              className="flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"
            >
              {tab === 'calling' ? 'In Consultation' : tab.charAt(0).toUpperCase() + tab.slice(1)} (
              {tab === 'waiting' ? waiting.length : tab === 'calling' ? inConsultation.length : completed.length}
              )
            </TabsTrigger>
          ))}
        </TabsList>

        {['waiting', 'calling', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-950/50">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-4 pl-8">Token</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-4">Patient Details</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-4">Booking Info</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-4">Type</TableHead>
                    <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-4 text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(tab === 'waiting' ? waiting : tab === 'calling' ? inConsultation : completed).map((patient) => (
                    <TableRow key={patient.id} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <TableCell className="py-6 pl-8">
                        <div className="text-2xl font-black text-blue-400 tracking-tighter">#{patient.token_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-200 uppercase tracking-tight text-sm">{patient.name}</div>
                        <div className="text-[10px] font-medium text-slate-500 font-mono">{patient.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-bold text-slate-400">
                          {patient.reservation_time || 'Immediate'}
                        </div>
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">RESERVATION</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[8px] font-black uppercase tracking-widest ${patient.type === 'online' ? 'border-blue-500/30 text-blue-400' : 'border-amber-500/30 text-amber-400'}`}>
                          {patient.type || 'ONLINE'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        {tab === 'calling' ? (
                          <Button
                            size="sm"
                            onClick={() => handleComplete(patient.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[9px] px-4 py-2 rounded-lg"
                          >
                            Complete
                          </Button>
                        ) : tab === 'waiting' ? (
                          <Badge variant="outline" className="text-slate-600 border-slate-800">WAITING</Badge>
                        ) : (
                          <CheckCircle className="h-4 w-4 text-emerald-500 ml-auto" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(tab === 'waiting' ? waiting : tab === 'calling' ? inConsultation : completed).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3 opacity-30">
                          <Activity className="h-8 w-8 text-slate-500" />
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No records found</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
