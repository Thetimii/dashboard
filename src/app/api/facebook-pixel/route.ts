import { NextRequest, NextResponse } from 'next/server'
import { sendFacebookPixelEvent, trackCompleteRegistration, trackViewContent, trackContact, trackInitiateCheckout } from '@/lib/facebook-pixel'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      eventType, 
      userEmail, 
      userPhone, 
      userCountry = 'ch', // Default to Switzerland
      customData = {},
      testEventCode 
    } = body

    const options = {
      userEmail,
      userPhone,
      userCountry,
      request,
      testEventCode,
      customData,
    }

    let result: { success: boolean; error?: string }

    switch (eventType) {
      case 'CompleteRegistration':
        result = await trackCompleteRegistration(options)
        break
      
      case 'ViewContent':
        result = await trackViewContent({
          ...options,
          contentName: customData.contentName || 'Follow-up Questionnaire',
          contentCategory: customData.contentCategory || 'questionnaire',
        })
        break
      
      case 'Contact':
        result = await trackContact(options)
        break
      
      case 'InitiateCheckout':
        result = await trackInitiateCheckout({
          ...options,
          currency: customData.currency || 'CHF',
          value: customData.value,
        })
        break
      
      default:
        // Generic event
        if (!body.events || !Array.isArray(body.events)) {
          return NextResponse.json(
            { success: false, error: 'Invalid event type or missing events array' },
            { status: 400 }
          )
        }
        
        result = await sendFacebookPixelEvent(body.events, options)
        break
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Facebook Pixel API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
