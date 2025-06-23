import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin by directly checking their profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'clients':
        return await getClients(supabase)
      case 'admins':
        return await getAdmins(supabase)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'update_project_status':
        return await updateProjectStatus(supabase, body)
      case 'update_demo_links':
        return await updateDemoLinks(supabase, body)
      case 'assign_client':
        return await assignClient(supabase, body)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getClients(supabase: any) {
  try {
    // Get all users with role 'user'
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'user')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    // For each user, get their associated data
    const clientsData = await Promise.all(
      userProfiles.map(async (profile: any) => {
        const [kickoffForm, projectStatus, demoLinks, followupQuestionnaire, payment, assignment] = await Promise.all([
          supabase.from('kickoff_forms').select('*').eq('user_id', profile.id).maybeSingle(),
          supabase.from('project_status').select('*').eq('user_id', profile.id).maybeSingle(),
          supabase.from('demo_links').select('*').eq('user_id', profile.id).maybeSingle(),
          supabase.from('followup_questionnaires').select('*').eq('user_id', profile.id).maybeSingle(),
          supabase.from('payments').select('*').eq('user_id', profile.id).eq('status', 'completed').maybeSingle(),
          supabase.from('client_assignments').select('*, admin:admin_id(full_name)').eq('client_id', profile.id).maybeSingle()
        ])

        return {
          user_profile: profile,
          kickoff_form: kickoffForm.data,
          project_status: projectStatus.data,
          demo_links: demoLinks.data,
          followup_questionnaire: followupQuestionnaire.data,
          payment: payment.data,
          assignment: assignment.data
        }
      })
    )

    return NextResponse.json({ clients: clientsData })
  } catch (error) {
    console.error('Error loading clients:', error)
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 })
  }
}

async function getAdmins(supabase: any) {
  try {
    const { data: adminProfiles, error } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .eq('role', 'admin')

    if (error) throw error
    return NextResponse.json({ admins: adminProfiles })
  } catch (error) {
    console.error('Error loading admins:', error)
    return NextResponse.json({ error: 'Failed to load admins' }, { status: 500 })
  }
}

async function updateProjectStatus(supabase: any, body: any) {
  try {
    const { userId, status, finalUrl } = body
    const updates: any = { status }
    if (finalUrl !== undefined) {
      updates.final_url = finalUrl
    }

    const { error } = await supabase
      .from('project_status')
      .upsert({ user_id: userId, ...updates })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating project status:', error)
    return NextResponse.json({ error: 'Failed to update project status' }, { status: 500 })
  }
}

async function updateDemoLinks(supabase: any, body: any) {
  try {
    const { userId, updates } = body

    const { error } = await supabase
      .from('demo_links')
      .upsert({ user_id: userId, ...updates })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating demo links:', error)
    return NextResponse.json({ error: 'Failed to update demo links' }, { status: 500 })
  }
}

async function assignClient(supabase: any, body: any) {
  try {
    const { clientId, adminId } = body

    // Remove existing assignment
    await supabase
      .from('client_assignments')
      .delete()
      .eq('client_id', clientId)

    // Create new assignment
    const { error } = await supabase
      .from('client_assignments')
      .insert({ client_id: clientId, admin_id: adminId })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error assigning client:', error)
    return NextResponse.json({ error: 'Failed to assign client' }, { status: 500 })
  }
}
