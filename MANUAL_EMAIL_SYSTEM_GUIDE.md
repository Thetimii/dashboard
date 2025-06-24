# Manual Email System Documentation

## Overview

This system allows administrators to manually send emails with duplicate prevention. It tracks what emails have been sent and prevents duplicate emails from being sent unless the underlying data has changed.

## Features

### 1. Manual Email Buttons in Client Details Modal

- **Demo Ready Email**: Appears in the Demo Links section

  - Only enabled when all 3 demo options (URLs) are present
  - Shows status: "Ready to send" or reason why it can't be sent
  - Prevents duplicates by comparing current demo URLs with last sent email

- **Website Launch Email**: Appears in the Project Status section
  - Only enabled when project status is "live" and has a final URL
  - Shows status: "Ready to send" or reason why it can't be sent
  - Prevents duplicates by comparing current status/URL with last sent email

### 2. Duplicate Prevention Logic

The system compares the current state with the `trigger_values` stored from the last email sent:

- **For Demo Ready**: Compares current `{option_1_url, option_2_url, option_3_url, updated_at}`
- **For Website Launch**: Compares current `{final_url, status, updated_at}`

If values are identical to the last email sent, the button is disabled with message: "Same values as last email sent on [date]"

### 3. Email Management Dashboard

Access via **Admin Dashboard > 📧 Email Management**

Features:

- Send manual emails with real-time status checking
- Filter and search email history
- View complete audit trail of all sent emails
- See who sent what and when

## Database Schema

### `manual_email_sends` table:

```sql
- id: UUID (primary key)
- user_id: UUID (recipient user)
- email_type: 'demo_ready' | 'website_launch'
- sent_at: timestamp
- sent_by: UUID (admin who sent it)
- trigger_values: JSONB (state when email was sent)
- email_subject: text
- email_recipient: text (actual email address)
- status: 'sent' | 'failed' | 'pending'
- error_message: text (optional)
```

## API Endpoints

### POST `/api/admin/send-manual-email`

Sends a manual email with duplicate checking:

```json
{
  "userId": "uuid",
  "emailType": "demo_ready" | "website_launch",
  "sentBy": "admin_uuid"
}
```

### GET `/api/admin/send-manual-email?userId=uuid&emailType=type`

Checks if email can be sent:

```json
{
  "canSend": boolean,
  "reason": "string explaining status",
  "currentState": {...},
  "lastEmail": {...}
}
```

## How It Works

1. **Admin opens client details modal**
2. **System checks current state** (demo links or project status)
3. **System compares with last email sent** for that type
4. **Button shows appropriate state**:
   - Green "Send Email" if ready
   - Gray disabled if duplicate or requirements not met
5. **Admin clicks send** → email sent and recorded in database
6. **Future checks** will compare against this new baseline

## Email Templates

Uses existing email templates:

- `sendDemoReadyEmail()` for demo notifications
- `sendWebsiteLaunchEmail()` for launch notifications

## Security

- Only admin users can send manual emails (checked via RLS policies)
- All email sends are logged with admin ID who sent them
- Complete audit trail for compliance

## Usage Tips

1. **Demo emails** require all 3 demo URLs to be filled
2. **Launch emails** require status="live" AND final_url to be set
3. **Re-sending** is only allowed if the underlying data changes
4. **Check email management page** for full history and bulk operations
5. **Toast notifications** show success/failure status immediately
