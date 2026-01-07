export interface Patient {
  id: string;
  tokenNumber: string;
  token_number: number; // Supabase uses integer
  name: string;
  phone: string;
  department: string;
  doctor_id?: string; // Specific doctor chosen by patient
  status: 'waiting' | 'calling' | 'completed' | 'in-consultation';
  type: 'online' | 'offline';
  reservation_time?: string; // e.g., "10:30 AM"
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  counters: number;
  currentToken: number;
  averageWaitTime: number; // in minutes
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  username: string;
  created_at: string;
}

export interface QueueState {
  departments: Department[];
  patients: Patient[];
}

export type UserRole = 'patient' | 'admin' | 'doctor';

