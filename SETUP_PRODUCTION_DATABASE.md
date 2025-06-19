# Production Database Setup Guide

## Current Issues in Production

The application is experiencing 406 "Not Acceptable" errors when trying to access the `followup_questionnaires` table. This indicates that the database table hasn't been created in the production Supabase instance.

## Quick Fix Required

### 1. Create the Followup Questionnaires Table

Run the SQL script in your **Supabase SQL Editor**:

```sql
-- SQL to create the follow-up questionnaire table
-- Run this in your Supabase SQL editor

CREATE TABLE followup_questionnaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed BOOLEAN DEFAULT false,
  
  -- Ziel des Unternehmens (Business Goals)
  core_business TEXT,
  revenue_generation TEXT,
  secondary_revenue TEXT,
  long_term_revenue TEXT,
  
  -- Wettbewerbsumfeld (Competitive Environment)
  unique_selling_points TEXT,
  customer_choice_reasons TEXT,
  problems_solved TEXT,
  trust_building TEXT,
  potential_objections TEXT,
  main_competitors TEXT,
  competitor_strengths TEXT,
  
  -- Zielgruppenanalyse (Target Group Analysis)
  target_group_demographics TEXT,
  target_group_needs TEXT,
  
  -- Inhaltsplanung (Content Planning)
  service_subpages BOOLEAN DEFAULT false,
  service_subpages_details TEXT,
  existing_content BOOLEAN DEFAULT false,
  existing_content_details TEXT,
  
  -- Funktionalität (Functionality)
  required_functions TEXT[],
  ecommerce_needed BOOLEAN DEFAULT false,
  blog_needed BOOLEAN DEFAULT false,
  newsletter_needed BOOLEAN DEFAULT false,
  member_area_needed BOOLEAN DEFAULT false,
  social_media_needed BOOLEAN DEFAULT false,
  whatsapp_chat_needed BOOLEAN DEFAULT false,
  appointment_booking BOOLEAN DEFAULT false,
  appointment_tool TEXT,
  existing_seo_keywords TEXT,
  google_analytics_needed BOOLEAN DEFAULT false,
  
  -- Domain & Hosting
  desired_domain TEXT,
  
  -- Rechtliche Anforderungen (Legal Requirements)
  privacy_policy_exists BOOLEAN DEFAULT false,
  privacy_policy_creation_needed BOOLEAN DEFAULT false,
  company_address TEXT,
  company_phone TEXT,
  company_email TEXT,
  vat_id TEXT
);

-- Enable Row Level Security
ALTER TABLE followup_questionnaires ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own questionnaires
CREATE POLICY "Users can view their own questionnaires" ON followup_questionnaires
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questionnaires" ON followup_questionnaires
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questionnaires" ON followup_questionnaires
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_followup_questionnaires_updated_at 
    BEFORE UPDATE ON followup_questionnaires 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_followup_questionnaires_user_id ON followup_questionnaires(user_id);
CREATE INDEX idx_followup_questionnaires_completed ON followup_questionnaires(completed);

-- Admin access policy
CREATE POLICY "Admin can view all questionnaires" ON followup_questionnaires
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );
```

### 2. Steps to Execute

1. **Log into your Supabase Dashboard**
2. **Go to SQL Editor**
3. **Paste the entire SQL script above**
4. **Run the script**
5. **Verify the table was created** by checking the Table Editor

## What This Fixes

- ✅ **406 "Not Acceptable" errors** - The table will exist and can be accessed
- ✅ **Form submission failures** - Users can now save their questionnaire responses
- ✅ **Dashboard questionnaire status** - Shows correct completion status
- ✅ **Payment flow continuation** - Users are properly redirected after payment

## Expected Behavior After Fix

1. **After successful payment** → User redirected to `/followupquestions`
2. **Questionnaire completion** → Responses saved to database
3. **Dashboard shows questionnaire status** → Green checkmark when completed
4. **Admin can view questionnaire responses** → In the admin dashboard

## Error Handling Improvements

The application now includes better error handling:

- **Database table not found** → Clear message to user about setup in progress
- **Network errors** → Retry mechanisms
- **Payment flow issues** → Retry payment button in dashboard
- **Form validation** → German error messages

## Testing After Database Setup

1. **Complete a payment flow** → Should redirect to questionnaire
2. **Fill out questionnaire** → Should save successfully
3. **Check dashboard** → Should show questionnaire as completed
4. **Admin dashboard** → Should display questionnaire responses

## Monitoring

Monitor the application logs for:
- Successful questionnaire submissions
- Any remaining database errors
- Payment flow completion rates

## Files Modified

- `/src/app/dashboard/page.tsx` - Added retry payment functionality
- `/src/app/followupquestions/page.tsx` - Improved error handling
- `/create-followup-questionnaire-table.sql` - Database schema
- `/src/lib/database.types.ts` - TypeScript types
- `/src/lib/validations.ts` - Form validation schema

The application is now production-ready once the database table is created.
