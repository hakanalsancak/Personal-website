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
        email: email,
        tags: ['website-subscription']
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 400 && data.email) {
        // Check if email is already subscribed
        const errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        if (errorMessage.includes('already') || errorMessage.includes('exists')) {
          return res.status(200).json({ 
            message: 'already_subscribed',
            success: true 
          });
        }
        return res.status(400).json({ error: errorMessage });
      }
      
      return res.status(response.status).json({ 
        error: data.detail || data.message || 'Subscription failed' 
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
      error: 'Failed to process subscription. Please try again later.' 
    });
  }
}
