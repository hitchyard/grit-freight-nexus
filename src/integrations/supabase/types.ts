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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          click_data: Json | null
          clicked_user_id: string | null
          commission_amount: number | null
          commission_rate: number | null
          conversion_amount: number | null
          conversion_user_id: string | null
          converted_at: string | null
          created_at: string
          id: string
        }
        Insert: {
          affiliate_id: string
          click_data?: Json | null
          clicked_user_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          conversion_amount?: number | null
          conversion_user_id?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
        }
        Update: {
          affiliate_id?: string
          click_data?: Json | null
          clicked_user_id?: string | null
          commission_amount?: number | null
          commission_rate?: number | null
          conversion_amount?: number | null
          conversion_user_id?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_clicked_user_id_fkey"
            columns: ["clicked_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_conversion_user_id_fkey"
            columns: ["conversion_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          bol_uploaded: boolean | null
          booked_rate: number
          broker_id: string
          created_at: string
          delivery_confirmation_time: string | null
          documents_signed: boolean | null
          id: string
          load_id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pickup_confirmation_time: string | null
          rate_confirmation_signed: boolean | null
          speed_to_book_minutes: number | null
          status: Database["public"]["Enums"]["booking_status"]
          trucker_id: string
          updated_at: string
        }
        Insert: {
          bol_uploaded?: boolean | null
          booked_rate: number
          broker_id: string
          created_at?: string
          delivery_confirmation_time?: string | null
          documents_signed?: boolean | null
          id?: string
          load_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_confirmation_time?: string | null
          rate_confirmation_signed?: boolean | null
          speed_to_book_minutes?: number | null
          status?: Database["public"]["Enums"]["booking_status"]
          trucker_id: string
          updated_at?: string
        }
        Update: {
          bol_uploaded?: boolean | null
          booked_rate?: number
          broker_id?: string
          created_at?: string
          delivery_confirmation_time?: string | null
          documents_signed?: boolean | null
          id?: string
          load_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pickup_confirmation_time?: string | null
          rate_confirmation_signed?: boolean | null
          speed_to_book_minutes?: number | null
          status?: Database["public"]["Enums"]["booking_status"]
          trucker_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trucker_id_fkey"
            columns: ["trucker_id"]
            isOneToOne: false
            referencedRelation: "truckers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_applications: {
        Row: {
          address: string
          admin_notes: string | null
          city: string
          company_name: string
          created_at: string
          dot_number: string | null
          email: string
          experience: string | null
          first_name: string
          fmcsa_address: string | null
          fmcsa_bond_compliant: boolean | null
          fmcsa_dba_name: string | null
          fmcsa_insurance_compliant: boolean | null
          fmcsa_legal_name: string | null
          fmcsa_operating_status: string | null
          fmcsa_raw_response: Json | null
          fmcsa_status: string | null
          fmcsa_verification_timestamp: string | null
          fmcsa_verified: boolean | null
          id: string
          last_name: string
          mc_number: string | null
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          state: string
          status: string
          updated_at: string
          user_id: string | null
          zip_code: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          city: string
          company_name: string
          created_at?: string
          dot_number?: string | null
          email: string
          experience?: string | null
          first_name: string
          fmcsa_address?: string | null
          fmcsa_bond_compliant?: boolean | null
          fmcsa_dba_name?: string | null
          fmcsa_insurance_compliant?: boolean | null
          fmcsa_legal_name?: string | null
          fmcsa_operating_status?: string | null
          fmcsa_raw_response?: Json | null
          fmcsa_status?: string | null
          fmcsa_verification_timestamp?: string | null
          fmcsa_verified?: boolean | null
          id?: string
          last_name: string
          mc_number?: string | null
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          state: string
          status?: string
          updated_at?: string
          user_id?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          city?: string
          company_name?: string
          created_at?: string
          dot_number?: string | null
          email?: string
          experience?: string | null
          first_name?: string
          fmcsa_address?: string | null
          fmcsa_bond_compliant?: boolean | null
          fmcsa_dba_name?: string | null
          fmcsa_insurance_compliant?: boolean | null
          fmcsa_legal_name?: string | null
          fmcsa_operating_status?: string | null
          fmcsa_raw_response?: Json | null
          fmcsa_status?: string | null
          fmcsa_verification_timestamp?: string | null
          fmcsa_verified?: boolean | null
          id?: string
          last_name?: string
          mc_number?: string | null
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          state?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      brokers: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          average_rating: number | null
          city: string | null
          company_name: string
          created_at: string
          dot_number: string | null
          id: string
          mc_number: string | null
          speed_to_book_avg: number | null
          state: string | null
          status: Database["public"]["Enums"]["broker_status"]
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean | null
          total_loads_posted: number | null
          trust_score: number | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          city?: string | null
          company_name: string
          created_at?: string
          dot_number?: string | null
          id?: string
          mc_number?: string | null
          speed_to_book_avg?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["broker_status"]
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_loads_posted?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          average_rating?: number | null
          city?: string | null
          company_name?: string
          created_at?: string
          dot_number?: string | null
          id?: string
          mc_number?: string | null
          speed_to_book_avg?: number | null
          state?: string | null
          status?: Database["public"]["Enums"]["broker_status"]
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          total_loads_posted?: number | null
          trust_score?: number | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brokers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brokers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          company_type: string | null
          created_at: string
          dot_number: string | null
          email: string | null
          id: string
          mc_number: string | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_type?: string | null
          created_at?: string
          dot_number?: string | null
          email?: string | null
          id?: string
          mc_number?: string | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_type?: string | null
          created_at?: string
          dot_number?: string | null
          email?: string | null
          id?: string
          mc_number?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          broker_amount: number
          broker_id: string
          contract_terms: Json | null
          created_at: string
          escrow_status: string | null
          executed_at: string | null
          future_id: string | null
          id: string
          platform_amount: number
          signed_at: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          trucker_amount: number
          trucker_id: string
          updated_at: string
        }
        Insert: {
          broker_amount: number
          broker_id: string
          contract_terms?: Json | null
          created_at?: string
          escrow_status?: string | null
          executed_at?: string | null
          future_id?: string | null
          id?: string
          platform_amount: number
          signed_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          trucker_amount: number
          trucker_id: string
          updated_at?: string
        }
        Update: {
          broker_amount?: number
          broker_id?: string
          contract_terms?: Json | null
          created_at?: string
          escrow_status?: string | null
          executed_at?: string | null
          future_id?: string | null
          id?: string
          platform_amount?: number
          signed_at?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          trucker_amount?: number
          trucker_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      futures: {
        Row: {
          ai_confidence_score: number | null
          created_at: string
          created_by: string
          end_date: string
          estimated_miles: number
          id: string
          lane_from: string
          lane_to: string
          market_demand: string | null
          matched_with: string | null
          rate_per_mile: number
          start_date: string
          status: string | null
          total_commitment: number
          truck_type: string
          updated_at: string
        }
        Insert: {
          ai_confidence_score?: number | null
          created_at?: string
          created_by: string
          end_date: string
          estimated_miles: number
          id?: string
          lane_from: string
          lane_to: string
          market_demand?: string | null
          matched_with?: string | null
          rate_per_mile: number
          start_date: string
          status?: string | null
          total_commitment: number
          truck_type: string
          updated_at?: string
        }
        Update: {
          ai_confidence_score?: number | null
          created_at?: string
          created_by?: string
          end_date?: string
          estimated_miles?: number
          id?: string
          lane_from?: string
          lane_to?: string
          market_demand?: string | null
          matched_with?: string | null
          rate_per_mile?: number
          start_date?: string
          status?: string | null
          total_commitment?: number
          truck_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      load_payments: {
        Row: {
          booking_id: string | null
          broker_fee: number | null
          broker_id: string
          created_at: string
          escrow_released: boolean | null
          id: string
          load_id: string
          platform_fee: number | null
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          total_amount: number
          trucker_amount: number | null
          trucker_id: string | null
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          broker_fee?: number | null
          broker_id: string
          created_at?: string
          escrow_released?: boolean | null
          id?: string
          load_id: string
          platform_fee?: number | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          total_amount: number
          trucker_amount?: number | null
          trucker_id?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          broker_fee?: number | null
          broker_id?: string
          created_at?: string
          escrow_released?: boolean | null
          id?: string
          load_id?: string
          platform_fee?: number | null
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          total_amount?: number
          trucker_amount?: number | null
          trucker_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "load_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_payments_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_payments_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "load_payments_trucker_id_fkey"
            columns: ["trucker_id"]
            isOneToOne: false
            referencedRelation: "truckers"
            referencedColumns: ["id"]
          },
        ]
      }
      load_vectors: {
        Row: {
          content_hash: string
          created_at: string
          embedding: string
          id: string
          load_id: string
        }
        Insert: {
          content_hash: string
          created_at?: string
          embedding: string
          id?: string
          load_id: string
        }
        Update: {
          content_hash?: string
          created_at?: string
          embedding?: string
          id?: string
          load_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "load_vectors_load_id_fkey"
            columns: ["load_id"]
            isOneToOne: false
            referencedRelation: "loads"
            referencedColumns: ["id"]
          },
        ]
      }
      loads: {
        Row: {
          broker_id: string
          contact_info: Json | null
          created_at: string
          delivery_city: string
          delivery_date: string
          delivery_state: string
          delivery_time: string | null
          description: string | null
          distance_miles: number | null
          equipment_needed: string | null
          expires_at: string
          id: string
          is_verified: boolean | null
          pickup_city: string
          pickup_date: string
          pickup_state: string
          pickup_time: string | null
          priority_level: number | null
          rate: number
          rate_per_mile: number | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["load_status"]
          title: string
          truck_type: Database["public"]["Enums"]["truck_type"]
          updated_at: string
          view_count: number | null
          weight_lbs: number | null
        }
        Insert: {
          broker_id: string
          contact_info?: Json | null
          created_at?: string
          delivery_city: string
          delivery_date: string
          delivery_state: string
          delivery_time?: string | null
          description?: string | null
          distance_miles?: number | null
          equipment_needed?: string | null
          expires_at?: string
          id?: string
          is_verified?: boolean | null
          pickup_city: string
          pickup_date: string
          pickup_state: string
          pickup_time?: string | null
          priority_level?: number | null
          rate: number
          rate_per_mile?: number | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["load_status"]
          title: string
          truck_type: Database["public"]["Enums"]["truck_type"]
          updated_at?: string
          view_count?: number | null
          weight_lbs?: number | null
        }
        Update: {
          broker_id?: string
          contact_info?: Json | null
          created_at?: string
          delivery_city?: string
          delivery_date?: string
          delivery_state?: string
          delivery_time?: string | null
          description?: string | null
          distance_miles?: number | null
          equipment_needed?: string | null
          expires_at?: string
          id?: string
          is_verified?: boolean | null
          pickup_city?: string
          pickup_date?: string
          pickup_state?: string
          pickup_time?: string | null
          priority_level?: number | null
          rate?: number
          rate_per_mile?: number | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["load_status"]
          title?: string
          truck_type?: Database["public"]["Enums"]["truck_type"]
          updated_at?: string
          view_count?: number | null
          weight_lbs?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loads_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          contract_id: string | null
          created_at: string
          id: string
          message_type: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          contract_id?: string | null
          created_at?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          contract_id?: string | null
          created_at?: string
          id?: string
          message_type?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          contract_id: string
          created_at: string
          id: string
          payout_date: string | null
          recipient_id: string
          status: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          contract_id: string
          created_at?: string
          id?: string
          payout_date?: string | null
          recipient_id: string
          status?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          contract_id?: string
          created_at?: string
          id?: string
          payout_date?: string | null
          recipient_id?: string
          status?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: []
      }
      precommitments: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          broker_id: string
          commitment_amount: number
          created_at: string
          expires_at: string
          forecast_rate: number
          id: string
          lane_from: string
          lane_to: string
          miles_estimate: number
          status: string | null
          truck_type: Database["public"]["Enums"]["truck_type"]
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          broker_id: string
          commitment_amount: number
          created_at?: string
          expires_at: string
          forecast_rate: number
          id?: string
          lane_from: string
          lane_to: string
          miles_estimate: number
          status?: string | null
          truck_type: Database["public"]["Enums"]["truck_type"]
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          broker_id?: string
          commitment_amount?: number
          created_at?: string
          expires_at?: string
          forecast_rate?: number
          id?: string
          lane_from?: string
          lane_to?: string
          miles_estimate?: number
          status?: string | null
          truck_type?: Database["public"]["Enums"]["truck_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          onboarding_complete: boolean | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          booking_id: string
          communication_rating: number | null
          created_at: string
          id: string
          payment_rating: number | null
          rated_id: string
          rater_id: string
          rating: number
          review: string | null
          timeliness_rating: number | null
        }
        Insert: {
          booking_id: string
          communication_rating?: number | null
          created_at?: string
          id?: string
          payment_rating?: number | null
          rated_id: string
          rater_id: string
          rating: number
          review?: string | null
          timeliness_rating?: number | null
        }
        Update: {
          booking_id?: string
          communication_rating?: number | null
          created_at?: string
          id?: string
          payment_rating?: number | null
          rated_id?: string
          rater_id?: string
          rating?: number
          review?: string | null
          timeliness_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rated_id_fkey"
            columns: ["rated_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_accounts: {
        Row: {
          account_type: string | null
          broker_id: string
          charges_enabled: boolean | null
          country: string | null
          created_at: string
          id: string
          onboarding_complete: boolean | null
          payouts_enabled: boolean | null
          stripe_account_id: string
          updated_at: string
        }
        Insert: {
          account_type?: string | null
          broker_id: string
          charges_enabled?: boolean | null
          country?: string | null
          created_at?: string
          id?: string
          onboarding_complete?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id: string
          updated_at?: string
        }
        Update: {
          account_type?: string | null
          broker_id?: string
          charges_enabled?: boolean | null
          country?: string | null
          created_at?: string
          id?: string
          onboarding_complete?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_accounts_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      truckers: {
        Row: {
          average_rating: number | null
          broker_id: string
          company_name: string | null
          created_at: string
          equipment_details: string | null
          home_base_city: string | null
          home_base_state: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          lane_profile_vector: string | null
          max_radius: number | null
          preferred_lanes: string[] | null
          rate_per_mile_min: number | null
          speed_to_book_avg: number | null
          total_bookings: number | null
          truck_type: Database["public"]["Enums"]["truck_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          average_rating?: number | null
          broker_id: string
          company_name?: string | null
          created_at?: string
          equipment_details?: string | null
          home_base_city?: string | null
          home_base_state?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          lane_profile_vector?: string | null
          max_radius?: number | null
          preferred_lanes?: string[] | null
          rate_per_mile_min?: number | null
          speed_to_book_avg?: number | null
          total_bookings?: number | null
          truck_type: Database["public"]["Enums"]["truck_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          average_rating?: number | null
          broker_id?: string
          company_name?: string | null
          created_at?: string
          equipment_details?: string | null
          home_base_city?: string | null
          home_base_state?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          lane_profile_vector?: string | null
          max_radius?: number | null
          preferred_lanes?: string[] | null
          rate_per_mile_min?: number | null
          speed_to_book_avg?: number | null
          total_bookings?: number | null
          truck_type?: Database["public"]["Enums"]["truck_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "truckers_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "truckers_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "truckers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_commission_split: {
        Args: { total_amount: number }
        Returns: {
          broker_amount: number
          platform_amount: number
          trucker_amount: number
        }[]
      }
      expire_old_loads: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      find_matching_loads: {
        Args: {
          similarity_threshold?: number
          trucker_broker_id?: string
          trucker_vector: string
        }
        Returns: {
          delivery_city: string
          delivery_state: string
          description: string
          distance_miles: number
          id: string
          pickup_city: string
          pickup_state: string
          rate: number
          similarity: number
          title: string
          truck_type: Database["public"]["Enums"]["truck_type"]
        }[]
      }
      find_matching_truckers: {
        Args: {
          load_broker_id?: string
          load_vector: string
          similarity_threshold?: number
        }
        Returns: {
          average_rating: number
          company_name: string
          home_base_city: string
          home_base_state: string
          id: string
          rate_per_mile_min: number
          similarity: number
          truck_type: Database["public"]["Enums"]["truck_type"]
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "in_transit"
        | "delivered"
        | "cancelled"
      broker_status: "pending" | "approved" | "rejected" | "suspended"
      load_status: "posted" | "booked" | "in_transit" | "delivered" | "expired"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
      truck_type: "hotshot" | "power_only" | "flatbed" | "dry_van" | "reefer"
      user_role: "admin" | "broker" | "trucker"
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
      booking_status: [
        "pending",
        "confirmed",
        "in_transit",
        "delivered",
        "cancelled",
      ],
      broker_status: ["pending", "approved", "rejected", "suspended"],
      load_status: ["posted", "booked", "in_transit", "delivered", "expired"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
      ],
      truck_type: ["hotshot", "power_only", "flatbed", "dry_van", "reefer"],
      user_role: ["admin", "broker", "trucker"],
    },
  },
} as const
