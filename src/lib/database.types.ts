export type Database = {
  public: {
    Enums: {
      project_status_enum: 'not_touched' | 'in_progress' | 'complete' | 'live'
      payment_status_enum: 'pending' | 'completed' | 'failed' | 'cancelled' | 'scheduled_for_cancellation'
      user_role_enum: 'user' | 'admin'
    }
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string | null
          created_at: string
          role: Database['public']['Enums']['user_role_enum']
        }
        Insert: {
          id: string
          full_name?: string | null
          created_at?: string
          role?: Database['public']['Enums']['user_role_enum']
        }
        Update: {
          id?: string
          full_name?: string | null
          created_at?: string
          role?: Database['public']['Enums']['user_role_enum']
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
          original_amount: number | null
          discount_amount: number | null
          promo_code: string | null
          promo_code_id: string | null
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
          original_amount?: number | null
          discount_amount?: number | null
          promo_code?: string | null
          promo_code_id?: string | null
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
          original_amount?: number | null
          discount_amount?: number | null
          promo_code?: string | null
          promo_code_id?: string | null
          status?: Database['public']['Enums']['payment_status_enum']
          cancelled_at?: string | null
          cancellation_scheduled_at?: string | null
          created_at?: string
        }
      }
      promo_codes: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          max_uses: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed_amount'
          discount_value: number
          max_uses?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed_amount'
          discount_value?: number
          max_uses?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      followup_questionnaires: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          completed: boolean
          core_business: string | null
          revenue_generation: string | null
          secondary_revenue: string | null
          long_term_revenue: string | null
          unique_selling_points: string | null
          customer_choice_reasons: string | null
          problems_solved: string | null
          trust_building: string | null
          potential_objections: string | null
          main_competitors: string | null
          competitor_strengths: string | null
          target_group_demographics: string | null
          target_group_needs: string | null
          service_subpages: boolean
          service_subpages_details: string | null
          existing_content: boolean
          existing_content_details: string | null
          required_functions: string[] | null
          ecommerce_needed: boolean
          blog_needed: boolean
          newsletter_needed: boolean
          member_area_needed: boolean
          social_media_needed: boolean
          whatsapp_chat_needed: boolean
          appointment_booking: boolean
          appointment_tool: string | null
          existing_seo_keywords: string | null
          google_analytics_needed: boolean
          desired_domain: string | null
          privacy_policy_exists: boolean
          privacy_policy_creation_needed: boolean
          company_address: string | null
          company_phone: string | null
          company_email: string | null
          vat_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          completed?: boolean
          core_business?: string | null
          revenue_generation?: string | null
          secondary_revenue?: string | null
          long_term_revenue?: string | null
          unique_selling_points?: string | null
          customer_choice_reasons?: string | null
          problems_solved?: string | null
          trust_building?: string | null
          potential_objections?: string | null
          main_competitors?: string | null
          competitor_strengths?: string | null
          target_group_demographics?: string | null
          target_group_needs?: string | null
          service_subpages?: boolean
          service_subpages_details?: string | null
          existing_content?: boolean
          existing_content_details?: string | null
          required_functions?: string[] | null
          ecommerce_needed?: boolean
          blog_needed?: boolean
          newsletter_needed?: boolean
          member_area_needed?: boolean
          social_media_needed?: boolean
          whatsapp_chat_needed?: boolean
          appointment_booking?: boolean
          appointment_tool?: string | null
          existing_seo_keywords?: string | null
          google_analytics_needed?: boolean
          desired_domain?: string | null
          privacy_policy_exists?: boolean
          privacy_policy_creation_needed?: boolean
          company_address?: string | null
          company_phone?: string | null
          company_email?: string | null
          vat_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          completed?: boolean
          core_business?: string | null
          revenue_generation?: string | null
          secondary_revenue?: string | null
          long_term_revenue?: string | null
          unique_selling_points?: string | null
          customer_choice_reasons?: string | null
          problems_solved?: string | null
          trust_building?: string | null
          potential_objections?: string | null
          main_competitors?: string | null
          competitor_strengths?: string | null
          target_group_demographics?: string | null
          target_group_needs?: string | null
          service_subpages?: boolean
          service_subpages_details?: string | null
          existing_content?: boolean
          existing_content_details?: string | null
          required_functions?: string[] | null
          ecommerce_needed?: boolean
          blog_needed?: boolean
          newsletter_needed?: boolean
          member_area_needed?: boolean
          social_media_needed?: boolean
          whatsapp_chat_needed?: boolean
          appointment_booking?: boolean
          appointment_tool?: string | null
          existing_seo_keywords?: string | null
          google_analytics_needed?: boolean
          desired_domain?: string | null
          privacy_policy_exists?: boolean
          privacy_policy_creation_needed?: boolean
          company_address?: string | null
          company_phone?: string | null
          company_email?: string | null
          vat_id?: string | null
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
