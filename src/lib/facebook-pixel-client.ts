'use client'

// Client-side Facebook Pixel tracking utility
interface FacebookPixelTrackingOptions {
  userEmail?: string
  userPhone?: string
  userCountry?: string
  customData?: Record<string, any>
  testEventCode?: string
}

class FacebookPixelTracker {
  private static instance: FacebookPixelTracker
  private isEnabled: boolean = false

  constructor() {
    // Check if Facebook Pixel is configured
    this.isEnabled = !!(
      process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID &&
      typeof window !== 'undefined'
    )
  }

  static getInstance(): FacebookPixelTracker {
    if (!FacebookPixelTracker.instance) {
      FacebookPixelTracker.instance = new FacebookPixelTracker()
    }
    return FacebookPixelTracker.instance
  }

  private async sendEvent(eventType: string, options: FacebookPixelTrackingOptions = {}) {
    if (!this.isEnabled) {
      console.log('Facebook Pixel tracking disabled or not configured')
      return { success: false, error: 'Facebook Pixel not configured' }
    }

    try {
      const response = await fetch('/api/facebook-pixel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          ...options,
        }),
      })

      const result = await response.json()
      
      if (!result.success) {
        console.error('Facebook Pixel Event Failed:', result.error)
      } else {
        console.log(`Facebook Pixel Event Sent: ${eventType}`)
      }

      return result
    } catch (error) {
      console.error('Facebook Pixel Tracking Error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Track questionnaire completion
  async trackQuestionnaireCompletion(options: FacebookPixelTrackingOptions = {}) {
    return this.sendEvent('CompleteRegistration', {
      ...options,
      customData: {
        content_name: 'Follow-up Questionnaire Completed',
        content_category: 'questionnaire',
        status: 'completed',
        ...options.customData,
      },
    })
  }

  // Track questionnaire page view
  async trackQuestionnaireView(step: number, options: FacebookPixelTrackingOptions = {}) {
    return this.sendEvent('ViewContent', {
      ...options,
      customData: {
        content_name: `Follow-up Questionnaire - Step ${step}`,
        content_category: 'questionnaire',
        questionnaire_step: step,
        ...options.customData,
      },
    })
  }

  // Track when user interacts with form (contact event)
  async trackFormInteraction(action: string, options: FacebookPixelTrackingOptions = {}) {
    return this.sendEvent('Contact', {
      ...options,
      customData: {
        content_name: 'Follow-up Questionnaire Form Interaction',
        content_category: 'questionnaire',
        interaction_type: action,
        ...options.customData,
      },
    })
  }

  // Track file upload
  async trackFileUpload(fileCount: number, options: FacebookPixelTrackingOptions = {}) {
    return this.sendEvent('Contact', {
      ...options,
      customData: {
        content_name: 'Follow-up Questionnaire File Upload',
        content_category: 'questionnaire',
        interaction_type: 'file_upload',
        file_count: fileCount,
        ...options.customData,
      },
    })
  }

  // Track step navigation
  async trackStepNavigation(fromStep: number, toStep: number, options: FacebookPixelTrackingOptions = {}) {
    return this.sendEvent('ViewContent', {
      ...options,
      customData: {
        content_name: `Follow-up Questionnaire - Step ${toStep}`,
        content_category: 'questionnaire',
        previous_step: fromStep,
        current_step: toStep,
        navigation_direction: toStep > fromStep ? 'forward' : 'backward',
        ...options.customData,
      },
    })
  }

  // Track form validation errors
  async trackFormErrors(errors: string[], step: number, options: FacebookPixelTrackingOptions = {}) {
    return this.sendEvent('Contact', {
      ...options,
      customData: {
        content_name: 'Follow-up Questionnaire Form Errors',
        content_category: 'questionnaire',
        interaction_type: 'form_error',
        current_step: step,
        error_fields: errors,
        error_count: errors.length,
        ...options.customData,
      },
    })
  }
}

// Export singleton instance
export const facebookPixel = FacebookPixelTracker.getInstance()

// Export individual tracking functions for convenience
export const trackQuestionnaireCompletion = (options?: FacebookPixelTrackingOptions) => 
  facebookPixel.trackQuestionnaireCompletion(options)

export const trackQuestionnaireView = (step: number, options?: FacebookPixelTrackingOptions) => 
  facebookPixel.trackQuestionnaireView(step, options)

export const trackFormInteraction = (action: string, options?: FacebookPixelTrackingOptions) => 
  facebookPixel.trackFormInteraction(action, options)

export const trackFileUpload = (fileCount: number, options?: FacebookPixelTrackingOptions) => 
  facebookPixel.trackFileUpload(fileCount, options)

export const trackStepNavigation = (fromStep: number, toStep: number, options?: FacebookPixelTrackingOptions) => 
  facebookPixel.trackStepNavigation(fromStep, toStep, options)

export const trackFormErrors = (errors: string[], step: number, options?: FacebookPixelTrackingOptions) => 
  facebookPixel.trackFormErrors(errors, step, options)
