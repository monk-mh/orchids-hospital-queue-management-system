'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getQueueState, addPatient } from '@/lib/queueManager';
import { Department } from '@/types/queue';
import { supabase } from '@/lib/supabase';
import { Monitor, Printer, UserPlus, Search, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Doctor {
  id: string;
  name: string;
  department: string;
}

export default function ReceptionPortal() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('any');
  const [loading, setLoading] = useState(false);
  const [tokenResult, setTokenResult] = useState<{ name: string; token: string } | null>(null);

  useEffect(() => {
    const state = getQueueState();
    setDepartments(state.departments);
    
    const fetchDoctors = async () => {
      const { data } = await supabase.from('doctors').select('id, name, department');
      if (data) setDoctors(data);
    };
    fetchDoctors();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) {
      toast.error('Please select a department');
      return;
    }

    setLoading(true);
    try {
      const patient = addPatient({
        name,
        phone,
        department: selectedDept,
        doctorId: selectedDoctor === 'any' ? undefined : selectedDoctor,
        type: 'offline'
      });

      setTokenResult({ name: patient.name, token: patient.tokenNumber });
      toast.success('Token generated successfully');
      
      // Reset form
      setName('');
      setPhone('');
      setSelectedDoctor('any');
    } catch (err) {
      toast.error('Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d => d.department === departments.find(dept => dept.id === selectedDept)?.name);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full bg-slate-900/50 border border-slate-800">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase text-white">Reception Desk</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Offline Token Generation & Registration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-500 uppercase">System Status</p>
              <p className="text-xs font-bold text-emerald-500">OPERATIONAL</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Monitor className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Registration Form */}
          <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Patient Registration</CardTitle>
              </div>
              <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">Register walk-in patients</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <form onSubmit={handleBooking} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter patient name" 
                      className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</Label>
                    <Input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number" 
                      className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 transition-all"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Department</Label>
                      <Select value={selectedDept} onValueChange={setSelectedDept}>
                        <SelectTrigger className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id} className="text-slate-200">{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Preferred Doctor</Label>
                      <Select value={selectedDoctor} onValueChange={setSelectedDoctor} disabled={!selectedDept}>
                        <SelectTrigger className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl">
                          <SelectValue placeholder="Any Available" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800">
                          <SelectItem value="any" className="text-slate-200">Any Available</SelectItem>
                          {filteredDoctors.map(doc => (
                            <SelectItem key={doc.id} value={doc.id} className="text-slate-200">{doc.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 bg-white hover:bg-blue-600 text-black hover:text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all shadow-xl"
                >
                  {loading ? 'Processing...' : 'Generate Token'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Token Display / Recent Tokens */}
          <div className="space-y-8">
            {tokenResult ? (
              <Card className="bg-blue-600 border-blue-400 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(37,99,235,0.3)] animate-in zoom-in-95 duration-300">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="inline-block p-4 rounded-3xl bg-white/20 backdrop-blur-md mb-4">
                    <Printer className="h-12 w-12 text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Patient Token Generated</p>
                    <h2 className="text-7xl font-black text-white tracking-tighter">{tokenResult.token}</h2>
                    <p className="text-xl font-bold text-white uppercase tracking-tight">{tokenResult.name}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 bg-white/10 hover:bg-white/20 border-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-xl"
                    onClick={() => setTokenResult(null)}
                  >
                    Print & Clear
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-900/40 backdrop-blur-xl border-slate-800 rounded-[2.5rem] h-full">
                <CardHeader className="p-8">
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-slate-500" />
                    <CardTitle className="text-xl font-black uppercase tracking-tight text-white">Live Monitoring</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-50">
                  <div className="h-16 w-16 rounded-full border-4 border-slate-800 border-t-blue-500 animate-spin" />
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Waiting for next registration...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
