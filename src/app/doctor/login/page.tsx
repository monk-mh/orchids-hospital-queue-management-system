'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Activity, Loader2, Lock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DoctorLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('doctors')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (dbError || !data) {
        throw new Error('Invalid username or password');
      }

      // Store doctor info in session storage for simplicity
      sessionStorage.setItem('doctor', JSON.stringify(data));
      router.push('/doctor');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative"
      >
          <Link 
            href="/"
            className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <div className="p-2 rounded-full bg-slate-900/50 border border-slate-800 group-hover:border-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Go Back</span>
          </Link>

        <div className="text-center space-y-4 mb-8">
          <div className="inline-block p-3 rounded-2xl bg-blue-600 shadow-lg mb-2">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-slate-400">
            DOCTOR ACCESS
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            SECURE PROFESSIONAL PORTAL
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="doctor_smith"
                className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 transition-all"
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
                className="h-14 bg-slate-950/50 border-slate-800 rounded-2xl focus:ring-blue-500/30 transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">
              {error}
            </p>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'AUTHENTICATE'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
