# Dashboard - Website Builder Application

A modern Next.js TypeScript dashboard application with Supabase authentication, database integration, and Stripe payment processing. Features a comprehensive user onboarding flow with multi-step forms and project management dashboard.

## Features

- **User Authentication**: Secure sign-up/sign-in with Supabase Auth
- **Multi-Step Onboarding**: Comprehensive kickoff form with file uploads
- **Project Tracking**: Visual progress tracking with status updates
- **Demo Management**: Client review and approval system
- **Payment Integration**: Stripe payment processing (demo mode)
- **Modern UI**: Clean, responsive design with Tailwind CSS and Framer Motion

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Payments**: Stripe
- **Animations**: Framer Motion
- **Form Validation**: React Hook Form + Zod
- **Icons**: Heroicons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Stripe account (for payment features)

### Environment Setup

1. Copy the environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:

   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

3. Add your Stripe credentials:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `STRIPE_SECRET_KEY`: Your Stripe secret key

### Database Setup

1. Run the SQL commands in `database-setup.sql` in your Supabase SQL editor
2. This will create all necessary tables and Row Level Security policies

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Application Flow

1. **Landing Page**: Automatically redirects to sign-up or dashboard
2. **Sign-Up**: New users create accounts
3. **Kickoff Form**: 8-step onboarding process:
   - Business Name
   - Business Description
   - Website Style Selection
   - Desired Pages
   - Color Preferences
   - Logo Upload
   - Content Upload
   - Special Requests
4. **Dashboard**: Two main tabs:
   - **Project Tracker**: Visual progress (Not Touched → In Progress → Complete)
   - **Demo Options**: Review and approve website demos
5. **Payment**: Stripe integration for project finalization

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── dashboard/         # Dashboard page
│   ├── kickoff/          # Multi-step onboarding form
│   ├── payment/          # Payment processing
│   ├── signin/           # Sign-in page
│   └── signup/           # Sign-up page
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   ├── database.types.ts # TypeScript database types
│   ├── stripe.ts         # Stripe configuration
│   ├── supabase.ts       # Supabase client
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod validation schemas
```

## Database Schema

- **user_profiles**: Extended user information
- **kickoff_forms**: Onboarding form responses
- **project_status**: Project progress tracking
- **demo_links**: Website demo options
- **payments**: Payment records

## Development Notes

- All forms include proper validation with Zod schemas
- Row Level Security (RLS) is enabled for data protection
- File uploads are simulated (integrate with Supabase Storage in production)
- Payment processing includes demo mode for testing
- Responsive design works on mobile and desktop

## Production Deployment

1. Set up your Supabase project with the database schema
2. Configure Stripe webhooks for payment processing
3. Implement file upload to Supabase Storage
4. Update environment variables for production
5. Deploy to Vercel or your preferred platform

## License

MIT License - feel free to use this project as a starting point for your own applications.
