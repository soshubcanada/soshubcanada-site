"use client";
import { createContext, useContext } from 'react';
import type { CrmUser, CrmRole, Client, Case, Appointment } from './crm-types';
import { ROLE_PERMISSIONS } from './crm-types';
import type { ServiceContract } from './crm-pricing-2026';

// ========================================================
// Utilisateurs démo pour chaque rôle
// ========================================================
export const DEMO_USERS: CrmUser[] = [
  { id: 'u1', name: 'P. Cadet', email: 'pcadet@soshubcanada.com', role: 'superadmin', active: true },
  { id: 'u2', name: 'A. Kabeche', email: 'akabeche@soshubcanada.com', role: 'coordinatrice', active: true },
  { id: 'u3', name: 'S. Guerrier', email: 'sguerrier@soshubcanada.com', role: 'coordinatrice', active: true },
  { id: 'u4', name: 'Direction', email: 'direction@soshubcanada.com', role: 'coordinatrice', active: true },
  { id: 'u5', name: 'N. Saadou', email: 'nsaadou@soshubcanada.com', role: 'technicienne_juridique', active: true },
  { id: 'u6', name: 'S. Loulidi', email: 'sloulidi@soshubcanada.com', role: 'technicienne_juridique', active: true },
  { id: 'u7', name: 'F. Madjer', email: 'fmadjer@soshubcanada.com', role: 'receptionniste', active: true },
];

// ========================================================
// Clients démo
// ========================================================
// Clients démo vidés — seuls les vrais clients (test admissibilité / Supabase) sont affichés
export const DEMO_CLIENTS: Client[] = [];

// ========================================================
// Dossiers démo
// ========================================================
// Dossiers démo vidés — seuls les vrais dossiers (Supabase) sont affichés
export const DEMO_CASES: Case[] = [];

// ========================================================
// Rendez-vous démo
// ========================================================
// RDV démo vidés — seuls les vrais rendez-vous (Supabase) sont affichés
export const DEMO_APPOINTMENTS: Appointment[] = [];

// ========================================================
// Context React
// ========================================================
export interface CrmState {
  currentUser: CrmUser | null;
  clients: Client[];
  cases: Case[];
  appointments: Appointment[];
  contracts: ServiceContract[];
  setCurrentUser: (user: CrmUser | null) => void;
  setClients: (clients: Client[]) => void;
  setCases: (cases: Case[]) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setContracts: (contracts: ServiceContract[]) => void;
  /** Force refresh all data from Supabase (Realtime + polling) */
  refreshData: () => Promise<void>;
}

export const CrmContext = createContext<CrmState>({
  currentUser: null,
  clients: [],
  cases: [],
  appointments: [],
  contracts: [],
  setCurrentUser: () => {},
  setClients: () => {},
  setCases: () => {},
  setAppointments: () => {},
  setContracts: () => {},
  refreshData: async () => {},
});

export function useCrm() {
  return useContext(CrmContext);
}

export function hasPermission(role: CrmRole, permission: keyof typeof ROLE_PERMISSIONS['receptionniste']): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

export function getUserName(userId: string): string {
  return DEMO_USERS.find(u => u.id === userId)?.name ?? 'Inconnu';
}
