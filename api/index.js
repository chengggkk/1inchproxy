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
    const { address, chainId = '1', limit = 100, offset = 0 } = req.query;
    
    // Validate required parameters
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
        chainId,
        limit: Math.min(Number(limit), 1000), // Limit max to 1000
        offset: Number(offset)
      }
    });
    
    // Log the raw response for debugging
    console.log('Raw 1inch API response:', JSON.stringify(response.data, null, 2));

    // Safely process the response
    return res.status(200).json({
      total: response.data?.total || 0,
      limit: response.data?.limit || 0,
      offset: response.data?.offset || 0,
      events: Array.isArray(response.data?.events) 
        ? response.data.events.map(event => ({
            type: event.type || 'Unknown',
            txHash: event.txHash || '',
            timestamp: event.timestamp || null,
            protocolName: event.protocolName || 'Unknown',
            fromAddress: event.fromAddress || '',
            toAddress: event.toAddress || '',
            tokenAmounts: event.tokenAmounts || [],
          }))
        : []
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", JSON.stringify(error.response.data, null, 2));
    }
    
    // Return detailed error information
    return res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch transaction history", 
      details: error.response?.data || error.message,
      rawError: error.toString()
    });
  }
};