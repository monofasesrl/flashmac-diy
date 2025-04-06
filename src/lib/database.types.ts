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
      tickets: {
        Row: {
          id: string
          ticket_number: string
          description: string
          status: string
          priority: string
          customer_name: string
          customer_email: string
          customer_phone: string | null
          device_type: string
          price: number | null
          created_at: string
          updated_at: string
          user_id: string
          assigned_to: string | null
        }
        Insert: {
          id?: string
          ticket_number: string
          description: string
          status: string
          priority: string
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          device_type: string
          price?: number | null
          created_at?: string
          updated_at?: string
          user_id: string
          assigned_to?: string | null
        }
        Update: {
          id?: string
          ticket_number?: string
          description?: string
          status?: string
          priority?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          device_type?: string
          price?: number | null
          created_at?: string
          updated_at?: string
          user_id?: string
          assigned_to?: string | null
        }
      }
      settings: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
      }
    }
  }
}
