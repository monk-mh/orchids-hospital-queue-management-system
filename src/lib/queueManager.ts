import { QueueState, Patient, Department } from '@/types/queue';

const STORAGE_KEY = 'hospital_queue_state';

// Default departments
const DEFAULT_DEPARTMENTS: Department[] = [
  { id: '1', name: 'General Medicine', counters: 3, currentToken: 0, averageWaitTime: 15 },
  { id: '2', name: 'Cardiology', counters: 2, currentToken: 0, averageWaitTime: 20 },
  { id: '3', name: 'Orthopedics', counters: 2, currentToken: 0, averageWaitTime: 18 },
  { id: '4', name: 'Pediatrics', counters: 2, currentToken: 0, averageWaitTime: 12 },
  { id: '5', name: 'Laboratory', counters: 4, currentToken: 0, averageWaitTime: 10 },
];

export const getQueueState = (): QueueState => {
  if (typeof window === 'undefined') {
    return { departments: DEFAULT_DEPARTMENTS, patients: [] };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const parsed = JSON.parse(stored);
    // Convert date strings back to Date objects
    parsed.patients = parsed.patients.map((p: Patient) => ({
      ...p,
      joinedAt: new Date(p.joinedAt),
      calledAt: p.calledAt ? new Date(p.calledAt) : undefined,
      completedAt: p.completedAt ? new Date(p.completedAt) : undefined,
    }));
    return parsed;
  }

  return { departments: DEFAULT_DEPARTMENTS, patients: [] };
};

export const saveQueueState = (state: QueueState): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

export const generateToken = (departmentId: string): string => {
  const state = getQueueState();
  const dept = state.departments.find(d => d.id === departmentId);
  
  if (!dept) return 'A001';
  
  const deptPrefix = dept.name.substring(0, 1).toUpperCase();
  const nextNumber = dept.currentToken + 1;
  dept.currentToken = nextNumber;
  
  saveQueueState(state);
  
  return `${deptPrefix}${nextNumber.toString().padStart(3, '0')}`;
};

export const addPatient = (patient: Omit<Patient, 'id' | 'tokenNumber' | 'joinedAt' | 'status'>): Patient => {
  const state = getQueueState();
  const tokenNumber = generateToken(patient.department);
  
  const newPatient: Patient = {
    ...patient,
    id: Date.now().toString(),
    tokenNumber,
    status: 'waiting',
    joinedAt: new Date(),
    type: patient.type || 'online',
  };
  
  state.patients.push(newPatient);
  saveQueueState(state);
  
  return newPatient;
};

export const getPatientPosition = (patientId: string): number => {
  const state = getQueueState();
  const patient = state.patients.find(p => p.id === patientId);
  
  if (!patient) return 0;
  
  const waitingInDept = state.patients.filter(
    p => p.department === patient.department && 
    p.status === 'waiting' &&
    p.joinedAt < patient.joinedAt
  );
  
  return waitingInDept.length + 1;
};

export const getEstimatedWaitTime = (patientId: string): number => {
  const state = getQueueState();
  const patient = state.patients.find(p => p.id === patientId);
  
  if (!patient) return 0;
  
  const dept = state.departments.find(d => d.id === patient.department);
  if (!dept) return 0;
  
  const position = getPatientPosition(patientId);
  const waitTime = Math.ceil((position * dept.averageWaitTime) / dept.counters);
  
  return waitTime;
};

export const callNextPatient = (departmentId: string, doctorId?: string): Patient | null => {
  const state = getQueueState();
  
  // Filter patients by department and waiting status
  let potentialPatients = state.patients.filter(
    p => p.department === departmentId && p.status === 'waiting'
  );

  // If a specific doctor is calling, prioritize patients who chose this doctor
  // otherwise, take the next patient in line (FCFS)
  if (doctorId) {
    const doctorSpecific = potentialPatients.filter(p => p.doctorId === doctorId);
    if (doctorSpecific.length > 0) {
      potentialPatients = doctorSpecific;
    }
  }

  // Sort by reservation time if exists, then by joinedAt (FCFS)
  const nextPatient = potentialPatients.sort((a, b) => {
    if (a.reservation_time && b.reservation_time) {
      return a.reservation_time.localeCompare(b.reservation_time);
    }
    if (a.reservation_time) return -1;
    if (b.reservation_time) return 1;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  })[0];
  
  if (nextPatient) {
    nextPatient.status = 'calling';
    // Record which doctor is seeing the patient
    if (doctorId) nextPatient.doctor_id = doctorId;
    saveQueueState(state);
  }

  
  return nextPatient || null;
};

export const completeConsultation = (patientId: string): void => {
  const state = getQueueState();
  const patient = state.patients.find(p => p.id === patientId);
  
  if (patient) {
    patient.status = 'completed';
    patient.completedAt = new Date();
    saveQueueState(state);
  }
};

export const getDepartmentStats = (departmentId: string) => {
  const state = getQueueState();
  const deptPatients = state.patients.filter(p => p.department === departmentId);
  
  return {
    waiting: deptPatients.filter(p => p.status === 'waiting').length,
    inConsultation: deptPatients.filter(p => p.status === 'in-consultation').length,
    completed: deptPatients.filter(p => p.status === 'completed').length,
    total: deptPatients.length,
  };
};