'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, UserPlus, Trash2, Shield, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  name: string;
  department: string;
  username: string;
  created_at: string;
}

export default function DoctorManagement() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to fetch doctors');
    } else {
      setDoctors(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('doctors')
        .insert([{ name, department, username, password }]);

      if (error) throw error;

      toast.success('Doctor added successfully');
      setName('');
      setDepartment('');
      setUsername('');
      setPassword('');
      setShowAddForm(false);
      fetchDoctors();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to remove this doctor?')) return;

    try {
      const { error } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Doctor removed');
      fetchDoctors();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove doctor');
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.department.toLowerCase().includes(search.toLowerCase()) ||
    d.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Doctor Registry</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Database Management & Access Control</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search doctors..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-slate-950/50 border-slate-800 rounded-xl w-64 focus:ring-blue-500/30 transition-all text-xs font-bold"
            />
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20"
          >
            {showAddForm ? 'Cancel' : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add New Doctor
              </>
            )}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-slate-900/40 backdrop-blur-md border border-blue-500/20 p-8 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Dr. John Smith" 
                className="h-12 bg-slate-950/50 border-slate-800 rounded-xl"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Department</Label>
              <Input 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
                placeholder="Cardiology" 
                className="h-12 bg-slate-950/50 border-slate-800 rounded-xl"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</Label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="smith123" 
                className="h-12 bg-slate-950/50 border-slate-800 rounded-xl"
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</Label>
              <Input 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                className="h-12 bg-slate-950/50 border-slate-800 rounded-xl"
                required 
              />
            </div>
            <div className="lg:col-span-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={submitting}
                className="h-12 bg-white hover:bg-slate-200 text-black rounded-xl px-12 font-black uppercase tracking-widest text-[10px]"
              >
                {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Addition'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-950/50">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6 pl-8">Doctor Name</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6">Unit / Department</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6">ID / Username</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6">Joined Date</TableHead>
              <TableHead className="text-[10px] font-black text-slate-500 uppercase tracking-widest py-6 text-right pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredDoctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3 opacity-30">
                    <Shield className="h-8 w-8 text-slate-500" />
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">No doctors registered</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id} className="border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                  <TableCell className="py-6 pl-8">
                    <div className="font-bold text-slate-200 uppercase tracking-tight">{doctor.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-widest">
                      {doctor.department}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-mono text-slate-400 font-bold">{doctor.username}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold text-slate-500">
                      {new Date(doctor.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg p-2 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
