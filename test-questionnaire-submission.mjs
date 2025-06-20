import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use the service role key to bypass RLS for this server-side script
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or service role key is missing. Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local');
}

// Initialize Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function submitQuestionnaire() {
  const userId = 'faf6204a-fe29-4848-abbc-87a87f51d8eb';
  const questionnaireData = {
    user_id: userId,
    core_business: 'Test Core Business',
    revenue_generation: 'Test Revenue Generation',
    secondary_revenue: 'Test Secondary Revenue',
    long_term_revenue: 'Test Long Term Revenue',
    unique_selling_points: 'Test Unique Selling Points',
    customer_choice_reasons: 'Test Customer Choice Reasons',
    problems_solved: 'Test Problems Solved',
    trust_building: 'Test Trust Building',
    potential_objections: 'Test Potential Objections',
    main_competitors: 'Test Main Competitors',
    competitor_strengths: 'Test Competitor Strengths',
    target_group_demographics: 'Test Target Group Demographics',
    target_group_needs: 'Test Target Group Needs',
    service_subpages: true,
    service_subpages_details: 'Details about service subpages.',
    existing_content: true,
    existing_content_details: 'Details about existing content.',
    required_functions: ['e-commerce', 'blog'],
    ecommerce_needed: true,
    blog_needed: true,
    newsletter_needed: false,
    member_area_needed: false,
    social_media_needed: true,
    whatsapp_chat_needed: false,
    appointment_booking: true,
    appointment_tool: 'Calendly',
    existing_seo_keywords: 'keyword1, keyword2',
    google_analytics_needed: true,
    desired_domain: 'testdomain.com',
    privacy_policy_exists: true,
    privacy_policy_creation_needed: false,
    company_address: '123 Test Street, Test City, 12345',
    company_phone: '123-456-7890',
    company_email: 'test@test.com',
    vat_id: 'TESTVAT123',
    completed: true,
  };

  const { data, error } = await supabase
    .from('followup_questionnaires')
    .upsert(questionnaireData, { onConflict: 'user_id' });

  if (error) {
    console.error('Error submitting questionnaire:', error);
  } else {
    console.log('Questionnaire submitted successfully:', data);
  }
}

submitQuestionnaire();
