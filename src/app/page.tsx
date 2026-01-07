'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, Shield, Monitor } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 blur-[180px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-20">
          <div className="inline-block">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
              <Activity className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-blue-400 to-slate-400 uppercase">
            TechSparks
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium tracking-tight">
            Next-generation hospital intelligence. Real-time queue tracking, 
            automated tokenization, and seamless patient flow management.
          </p>
        </div>

        {/* Role Selection */}
        <div className="max-w-6xl mx-auto mb-24">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Patient Portal',
                role: 'PATIENT',
                icon: Users,
                desc: 'Register and track your position in real-time',
                href: '/patient',
                color: 'from-blue-500 to-blue-600',
                features: ['Instant Token Generation', 'Estimated Wait Time', 'Live Status Tracking', 'Multi-Dept Support']
              },
              {
                  title: 'Reception Desk',
                  role: 'STAFF',
                  icon: Monitor,
                  desc: 'Manage offline bookings and walk-in patients',
                  href: '/reception',
                  color: 'from-amber-500 to-orange-700',
                  features: ['Offline Token Generation', 'Doctor Assignment', 'Walk-in Registration', 'Queue Oversight']
                },
              {
                  title: 'Admin Console',
                  role: 'ADMIN',
                  icon: Shield,
                  desc: 'Manage doctors and monitor system performance',
                  href: '/admin/login',
                  color: 'from-slate-600 to-slate-800',
                  features: ['Register New Doctors', 'Personnel Management', 'Database Access', 'System Oversight']
                },
              {
                title: 'Doctor Portal',
                role: 'DOCTOR',
                icon: Activity,
                desc: 'Access patient queue and manage checkups',
                href: '/doctor/login',
                color: 'from-emerald-500 to-emerald-700',
                features: ['Secure Professional Login', 'Call Next Patient', 'Patient Medical Info', 'Checkup Management']
              },
              {
                title: 'Live Display',
                role: 'MONITOR',
                icon: Monitor,
                desc: 'Public display board for waiting areas',
                href: '/queue-tracking',
                color: 'from-indigo-500 to-blue-700',
                features: ['Real-time Status Board', 'Next Patient Preview', 'Auto-Syncing Data', 'Ultra-HD Interface']
              }
            ].map((card, i) => (
              <div key={i} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${card.color} rounded-[2rem] blur opacity-10 group-hover:opacity-40 transition duration-500`} />
                <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-8 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg`}>
                      <card.icon className="h-8 w-8 text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 tracking-[0.2em]">{card.role}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{card.title}</h3>
                  <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">{card.desc}</p>
                  
                  <div className="space-y-3 mb-10 flex-grow">
                    {card.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-3 text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors">
                        <div className="h-1 w-1 rounded-full bg-blue-500" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <Link href={card.href} className="mt-auto">
                    <Button className="w-full bg-white hover:bg-blue-500 text-black hover:text-white font-black uppercase tracking-widest text-[10px] py-6 rounded-2xl transition-all duration-300 shadow-xl">
                      Access Portal
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision Statement */}
        <div className="max-w-4xl mx-auto">
          <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity className="h-64 w-64" />
            </div>
            <div className="relative bg-[#020617]/80 backdrop-blur-xl rounded-[2.4rem] p-10 border border-slate-800/50">
              <h2 className="text-3xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-slate-400">Transforming Healthcare Logistics</h2>
              <p className="text-slate-400 leading-relaxed font-medium mb-8">
                In a nation of a billion, efficiency isn't just a metric—it's a necessity. 
                TechSparks eliminates the friction of traditional waiting systems, 
                giving patients back their time and hospitals back their focus.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-red-900/20">
                  <h4 className="text-xs font-black text-red-500 tracking-[0.2em] uppercase mb-4">The Friction</h4>
                  <ul className="space-y-2 text-xs font-bold text-slate-500">
                    <li>• UNPREDICTABLE WAIT TIMES</li>
                    <li>• MANUAL QUEUE CHAOS</li>
                    <li>• OVERCROWDED FACILITIES</li>
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-emerald-900/20">
                  <h4 className="text-xs font-black text-emerald-500 tracking-[0.2em] uppercase mb-4">The Impact</h4>
                  <ul className="space-y-2 text-xs font-bold text-slate-500">
                    <li>• DATA-DRIVEN OPERATIONS</li>
                    <li>• SEAMLESS PATIENT JOURNEY</li>
                    <li>• OPTIMIZED DOCTOR FLOW</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}