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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_clients: {
        Row: {
          address: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
        }
        Relationships: []
      }
      admin_company_settings: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          country: string
          created_at: string
          default_vat_rate: number
          iban_qr: string
          id: string
          invoice_footer: string | null
          logo_url: string | null
          payment_terms_days: number
          postal_code: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          default_vat_rate?: number
          iban_qr?: string
          id?: string
          invoice_footer?: string | null
          logo_url?: string | null
          payment_terms_days?: number
          postal_code?: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string
          created_at?: string
          default_vat_rate?: number
          iban_qr?: string
          id?: string
          invoice_footer?: string | null
          logo_url?: string | null
          payment_terms_days?: number
          postal_code?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      admin_invoice_lines: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number | null
          position: number
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total?: number | null
          position?: number
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number | null
          position?: number
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_invoice_lines_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "admin_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_invoices: {
        Row: {
          client_id: string
          created_at: string
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          total: number
          updated_at: string
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          client_id: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "admin_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_orders: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          domain: Database["public"]["Enums"]["order_domain"]
          id: string
          order_date: string
          quantity: number
          total: number | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          domain: Database["public"]["Enums"]["order_domain"]
          id?: string
          order_date?: string
          quantity: number
          total?: number | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          domain?: Database["public"]["Enums"]["order_domain"]
          id?: string
          order_date?: string
          quantity?: number
          total?: number | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "admin_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_otp_sessions: {
        Row: {
          expires_at: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
          verified_at: string
        }
        Insert: {
          expires_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
          verified_at?: string
        }
        Update: {
          expires_at?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
          verified_at?: string
        }
        Relationships: []
      }
      admin_products: {
        Row: {
          avg_cpl: number
          created_at: string
          domain: Database["public"]["Enums"]["order_domain"]
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          avg_cpl?: number
          created_at?: string
          domain: Database["public"]["Enums"]["order_domain"]
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          avg_cpl?: number
          created_at?: string
          domain?: Database["public"]["Enums"]["order_domain"]
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean
          phone_e164: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone_e164: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone_e164?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_premiums: {
        Row: {
          accident_code: string
          age_category: string
          canton: string
          created_at: string
          franchise_amount: number
          franchise_code: string
          id: number
          insurer_id: string
          insurer_name: string | null
          premium: number
          region: string | null
          tarif_id: string | null
          tarif_name: string | null
          tarif_type: string
          year: number
        }
        Insert: {
          accident_code: string
          age_category: string
          canton: string
          created_at?: string
          franchise_amount: number
          franchise_code: string
          id?: never
          insurer_id: string
          insurer_name?: string | null
          premium: number
          region?: string | null
          tarif_id?: string | null
          tarif_name?: string | null
          tarif_type: string
          year?: number
        }
        Update: {
          accident_code?: string
          age_category?: string
          canton?: string
          created_at?: string
          franchise_amount?: number
          franchise_code?: string
          id?: never
          insurer_id?: string
          insurer_name?: string | null
          premium?: number
          region?: string | null
          tarif_id?: string | null
          tarif_name?: string | null
          tarif_type?: string
          year?: number
        }
        Relationships: []
      }
      otp_verifications: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          expires_at: string
          id: string
          lead_id: string | null
          max_attempts: number | null
          phone_e164: string
          verified: boolean | null
          verified_at: string | null
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          lead_id?: string | null
          max_attempts?: number | null
          phone_e164: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          lead_id?: string | null
          max_attempts?: number | null
          phone_e164?: string
          verified?: boolean | null
          verified_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      is_verified_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin"
      client_status: "actif" | "inactif"
      invoice_status: "brouillon" | "envoyee" | "payee" | "en_attente"
      order_domain:
        | "assurance_maladie"
        | "lpp"
        | "hypotheque"
        | "telecom"
        | "energie"
        | "autre"
        | "assurance_non_vie"
        | "assurance_vie"
        | "immobilier"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin"],
      client_status: ["actif", "inactif"],
      invoice_status: ["brouillon", "envoyee", "payee", "en_attente"],
      order_domain: [
        "assurance_maladie",
        "lpp",
        "hypotheque",
        "telecom",
        "energie",
        "autre",
        "assurance_non_vie",
        "assurance_vie",
        "immobilier",
      ],
    },
  },
} as const
