'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, Shield, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import AdminDashboard from '@/components/AdminDashboard';
import DoctorManagement from '@/components/DoctorManagement';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'doctors'>('queue');
  const router = useRouter();

    useEffect(() => {
      const checkAdmin = () => {
        const admin = sessionStorage.getItem('admin');
        if (!admin) {
          router.push('/admin/login');
        } else {
          setIsAdmin(true);
        }
        setLoading(false);
      };
      
      checkAdmin();
    }, []); // Empty dependency array to prevent re-triggers


  const handleLogout = () => {
    sessionStorage.removeItem('admin');
    router.push('/admin/login');
  };

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Portal
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Terminate Session
          </Button>
        </div>

        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-400 to-slate-400">
              ADMIN CONSOLE
            </h1>
            <div className="flex items-center justify-center gap-6">
               <button 
                onClick={() => setActiveTab('queue')}
                className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-300 ${
                  activeTab === 'queue' 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20 scale-105' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Queue Logistics</span>
              </button>
              <button 
                onClick={() => setActiveTab('doctors')}
                className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all duration-300 ${
                  activeTab === 'doctors' 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20 scale-105' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <Users className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Doctor Registry</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-[2.5rem] blur-3xl opacity-50" />
            <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'queue' ? <AdminDashboard /> : <DoctorManagement />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
