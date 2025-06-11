# Environment Setup Instructions

## Quick Start

1. **Copy environment variables:**

   ```bash
   cp .env.example .env.local
   ```

2. **Update `.env.local` with your actual Supabase credentials:**

   ```bash
   # Get these from your Supabase dashboard at https://supabase.com/dashboard
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # For testing, you can use these mock values temporarily:
   # NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
   ```

3. **Set up your Supabase database:**

   - Run the SQL commands from `database-setup.sql` in your Supabase SQL editor
   - This creates all the necessary tables and security policies

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## For Demo/Testing

If you want to test the application without setting up Supabase, the app will use mock data. However, authentication and database features won't work properly.

## Stripe Setup (Optional)

For payment functionality:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

The payment page includes a demo mode that simulates successful payments without requiring actual Stripe integration.
