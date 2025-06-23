# Admin Dashboard Guide

## Overview

The Admin Dashboard is a comprehensive management interface that allows administrators to view, manage, and assign clients within the dashboard application. This system includes role-based access control, client management, project tracking, and assignment management.

## Features

### 1. Role-Based Access Control

- **User Roles**: `user` (default) and `admin`
- **Admin Access**: Only users with `role = 'admin'` can access the admin dashboard
- **Automatic Redirection**: Non-admin users are redirected to the regular dashboard

### 2. Client Management

- **View All Clients**: See all users with `role = 'user'`
- **Client Information**: Full name, email, registration date, project status
- **Search & Filter**: Search by name/ID, filter by project status and assignment status
- **Detailed View**: Access comprehensive client information including:
  - Kickoff form details
  - Project status and final URLs
  - Demo links and approvals
  - Follow-up questionnaire responses
  - Payment information

### 3. Project Management

- **Status Updates**: Change project status (not_touched, in_progress, complete, live)
- **Demo Link Management**: Add and edit demo URLs for client review
- **Final URL Management**: Set the live website URL when projects go live
- **Status Tracking**: Visual indicators for project progress

### 4. Assignment Management

- **Assign Clients**: Assign clients to specific admin users
- **Reassign Clients**: Change client assignments between admins
- **My Clients View**: Filter to see only clients assigned to the current admin
- **Unassigned Clients**: Identify and assign clients who don't have an admin
- **Assignment Overview**: See client distribution across all admins

### 5. Dashboard Tabs

#### Client Management Tab

- Comprehensive client list with search and filters
- Quick actions: View Details, Assign/Reassign
- Status indicators and project information
- Bulk operations for efficient management

#### Assignments Tab

- Grouped view by admin
- Shows each admin's assigned clients
- Highlights unassigned clients
- Quick reassignment capabilities
- Visual client distribution

#### Overview Tab

- Key metrics and statistics
- Recent client activity
- Project status distribution
- Assignment statistics

## Database Structure

### User Profiles Table

```sql
user_profiles (
  id uuid PRIMARY KEY,
  full_name text,
  role user_role_enum DEFAULT 'user',
  created_at timestamp DEFAULT now()
)
```

### Client Assignments Table

```sql
client_assignments (
  id uuid PRIMARY KEY,
  admin_id uuid REFERENCES user_profiles(id),
  client_id uuid REFERENCES user_profiles(id),
  created_at timestamp DEFAULT now()
)
```

### Project Status Table

```sql
project_status (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  status project_status_enum DEFAULT 'not_touched',
  updated_at timestamp DEFAULT now(),
  final_url text
)
```

### Demo Links Table

```sql
demo_links (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  option_1_url text,
  option_2_url text,
  option_3_url text,
  approved_option text,
  approved_at timestamp
)
```

## Setup Instructions

### 1. Database Setup

Run the following SQL migrations in order:

1. **Add User Roles**: `add-user-roles.sql`

   - Creates the `user_role_enum` type
   - Adds role column to `user_profiles`
   - Sets up RLS policies for admin access

2. **Set Admin User**: `set-admin-user.sql`
   - Use this to manually set users as admins
   - Replace email/ID with actual user information

### 2. Environment Configuration

Ensure your Supabase environment variables are properly configured:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Authentication Integration

The admin dashboard integrates with the existing authentication system:

- Uses the same `AuthContext` with enhanced role checking
- Adds `isAdmin()` helper function
- Automatic user profile creation on signup

## Access Control

### Row Level Security (RLS) Policies

The system includes comprehensive RLS policies:

- **Admin Read Access**: Admins can view all user data
- **Admin Write Access**: Admins can update project status, demo links, and assignments
- **User Privacy**: Regular users can only access their own data
- **Service Role**: Backend operations have full access

### Permission Levels

1. **Super Admin**: Can manage all clients and admins
2. **Admin**: Can manage assigned clients and view all clients
3. **User**: Can only access their own dashboard

## API Endpoints

### Admin API (`/api/admin`)

- **GET**: Fetch clients and admins data
- **POST**: Update project status, demo links, and assignments

### Available Actions

- `clients`: Get all client data
- `admins`: Get all admin users
- `update_project_status`: Update project status and final URL
- `update_demo_links`: Update demo URLs
- `assign_client`: Assign/reassign clients to admins

## Navigation Integration

### Dashboard Layout

The admin dashboard link appears automatically in the sidebar for admin users:

- Only visible to users with `role = 'admin'`
- Styled with purple accent to distinguish from regular navigation
- Icon: Shield check icon for security association

### Access Flow

1. User signs in normally
2. System checks user role
3. If admin: Shows admin dashboard link in sidebar
4. If user: Standard dashboard only
5. Direct URL access is protected by middleware

## Usage Examples

### Making a User Admin

```sql
-- Find user by email
SELECT id, email FROM auth.users WHERE email = 'admin@example.com';

-- Set as admin (replace with actual user ID)
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'user-id-here';
```

### Assigning a Client

1. Go to Admin Dashboard → Client Management
2. Find the client in the list
3. Click "Assign" button
4. Select admin from dropdown
5. Click "Assign" to confirm

### Updating Project Status

1. Go to Admin Dashboard → Client Management
2. Click "View Details" on a client
3. Click edit icon next to Project Status
4. Select new status and add final URL if needed
5. Click "Save"

### Viewing My Clients Only

1. Go to Admin Dashboard → Client Management
2. In the Assignment Status filter, select "My Clients"
3. List will show only clients assigned to you

## Security Considerations

### Data Protection

- All admin operations are logged
- RLS policies prevent unauthorized access
- Client data is only accessible to assigned admins or super admins

### Role Verification

- Every admin operation verifies user role
- API endpoints check admin status on each request
- Client-side and server-side validation

### Audit Trail

- Client assignments are tracked with timestamps
- Project status changes are logged
- All admin actions can be traced

## Troubleshooting

### Common Issues

1. **Admin Link Not Showing**

   - Check user role in database: `SELECT role FROM user_profiles WHERE id = 'user-id'`
   - Ensure user profile exists
   - Verify role is set to 'admin'

2. **Permission Denied**

   - Verify RLS policies are enabled
   - Check admin role assignment
   - Ensure database migrations ran successfully

3. **Client Data Not Loading**
   - Check Supabase connection
   - Verify API endpoints are working
   - Check browser console for errors

### Debug Commands

```sql
-- Check user roles
SELECT up.id, au.email, up.full_name, up.role
FROM user_profiles up
JOIN auth.users au ON up.id = au.id;

-- Check client assignments
SELECT ca.*,
       admin.full_name as admin_name,
       client.full_name as client_name
FROM client_assignments ca
JOIN user_profiles admin ON ca.admin_id = admin.id
JOIN user_profiles client ON ca.client_id = client.id;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

## Support

For issues or questions regarding the admin dashboard:

1. Check the troubleshooting section above
2. Verify database setup and migrations
3. Check browser console for JavaScript errors
4. Ensure Supabase environment variables are correct
