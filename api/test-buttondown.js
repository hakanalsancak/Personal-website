// Test endpoint to verify Buttondown API connection
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BUTTONDOWN_API_KEY = process.env.BUTTONDOWN_API_KEY;

  if (!BUTTONDOWN_API_KEY) {
    return res.status(500).json({ 
      error: 'API key not configured',
      hasKey: false 
    });
  }

  try {
    // Test API connection by getting subscriber count or newsletter info
    const response = await fetch('https://api.buttondown.email/v1/newsletter', {
      method: 'GET',
      headers: {
        'Authorization': `Token ${BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        status: response.status,
        error: data.detail || data.message || 'API test failed',
        hasKey: true
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Buttondown API connection successful!',
      newsletter: data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      hasKey: true
    });
  }
}
