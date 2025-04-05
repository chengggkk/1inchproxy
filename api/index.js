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
    // Destructure query parameters with default values and additional optional parameters
    const { 
      address, 
      chainId = '1', 
      limit = 100, 
      offset = 0,
      tokenAddress,
      fromTimestampMs,
      toTimestampMs,
      protocolName,
      eventType,
      tokenIn,
      tokenOut,
      minAmountUsd,
      maxAmountUsd,
      sortBy = 'timestamp',
      sortDirection = 'desc'
    } = req.query;
    
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
    
    // Prepare params object with optional filtering
    const params = {
      chainId,
      limit: Math.min(Number(limit), 1000), // Limit max to 1000
      offset: Number(offset),
      sortBy,
      sortDirection
    };

    // Add optional parameters only if they are provided
    if (tokenAddress) params.tokenAddress = tokenAddress;
    if (fromTimestampMs) params.fromTimestampMs = fromTimestampMs;
    if (toTimestampMs) params.toTimestampMs = toTimestampMs;
    if (protocolName) params.protocolName = protocolName;
    if (eventType) params.eventType = eventType;
    if (tokenIn) params.tokenIn = tokenIn;
    if (tokenOut) params.tokenOut = tokenOut;
    if (minAmountUsd) params.minAmountUsd = minAmountUsd;
    if (maxAmountUsd) params.maxAmountUsd = maxAmountUsd;
    
    // Make request to 1inch API
    console.log(`Requesting transaction history for address: ${address}`);
    const response = await axios.get(apiUrl, {
      headers: { 
        Authorization: `Bearer ${apiKey}`
      },
      params
    });
    
    // Log full response for debugging
    console.log('Full API Response:', JSON.stringify(response.data, null, 2));

    // Comprehensive response handling
    const responseData = response.data || {};
    const events = Array.isArray(responseData.events) ? responseData.events : [];
    
    // Process and return the transaction history
    return res.status(200).json({
      total: responseData.total || events.length,
      limit: responseData.limit || limit,
      offset: responseData.offset || offset,
      events: events.map(event => {
        // Provide default values and handle potential undefined properties
        return {
          type: event.type || 'unknown',
          txHash: event.txHash || null,
          timestamp: event.timestamp || null,
          protocolName: event.protocolName || 'unknown',
          fromAddress: event.fromAddress || null,
          toAddress: event.toAddress || null,
          tokenAmounts: event.tokenAmounts || [],
          amountUsd: event.amountUsd || null,
          gasUsed: event.gasUsed || null,
          gasPrice: event.gasPrice || null,
          // Fallback to empty object if no additional details
          additionalDetails: event || {}
        };
      })
    });
  } catch (error) {
    console.error("Full error object:", error);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      // Return the specific error from the API if available
      return res.status(error.response.status).json({ 
        error: "Failed to fetch transaction history", 
        details: error.response.data || error.message
      });
    }
    
    // Generic error handling for network errors, etc.
    return res.status(500).json({ 
      error: "Failed to fetch transaction history", 
      details: error.message,
      stack: error.stack
    });
  }
};