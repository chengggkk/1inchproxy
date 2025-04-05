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
    // Extract address from query parameters
    const { address } = req.query;
    
    // Validate required address parameter
    if (!address) {
      return res.status(400).json({ 
        error: "Missing required parameter. Please provide wallet address." 
      });
    }
    
    // Get API key from environment variable
    const apiKey = process.env.API_AUTH_TOKEN;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: "API key not configured. Please set the API_AUTH_TOKEN environment variable." 
      });
    }

    // Build the 1inch transaction history API URL
    const apiUrl = `https://api.1inch.dev/history/v2.0/history/${address}/events`;
    
    // Make request to 1inch API
    console.log(`Requesting transaction history for address: ${address}`);
    const response = await axios.get(apiUrl, {
      headers: { 
        Authorization: `Bearer ${apiKey}`
      },
      params: {
        chainId: 1, // Ethereum mainnet
        limit: 100 // Default limit
      }
    });
    
    // Process and return the transaction history
    return res.status(200).json({
      total: response.data.total || 0,
      items: response.data.items.map(item => ({
        id: item.id,
        type: item.type,
        details: {
          txHash: item.details.txHash,
          type: item.details.type,
          timestamp: item.details.timestamp
        }
      }))
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    // Return detailed error information
    return res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch transaction history", 
      details: error.response?.data || error.message
    });
  }
};