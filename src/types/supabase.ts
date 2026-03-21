/**
 * Supabase Database type definitions.
 * Generated from the SQL schema in /supabase/schema.sql
 */

export interface Database {
  public: {
    Tables: {
      vaults: {
        Row: {
          id: string;
          user_id: string;
          encrypted_blob: string;
          iv: string;
          salt: string;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          encrypted_blob: string;
          iv: string;
          salt: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          encrypted_blob?: string;
          iv?: string;
          salt?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
