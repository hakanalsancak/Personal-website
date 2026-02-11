export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  try {
    // Get API key from environment variable
    const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;

    if (!BUTTONDOWN_API_KEY) {
      console.error('Buttondown API key not configured');
      return res.status(500).json({ error: 'Subscription service not configured' });
    }

    // Subscribe to Buttondown
    const response = await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
        // Removed tags for now - can add back if needed
      })
    });

    // Parse response safely
    let data;
    const responseText = await response.text();
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error('Failed to parse Buttondown response:', responseText);
      return res.status(500).json({ 
        error: 'Invalid response from email service. Please try again.' 
      });
    }

    if (!response.ok) {
      console.error('Buttondown API error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });

      // Handle specific error cases
      if (response.status === 400) {
        // Check for email validation errors
        if (data.email) {
          const errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
          if (typeof errorMessage === 'string' && 
              (errorMessage.toLowerCase().includes('already') || 
               errorMessage.toLowerCase().includes('exists') ||
               errorMessage.toLowerCase().includes('subscribed'))) {
            return res.status(200).json({ 
              message: 'already_subscribed',
              success: true 
            });
          }
          return res.status(400).json({ 
            error: typeof errorMessage === 'string' ? errorMessage : 'Invalid email address' 
          });
        }
        
        // Generic 400 error
        return res.status(400).json({ 
          error: data.detail || data.message || 'Invalid request' 
        });
      }

      // Handle 401 Unauthorized (wrong API key)
      if (response.status === 401) {
        console.error('Buttondown API authentication failed - check API key');
        return res.status(500).json({ 
          error: 'Authentication failed. Please contact the site administrator.' 
        });
      }
      
      // Other errors
      return res.status(response.status).json({ 
        error: data.detail || data.message || `Subscription failed (${response.status})` 
      });
    }

    // Success
    return res.status(200).json({ 
      success: true,
      message: 'Successfully subscribed!' 
    });

  } catch (error) {
    console.error('Buttondown API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to process subscription. Please try again later.' 
    });
  }
}
