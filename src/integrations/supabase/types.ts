export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      participant_accounts: {
        Row: {
          created_at: string
          participant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          participant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          participant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_goals: {
        Row: {
          created_at: string
          id: string
          period: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          period: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          period?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_interests: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_messages: {
        Row: {
          coordinator_name: string
          id: string
          participant_id: string
          reply: string | null
          sent_at: string
          suggestion_id: string | null
          text: string
        }
        Insert: {
          coordinator_name: string
          id?: string
          participant_id: string
          reply?: string | null
          sent_at?: string
          suggestion_id?: string | null
          text: string
        }
        Update: {
          coordinator_name?: string
          id?: string
          participant_id?: string
          reply?: string | null
          sent_at?: string
          suggestion_id?: string | null
          text?: string
        }
        Relationships: []
      }
      participant_onboarding: {
        Row: {
          answers: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_onboarding_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      participant_summaries: {
        Row: {
          created_at: string
          id: string
          participant_id: string
          source: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_id: string
          source?: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_id?: string
          source?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "participant_summaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_logs: {
        Row: {
          created_at: string
          id: string
          minutes: number | null
          practiced_on: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          minutes?: number | null
          practiced_on?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          minutes?: number | null
          practiced_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      program_prerequisites: {
        Row: {
          min_count: number
          notes: string | null
          program_id: string
          requires_program_id: string
        }
        Insert: {
          min_count?: number
          notes?: string | null
          program_id: string
          requires_program_id: string
        }
        Update: {
          min_count?: number
          notes?: string | null
          program_id?: string
          requires_program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_prerequisites_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_prerequisites_requires_program_id_fkey"
            columns: ["requires_program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          ages: string
          format: string
          home_practice: string
          id: string
          journey_milestone: string
          level: string
          main_practices: string
          min_age: number
          name: string
          needs_local_check: boolean
          online_option: string
          prerequisite_text: string
          source_url: string | null
          suggested_timing: string
          unlocks_next_text: string
          varies_by_country: string
          where_offered_na: string
        }
        Insert: {
          ages: string
          format: string
          home_practice: string
          id?: string
          journey_milestone: string
          level: string
          main_practices: string
          min_age: number
          name: string
          needs_local_check?: boolean
          online_option: string
          prerequisite_text: string
          source_url?: string | null
          suggested_timing: string
          unlocks_next_text: string
          varies_by_country: string
          where_offered_na: string
        }
        Update: {
          ages?: string
          format?: string
          home_practice?: string
          id?: string
          journey_milestone?: string
          level?: string
          main_practices?: string
          min_age?: number
          name?: string
          needs_local_check?: boolean
          online_option?: string
          prerequisite_text?: string
          source_url?: string | null
          suggested_timing?: string
          unlocks_next_text?: string
          varies_by_country?: string
          where_offered_na?: string
        }
        Relationships: []
      }
      sahayak_audit: {
        Row: {
          created_at: string
          id: string
          key_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          tool: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          tool: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          tool?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sahayak_audit_key_id_fkey"
            columns: ["key_id"]
            isOneToOne: false
            referencedRelation: "sahayak_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sahayak_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sahayak_keys: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          revoked_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          scope: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          revoked_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          scope: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          revoked_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          scope?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "participant" | "coordinator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["participant", "coordinator"],
    },
  },
} as const
