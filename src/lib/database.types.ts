export type Database = {
  public: {
    Enums: {
      project_status_enum: 'not_touched' | 'in_progress' | 'complete' | 'live'
      payment_status_enum: 'pending' | 'completed' | 'failed' | 'cancelled' | 'scheduled_for_cancellation'
    }
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          phone_number: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone_number?: string | null
          created_at?: string
        }
      }
      kickoff_forms: {
        Row: {
          id: string
          user_id: string
          business_name: string | null
          business_description: string | null
          website_style: string | null
          desired_pages: string[] | null
          color_preferences: string | null
          logo_url: string | null
          content_upload_url: string | null
          special_requests: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name?: string | null
          business_description?: string | null
          website_style?: string | null
          desired_pages?: string[] | null
          color_preferences?: string | null
          logo_url?: string | null
          content_upload_url?: string | null
          special_requests?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string | null
          business_description?: string | null
          website_style?: string | null
          desired_pages?: string[] | null
          color_preferences?: string | null
          logo_url?: string | null
          content_upload_url?: string | null
          special_requests?: string | null
          completed?: boolean
          created_at?: string
        }
      }
      project_status: {
        Row: {
          id: string
          user_id: string
          status: Database['public']['Enums']['project_status_enum']
          updated_at: string
          final_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          status?: Database['public']['Enums']['project_status_enum']
          updated_at?: string
          final_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          status?: Database['public']['Enums']['project_status_enum']
          updated_at?: string
          final_url?: string | null
        }
      }
      demo_links: {
        Row: {
          id: string
          user_id: string
          option_1_url: string | null
          option_2_url: string | null
          option_3_url: string | null
          approved_option: string | null
          approved_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          option_1_url?: string | null
          option_2_url?: string | null
          option_3_url?: string | null
          approved_option?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          option_1_url?: string | null
          option_2_url?: string | null
          option_3_url?: string | null
          approved_option?: string | null
          approved_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          stripe_payment_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          amount: number | null
          status: Database['public']['Enums']['payment_status_enum']
          cancelled_at: string | null
          cancellation_scheduled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          amount?: number | null
          status: Database['public']['Enums']['payment_status_enum']
          cancelled_at?: string | null
          cancellation_scheduled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          amount?: number | null
          status?: Database['public']['Enums']['payment_status_enum']
          cancelled_at?: string | null
          cancellation_scheduled_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
  }
}
