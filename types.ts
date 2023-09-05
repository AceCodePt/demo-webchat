export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      message: {
        Row: {
          created_at: string
          id: number
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          text: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      users: {
        Row: {
          full_name: string | null
          id: string | null
          img_url: string | null
        }
        Insert: {
          full_name?: never
          id?: string | null
          img_url?: never
        }
        Update: {
          full_name?: never
          id?: string | null
          img_url?: never
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
