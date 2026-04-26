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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      complaints: {
        Row: {
          assigned_to: string | null
          complainant_id: string
          created_at: string
          description: string | null
          id: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          status: string
          subject: string
          target_id: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          complainant_id: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject: string
          target_id?: string | null
          target_type: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          complainant_id?: string
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string
          subject?: string
          target_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      flyers: {
        Row: {
          badge: string | null
          created_at: string
          created_by: string | null
          cta_link: string
          cta_text: string
          description: string | null
          discount: string | null
          end_date: string | null
          gradient: string
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          subtitle: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          created_by?: string | null
          cta_link?: string
          cta_text?: string
          description?: string | null
          discount?: string | null
          end_date?: string | null
          gradient?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          subtitle: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          created_by?: string | null
          cta_link?: string
          cta_text?: string
          description?: string | null
          discount?: string | null
          end_date?: string | null
          gradient?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          subtitle?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      mobile_wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_sync_at: string | null
          operator: string
          pending_balance: number
          total_received: number
          total_withdrawn: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          last_sync_at?: string | null
          operator: string
          pending_balance?: number
          total_received?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_sync_at?: string | null
          operator?: string
          pending_balance?: number
          total_received?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          related_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          adresse_livraison: Json
          created_at: string
          id: string
          items: Json
          mode_paiement: string
          mode_paiement_numero: string | null
          reference_paiement: string | null
          statut: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          adresse_livraison?: Json
          created_at?: string
          id?: string
          items?: Json
          mode_paiement: string
          mode_paiement_numero?: string | null
          reference_paiement?: string | null
          statut?: string
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          adresse_livraison?: Json
          created_at?: string
          id?: string
          items?: Json
          mode_paiement?: string
          mode_paiement_numero?: string | null
          reference_paiement?: string | null
          statut?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          arrondissements: string[] | null
          base_commission_rate: number | null
          created_at: string | null
          current_commission_rate: number | null
          departments: string[] | null
          forfait_amount: number | null
          forfait_end_date: string | null
          forfait_notes: string | null
          forfait_start_date: string | null
          id: string
          intercommunautaire: boolean | null
          partnership_type: Database["public"]["Enums"]["partnership_type"]
          region: string | null
          shops_recruited: number | null
          status: Database["public"]["Enums"]["entity_status"] | null
          total_commission_earned: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arrondissements?: string[] | null
          base_commission_rate?: number | null
          created_at?: string | null
          current_commission_rate?: number | null
          departments?: string[] | null
          forfait_amount?: number | null
          forfait_end_date?: string | null
          forfait_notes?: string | null
          forfait_start_date?: string | null
          id?: string
          intercommunautaire?: boolean | null
          partnership_type: Database["public"]["Enums"]["partnership_type"]
          region?: string | null
          shops_recruited?: number | null
          status?: Database["public"]["Enums"]["entity_status"] | null
          total_commission_earned?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arrondissements?: string[] | null
          base_commission_rate?: number | null
          created_at?: string | null
          current_commission_rate?: number | null
          departments?: string[] | null
          forfait_amount?: number | null
          forfait_end_date?: string | null
          forfait_notes?: string | null
          forfait_start_date?: string | null
          id?: string
          intercommunautaire?: boolean | null
          partnership_type?: Database["public"]["Enums"]["partnership_type"]
          region?: string | null
          shops_recruited?: number | null
          status?: Database["public"]["Enums"]["entity_status"] | null
          total_commission_earned?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_promo: boolean | null
          name: string
          price: number
          promo_price: number | null
          shop_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_promo?: boolean | null
          name: string
          price: number
          promo_price?: number | null
          shop_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_promo?: boolean | null
          name?: string
          price?: number
          promo_price?: number | null
          shop_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          name: string
          price: number
          shop_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          name: string
          price: number
          shop_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          name?: string
          price?: number
          shop_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          created_at: string
          customer_rating: number | null
          damage_notes: string | null
          delivered_at: string | null
          delivery_cost: number
          delivery_fee: number
          destination_city: string
          id: string
          is_damaged: boolean
          is_returned: boolean
          origin_city: string
          picked_at: string | null
          shop_id: string | null
          status: string
          tracking_number: string
          type: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          customer_rating?: number | null
          damage_notes?: string | null
          delivered_at?: string | null
          delivery_cost?: number
          delivery_fee?: number
          destination_city: string
          id?: string
          is_damaged?: boolean
          is_returned?: boolean
          origin_city: string
          picked_at?: string | null
          shop_id?: string | null
          status?: string
          tracking_number: string
          type?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          customer_rating?: number | null
          damage_notes?: string | null
          delivered_at?: string | null
          delivery_cost?: number
          delivery_fee?: number
          destination_city?: string
          id?: string
          is_damaged?: boolean
          is_returned?: boolean
          origin_city?: string
          picked_at?: string | null
          shop_id?: string | null
          status?: string
          tracking_number?: string
          type?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_orders: {
        Row: {
          created_at: string
          id: string
          items: Json
          order_id: string | null
          shop_id: string | null
          shop_name: string
          statut: string
          subtotal: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          items?: Json
          order_id?: string | null
          shop_id?: string | null
          shop_name: string
          statut?: string
          subtotal?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          items?: Json
          order_id?: string | null
          shop_id?: string | null
          shop_name?: string
          statut?: string
          subtotal?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_orders_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_payouts: {
        Row: {
          created_at: string
          dispatched_at: string | null
          id: string
          mode_paiement: string | null
          montant: number
          notes: string | null
          reference_transaction: string | null
          shop_id: string | null
          shop_order_id: string | null
          statut: string
        }
        Insert: {
          created_at?: string
          dispatched_at?: string | null
          id?: string
          mode_paiement?: string | null
          montant?: number
          notes?: string | null
          reference_transaction?: string | null
          shop_id?: string | null
          shop_order_id?: string | null
          statut?: string
        }
        Update: {
          created_at?: string
          dispatched_at?: string | null
          id?: string
          mode_paiement?: string | null
          montant?: number
          notes?: string | null
          reference_transaction?: string | null
          shop_id?: string | null
          shop_order_id?: string | null
          statut?: string
        }
        Relationships: [
          {
            foreignKeyName: "shop_payouts_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shop_payouts_shop_order_id_fkey"
            columns: ["shop_order_id"]
            isOneToOne: false
            referencedRelation: "shop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          affiliate_code: string | null
          category: string | null
          city: string | null
          contact_address: string | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          created_at: string | null
          description: string | null
          has_seo: boolean | null
          has_social: boolean | null
          has_whatsapp: boolean | null
          id: string
          is_vip: boolean | null
          logo_url: string | null
          name: string
          partner_id: string | null
          region: string | null
          slug: string
          social_facebook: string | null
          social_instagram: string | null
          social_tiktok: string | null
          social_youtube: string | null
          status: Database["public"]["Enums"]["entity_status"] | null
          subscription_amount: number | null
          subscription_expires_at: string | null
          subscription_type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affiliate_code?: string | null
          category?: string | null
          city?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description?: string | null
          has_seo?: boolean | null
          has_social?: boolean | null
          has_whatsapp?: boolean | null
          id?: string
          is_vip?: boolean | null
          logo_url?: string | null
          name: string
          partner_id?: string | null
          region?: string | null
          slug: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          status?: Database["public"]["Enums"]["entity_status"] | null
          subscription_amount?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affiliate_code?: string | null
          category?: string | null
          city?: string | null
          contact_address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          created_at?: string | null
          description?: string | null
          has_seo?: boolean | null
          has_social?: boolean | null
          has_whatsapp?: boolean | null
          id?: string
          is_vip?: boolean | null
          logo_url?: string | null
          name?: string
          partner_id?: string | null
          region?: string | null
          slug?: string
          social_facebook?: string | null
          social_instagram?: string | null
          social_tiktok?: string | null
          social_youtube?: string | null
          status?: Database["public"]["Enums"]["entity_status"] | null
          subscription_amount?: number | null
          subscription_expires_at?: string | null
          subscription_type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          description: string | null
          fee: number
          id: string
          metadata: Json | null
          phone_number: string | null
          reference: string | null
          related_id: string | null
          related_type: string | null
          status: string
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          reference?: string | null
          related_id?: string | null
          related_type?: string | null
          status?: string
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          fee?: number
          id?: string
          metadata?: Json | null
          phone_number?: string | null
          reference?: string | null
          related_id?: string | null
          related_type?: string | null
          status?: string
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "mobile_wallets"
            referencedColumns: ["id"]
          },
        ]
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
      app_role: "super_admin" | "partner" | "shop_owner"
      entity_status:
        | "pending"
        | "approved"
        | "active"
        | "suspended"
        | "rejected"
      partnership_type: "commission" | "forfait"
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
      app_role: ["super_admin", "partner", "shop_owner"],
      entity_status: ["pending", "approved", "active", "suspended", "rejected"],
      partnership_type: ["commission", "forfait"],
    },
  },
} as const
