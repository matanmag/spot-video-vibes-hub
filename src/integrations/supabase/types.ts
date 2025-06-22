export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      likes: {
        Row: {
          created_at: string
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          last_spot_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          last_spot_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          last_spot_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_last_spot_id_fkey"
            columns: ["last_spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
        ]
      }
      spots: {
        Row: {
          country: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          msw_id: number | null
          name: string
          type: string | null
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          msw_id?: number | null
          name: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          msw_id?: number | null
          name?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      video_views: {
        Row: {
          created_at: string
          id: string
          video_id: string
          viewer: string
        }
        Insert: {
          created_at?: string
          id?: string
          video_id: string
          viewer: string
        }
        Update: {
          created_at?: string
          id?: string
          video_id?: string
          viewer?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          duration: number | null
          id: string
          optimized_url: string | null
          spot_id: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          user_id: string
          video_url: string
          views: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          optimized_url?: string | null
          spot_id: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          user_id: string
          video_url: string
          views?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          duration?: number | null
          id?: string
          optimized_url?: string | null
          spot_id?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          video_url?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_spot_id_fkey"
            columns: ["spot_id"]
            isOneToOne: false
            referencedRelation: "spots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "videos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_video_completely: {
        Args: { video_id_param: string }
        Returns: Json
      }
      get_deletion_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_videos_for_deletion: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          video_url: string
          optimized_url: string
          thumbnail_url: string
          views: number
          created_at: string
          file_count: number
          estimated_size_mb: number
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_video_views: {
        Args: { video_id: string }
        Returns: undefined
      }
      search_spots: {
        Args: { q: string }
        Returns: {
          id: string
          name: string
          country: string
          lat: number
          lon: number
        }[]
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
