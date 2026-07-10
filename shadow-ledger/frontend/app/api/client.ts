// app/api/client.ts
import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ────────────────────────────────────────────────────────────────

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Status   = 'OPEN' | 'INVESTIGATING' | 'MONITORING' | 'ESCALATED' | 'CLOSED';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Incident {
  id:          string;
  title:       string;
  category:    string;
  severity:    Severity;
  status:      Status;
  date:        string;
  time:        string;
  description: string | null;
  tags:        string[];
  userId:      string;
  createdAt:   string;
  updatedAt:   string;
}

export interface TimelineDay {
  date:      string;
  incidents: Incident[];
}

export interface IncidentPayload {
  title:       string;
  category:    string;
  severity:    string;
  status:      string;
  date:        string;
  time:        string;
  description?: string;
  tags?:       string[];
}

// ─── Auth Store (Zustand + localStorage) ─────────────────────────────────

interface AuthState {
  token: string | null;
  user:  User | null;
  setAuth:   (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:     null,
      user:      null,
      setAuth:   (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: 'shadow-ledger-auth' }
  )
);

// ─── Axios instance ───────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000',
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/login', { email, password }),

  register: (email: string, password: string) =>
    api.post<{ token: string; user: User }>('/auth/register', { email, password }),

  me: () =>
    api.get<User>('/auth/me'),
};

// ─── Incidents API ────────────────────────────────────────────────────────

export const incidentsApi = {
  list: (params?: { severity?: string; status?: string; category?: string; search?: string }) =>
    api.get<Incident[]>('/incidents', { params }),

  get: (id: string) =>
    api.get<Incident>(`/incidents/${id}`),

  create: (payload: IncidentPayload) =>
    api.post<Incident>('/incidents', payload),

  update: (id: string, payload: Partial<IncidentPayload>) =>
    api.patch<Incident>(`/incidents/${id}`, payload),

  delete: (id: string) =>
    api.delete(`/incidents/${id}`),
};

// ─── Timeline API ─────────────────────────────────────────────────────────

export const timelineApi = {
  get: (params?: { from?: string; to?: string }) =>
    api.get<TimelineDay[]>('/timeline', { params }),
};

export default api;
