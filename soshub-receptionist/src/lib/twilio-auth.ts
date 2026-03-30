import twilio from 'twilio'

/**
 * Validate that an incoming webhook request is actually from Twilio
 * Uses X-Twilio-Signature header verification
 */
export function validateTwilioRequest(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) {
    console.warn('[TwilioAuth] No TWILIO_AUTH_TOKEN set - skipping validation in dev')
    return true // Allow in development without token
  }

  return twilio.validateRequest(authToken, signature, url, params)
}

/**
 * Extract form-encoded body params from a Twilio webhook POST request
 */
export async function parseTwilioBody(request: Request): Promise<Record<string, string>> {
  const body = await request.text()
  const params: Record<string, string> = {}

  if (body) {
    const searchParams = new URLSearchParams(body)
    searchParams.forEach((value, key) => {
      params[key] = value
    })
  }

  return params
}
