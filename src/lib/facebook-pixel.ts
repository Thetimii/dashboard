import { createHash } from 'crypto'

// Facebook Pixel Configuration
const FACEBOOK_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_PIXEL_ACCESS_TOKEN
const FACEBOOK_API_VERSION = process.env.NEXT_PUBLIC_FACEBOOK_API_VERSION || 'v21.0'

// Hash function for PII data (email, phone)
function hashData(data: string): string {
  return createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
}

// Get client information from request headers
function getClientInfo(request?: Request) {
  if (!request) return {}
  
  const userAgent = request.headers.get('user-agent') || undefined
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.headers.get('cf-connecting-ip') || undefined
  
  return {
    client_user_agent: userAgent,
    client_ip_address: clientIp,
  }
}

// Base event interface
interface FacebookPixelEvent {
  event_name: string
  event_time: number
  action_source: 'website' | 'email' | 'app' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other'
  event_source_url?: string
  event_id?: string
  user_data?: {
    em?: string[]  // hashed email
    ph?: string[]  // hashed phone
    country?: string[]  // country code (e.g., 'us', 'ch')
    client_user_agent?: string  // do not hash
    client_ip_address?: string  // do not hash
  }
  custom_data?: {
    currency?: string
    value?: string | number
    content_name?: string
    content_category?: string
    content_ids?: string[]
    contents?: Array<{
      id: string
      quantity: number
      item_price?: number
    }>
    num_items?: number
    status?: string
    [key: string]: any
  }
}

interface FacebookPixelPayload {
  data: FacebookPixelEvent[]
  test_event_code?: string  // For testing
}

// Send events to Facebook Pixel API
export async function sendFacebookPixelEvent(
  events: Omit<FacebookPixelEvent, 'event_time'>[],
  options: {
    userEmail?: string
    userPhone?: string
    userCountry?: string
    request?: Request
    testEventCode?: string
  } = {}
): Promise<{ success: boolean; error?: string }> {
  
  if (!FACEBOOK_PIXEL_ID || !FACEBOOK_ACCESS_TOKEN) {
    console.warn('Facebook Pixel not configured - missing PIXEL_ID or ACCESS_TOKEN')
    return { success: false, error: 'Facebook Pixel not configured' }
  }

  try {
    const clientInfo = getClientInfo(options.request)
    
    // Prepare user data
    const userData: FacebookPixelEvent['user_data'] = {
      ...clientInfo,
    }

    // Add hashed email if provided
    if (options.userEmail) {
      userData.em = [hashData(options.userEmail)]
    }

    // Add hashed phone if provided
    if (options.userPhone) {
      userData.ph = [hashData(options.userPhone)]
    }

    // Add country if provided
    if (options.userCountry) {
      userData.country = [options.userCountry.toLowerCase()]
    }

    // Prepare events with timestamp and user data
    const pixelEvents: FacebookPixelEvent[] = events.map(event => ({
      ...event,
      event_time: Math.floor(Date.now() / 1000), // Current timestamp in seconds
      user_data: userData,
      event_source_url: event.event_source_url || (typeof window !== 'undefined' ? window.location.href : undefined),
      event_id: event.event_id || `${event.event_name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }))

    const payload: FacebookPixelPayload = {
      data: pixelEvents,
    }

    // Add test event code if provided
    if (options.testEventCode) {
      payload.test_event_code = options.testEventCode
    }

    const url = `https://graph.facebook.com/${FACEBOOK_API_VERSION}/${FACEBOOK_PIXEL_ID}/events?access_token=${FACEBOOK_ACCESS_TOKEN}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Facebook Pixel API Error:', errorData)
      return { 
        success: false, 
        error: `Facebook Pixel API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}` 
      }
    }

    const result = await response.json()
    console.log('Facebook Pixel Event Sent Successfully:', result)
    
    return { success: true }

  } catch (error) {
    console.error('Facebook Pixel Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Convenience functions for specific events

export async function trackCompleteRegistration(options: {
  userEmail?: string
  userPhone?: string
  userCountry?: string
  request?: Request
  testEventCode?: string
  customData?: Record<string, any>
}) {
  return sendFacebookPixelEvent([{
    event_name: 'CompleteRegistration',
    action_source: 'website',
    custom_data: {
      currency: 'CHF',
      status: 'completed',
      ...options.customData,
    },
  }], options)
}

export async function trackViewContent(options: {
  userEmail?: string
  userPhone?: string
  userCountry?: string
  request?: Request
  testEventCode?: string
  contentName?: string
  contentCategory?: string
  customData?: Record<string, any>
}) {
  return sendFacebookPixelEvent([{
    event_name: 'ViewContent',
    action_source: 'website',
    custom_data: {
      content_name: options.contentName,
      content_category: options.contentCategory || 'questionnaire',
      ...options.customData,
    },
  }], options)
}

export async function trackContact(options: {
  userEmail?: string
  userPhone?: string
  userCountry?: string
  request?: Request
  testEventCode?: string
  customData?: Record<string, any>
}) {
  return sendFacebookPixelEvent([{
    event_name: 'Contact',
    action_source: 'website',
    custom_data: {
      ...options.customData,
    },
  }], options)
}

export async function trackInitiateCheckout(options: {
  userEmail?: string
  userPhone?: string
  userCountry?: string
  request?: Request
  testEventCode?: string
  currency?: string
  value?: number
  customData?: Record<string, any>
}) {
  return sendFacebookPixelEvent([{
    event_name: 'InitiateCheckout',
    action_source: 'website',
    custom_data: {
      currency: options.currency || 'CHF',
      value: options.value,
      ...options.customData,
    },
  }], options)
}
