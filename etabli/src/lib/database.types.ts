// ========================================================
// SOS Hub Canada - Types Supabase (générés manuellement)
// En production: npx supabase gen types typescript > database.types.ts
// ========================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          email: string;
          name: string;
          role: 'receptionniste' | 'conseiller' | 'technicienne_juridique' | 'avocat_consultant' | 'coordinatrice';
          avatar_url: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          date_of_birth: string;
          nationality: string;
          current_country: string;
          current_status: string;
          passport_number: string;
          passport_expiry: string;
          address: string;
          city: string;
          province: string;
          postal_code: string;
          status: 'prospect' | 'actif' | 'en_attente' | 'complete' | 'archive';
          assigned_to: string;
          notes: string;
          language_english: string;
          language_french: string;
          education: string;
          work_experience: string;
          marital_status: string;
          dependants: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      family_members: {
        Row: {
          id: string;
          client_id: string;
          relationship: string;
          first_name: string;
          last_name: string;
          date_of_birth: string;
          nationality: string;
          passport_number: string;
          accompany: boolean;
        };
        Insert: Omit<Database['public']['Tables']['family_members']['Row'], 'id'> & { id?: string };
        Update: Partial<Database['public']['Tables']['family_members']['Insert']>;
      };
      client_documents: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          type: string;
          file_path: string;
          uploaded_at: string;
        };
        Insert: Omit<Database['public']['Tables']['client_documents']['Row'], 'id' | 'uploaded_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['client_documents']['Insert']>;
      };
      cases: {
        Row: {
          id: string;
          client_id: string;
          program_id: string;
          title: string;
          status: 'nouveau' | 'consultation' | 'en_preparation' | 'formulaires_remplis' | 'revision' | 'soumis' | 'en_traitement_ircc' | 'approuve' | 'refuse' | 'appel' | 'ferme';
          assigned_to: string;
          assigned_lawyer: string;
          priority: 'basse' | 'normale' | 'haute' | 'urgente';
          deadline: string | null;
          ircc_app_number: string;
          uci_number: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cases']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['cases']['Insert']>;
      };
      case_forms: {
        Row: {
          id: string;
          case_id: string;
          form_id: string;
          status: 'vide' | 'en_cours' | 'rempli' | 'revise' | 'approuve' | 'signe';
          filled_by: string;
          reviewed_by: string;
          approved_by: string;
          data: Json;
          last_updated: string;
        };
        Insert: Omit<Database['public']['Tables']['case_forms']['Row'], 'id' | 'last_updated'> & { id?: string };
        Update: Partial<Database['public']['Tables']['case_forms']['Insert']>;
      };
      timeline_events: {
        Row: {
          id: string;
          case_id: string;
          date: string;
          type: 'note' | 'status_change' | 'form_update' | 'document' | 'appointment' | 'email' | 'ircc_update';
          description: string;
          user_id: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['timeline_events']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['timeline_events']['Insert']>;
      };
      contracts: {
        Row: {
          id: string;
          case_id: string;
          client_id: string;
          program_id: string;
          tier_id: string;
          status: 'brouillon' | 'envoye' | 'signe' | 'actif' | 'termine' | 'annule';
          service_fee: number;
          government_fee: number;
          government_fee_payeur: 'client' | 'employeur';
          frais_ouverture: number;
          tps: number;
          tvq: number;
          grand_total: number;
          installments: Json;
          payment_plan: string;
          created_by: string;
          signed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['contracts']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>;
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          case_id: string | null;
          user_id: string;
          title: string;
          date: string;
          time: string;
          duration: number;
          type: 'consultation_initiale' | 'suivi' | 'revision_formulaires' | 'preparation_entrevue' | 'signature' | 'autre';
          status: 'planifie' | 'confirme' | 'en_cours' | 'complete' | 'annule' | 'no_show';
          notes: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['appointments']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['appointments']['Insert']>;
      };
      scoring_results: {
        Row: {
          id: string;
          case_id: string;
          client_id: string;
          scoring_type: 'crs' | 'mifi';
          score: number;
          threshold: number;
          breakdown: Json;
          advice: Json;
          profile_snapshot: Json;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['scoring_results']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['scoring_results']['Insert']>;
      };
      emails_sent: {
        Row: {
          id: string;
          client_id: string;
          case_id: string | null;
          to_email: string;
          subject: string;
          body: string;
          type: 'scoring_results' | 'contract' | 'appointment' | 'general' | 'analysis' | 'premium_report';
          sent_by: string;
          sent_at: string;
        };
        Insert: Omit<Database['public']['Tables']['emails_sent']['Row'], 'id' | 'sent_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['emails_sent']['Insert']>;
      };
    };
  };
}

// Types raccourcis
export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbClient = Database['public']['Tables']['clients']['Row'];
export type DbCase = Database['public']['Tables']['cases']['Row'];
export type DbContract = Database['public']['Tables']['contracts']['Row'];
export type DbAppointment = Database['public']['Tables']['appointments']['Row'];
export type DbTimelineEvent = Database['public']['Tables']['timeline_events']['Row'];
export type DbCaseForm = Database['public']['Tables']['case_forms']['Row'];
export type DbScoringResult = Database['public']['Tables']['scoring_results']['Row'];
export type DbEmailSent = Database['public']['Tables']['emails_sent']['Row'];
export type DbFamilyMember = Database['public']['Tables']['family_members']['Row'];
export type DbClientDocument = Database['public']['Tables']['client_documents']['Row'];
