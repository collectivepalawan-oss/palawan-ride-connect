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
      bookings: {
        Row: {
          created_at: string
          date: string
          dropoff_location: string
          final_price: number | null
          id: string
          operator_id: string | null
          passengers: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          pickup_location: string
          price_estimate: number | null
          route_category: Database["public"]["Enums"]["route_category"]
          status: Database["public"]["Enums"]["booking_status"]
          time: string
          transport_type: Database["public"]["Enums"]["transport_type"]
          traveler_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          dropoff_location: string
          final_price?: number | null
          id?: string
          operator_id?: string | null
          passengers?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          pickup_location: string
          price_estimate?: number | null
          route_category: Database["public"]["Enums"]["route_category"]
          status?: Database["public"]["Enums"]["booking_status"]
          time: string
          transport_type: Database["public"]["Enums"]["transport_type"]
          traveler_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          dropoff_location?: string
          final_price?: number | null
          id?: string
          operator_id?: string | null
          passengers?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          pickup_location?: string
          price_estimate?: number | null
          route_category?: Database["public"]["Enums"]["route_category"]
          status?: Database["public"]["Enums"]["booking_status"]
          time?: string
          transport_type?: Database["public"]["Enums"]["transport_type"]
          traveler_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          availability: boolean
          base_price: number
          boat_type: Database["public"]["Enums"]["boat_type"] | null
          capacity: number
          created_at: string
          current_lat: number | null
          current_lng: number | null
          id: string
          last_update_timestamp: string | null
          operating_area: Database["public"]["Enums"]["operating_area"]
          operator_name: string
          transport_type: Database["public"]["Enums"]["transport_type"]
          updated_at: string
          user_id: string
          van_type: Database["public"]["Enums"]["van_type"] | null
        }
        Insert: {
          availability?: boolean
          base_price: number
          boat_type?: Database["public"]["Enums"]["boat_type"] | null
          capacity: number
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          last_update_timestamp?: string | null
          operating_area: Database["public"]["Enums"]["operating_area"]
          operator_name: string
          transport_type: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
          user_id: string
          van_type?: Database["public"]["Enums"]["van_type"] | null
        }
        Update: {
          availability?: boolean
          base_price?: number
          boat_type?: Database["public"]["Enums"]["boat_type"] | null
          capacity?: number
          created_at?: string
          current_lat?: number | null
          current_lng?: number | null
          id?: string
          last_update_timestamp?: string | null
          operating_area?: Database["public"]["Enums"]["operating_area"]
          operator_name?: string
          transport_type?: Database["public"]["Enums"]["transport_type"]
          updated_at?: string
          user_id?: string
          van_type?: Database["public"]["Enums"]["van_type"] | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          category: Database["public"]["Enums"]["route_category"]
          created_at: string
          default_duration: number
          default_price: number
          end_location: string
          id: string
          start_location: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["route_category"]
          created_at?: string
          default_duration: number
          default_price: number
          end_location: string
          id?: string
          start_location: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["route_category"]
          created_at?: string
          default_duration?: number
          default_price?: number
          end_location?: string
          id?: string
          start_location?: string
          updated_at?: string
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
    }
    Enums: {
      app_role: "traveler" | "operator" | "admin"
      boat_type: "6pax" | "10pax" | "12pax" | "speedboat"
      booking_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "enroute"
        | "arrived"
        | "in_progress"
        | "completed"
        | "cancelled"
      operating_area:
        | "puerto_princesa"
        | "port_barton"
        | "san_vicente"
        | "lumambong_beach"
        | "el_nido"
      payment_method: "cash" | "gcash"
      route_category: "land" | "sea"
      transport_type:
        | "shared_van"
        | "private_van"
        | "boat"
        | "speedboat"
        | "4x4"
      van_type: "shared" | "private"
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
      app_role: ["traveler", "operator", "admin"],
      boat_type: ["6pax", "10pax", "12pax", "speedboat"],
      booking_status: [
        "pending",
        "accepted",
        "rejected",
        "enroute",
        "arrived",
        "in_progress",
        "completed",
        "cancelled",
      ],
      operating_area: [
        "puerto_princesa",
        "port_barton",
        "san_vicente",
        "lumambong_beach",
        "el_nido",
      ],
      payment_method: ["cash", "gcash"],
      route_category: ["land", "sea"],
      transport_type: ["shared_van", "private_van", "boat", "speedboat", "4x4"],
      van_type: ["shared", "private"],
    },
  },
} as const
