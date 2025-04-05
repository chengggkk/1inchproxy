// Using CommonJS syntax which is more reliable on Vercel
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Handle both camelCase and lowercase parameter names
    const walletAddress = req.query.walletAddress || req.query.walletaddress;
    
    // Validate required parameters
    if (!walletAddress) {
      return res.status(400).json({ 
        error: "Missing required parameter. Please provide walletAddress." 
      });
    }
    
    // Build the 1inch API URL
    const apiUrl = `https://api.1inch.dev/balance/v1.2/1/balances/${walletAddress}`;
    
    // Get API key from environment variable
    const apiKey = process.env.API_AUTH_TOKEN;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: "API key not configured. Please set the API_AUTH_TOKEN environment variable." 
      });
    }

    // Make request to 1inch API
    const response = await axios.get(apiUrl, {
      headers: { 
        Authorization: `Bearer ${apiKey}`
      }
    });
    
    // Return the data
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching wallet balance data:", error.message);
    
    // Return detailed error information
    return res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch wallet balance data", 
      details: error.response?.data || error.message
    });
  }
};