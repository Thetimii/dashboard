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
    
    // Get user with better error handling
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

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
    
    console.log('updateProjectStatus called with:', { userId, status, finalUrl })
    
    if (!userId || !status) {
      console.error('Missing required fields:', { userId, status })
      throw new Error('Missing required fields: userId or status')
    }
    
    const updates: any = { status }
    if (finalUrl !== undefined && finalUrl !== '') {
      updates.final_url = finalUrl
    }
    
    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString()

    console.log('Attempting to update project status with:', updates)

    // First check if record exists
    const { data: existingRecord, error: selectError } = await supabase
      .from('project_status')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError) {
      console.error('Error checking existing record:', selectError)
      throw selectError
    }

    let result
    if (existingRecord) {
      // Update existing record
      console.log('Updating existing project status record')
      result = await supabase
        .from('project_status')
        .update(updates)
        .eq('user_id', userId)
        .select()
    } else {
      // Insert new record
      console.log('Inserting new project status record')
      result = await supabase
        .from('project_status')
        .insert({ 
          user_id: userId, 
          ...updates,
          created_at: new Date().toISOString()
        })
        .select()
    }

    if (result.error) {
      console.error('Supabase error updating project status:', {
        error: result.error,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
        code: result.error.code
      })
      throw result.error
    }
    
    console.log('Project status updated successfully:', result.data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating project status:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: `Failed to update project status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

async function updateDemoLinks(supabase: any, body: any) {
  try {
    const { userId, updates } = body
    
    if (!userId || !updates) {
      throw new Error('Missing required fields: userId or updates')
    }

    console.log('Updating demo links:', { userId, updates })

    // Add updated_at timestamp to the updates
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    // First check if record exists
    const { data: existingRecord, error: selectError } = await supabase
      .from('demo_links')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()

    if (selectError) {
      console.error('Error checking existing record:', selectError)
      throw selectError
    }

    let result
    if (existingRecord) {
      // Update existing record
      console.log('Updating existing record with:', updatesWithTimestamp)
      result = await supabase
        .from('demo_links')
        .update(updatesWithTimestamp)
        .eq('user_id', userId)
        .select()
    } else {
      // Insert new record
      console.log('Inserting new record with:', { user_id: userId, ...updatesWithTimestamp })
      result = await supabase
        .from('demo_links')
        .insert({ 
          user_id: userId, 
          ...updatesWithTimestamp,
          created_at: new Date().toISOString()
        })
        .select()
    }

    if (result.error) {
      console.error('Supabase error updating demo links:', result.error)
      throw result.error
    }
    
    console.log('Demo links updated successfully:', result.data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating demo links:', error)
    return NextResponse.json({ error: `Failed to update demo links: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
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
