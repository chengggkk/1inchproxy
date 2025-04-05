// api/index.js - Vercel serverless function with corrected 1inch API endpoint
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
    const { token0, token1, period } = req.query;
    
    // Validate required parameters
    if (!token0 || !token1 || !period) {
      return res.status(400).json({ 
        error: "Missing required parameters. Please provide token0, token1, and period." 
      });
    }
    
    // Convert period to seconds for the API
    let seconds;
    switch(period) {
      case "24H":
        seconds = 3600; // 1 hour candles
        break;
      case "1W":
        seconds = 14400; // 4 hour candles
        break;
      case "1M":
        seconds = 86400; // 1 day candles
        break;
      case "1Y":
        seconds = 604800; // 1 week candles
        break;
      default:
        return res.status(400).json({
          error: "Invalid period. Must be one of: 24H, 1W, 1M, 1Y"
        });
    }

    // Build the 1inch API URL with the correct endpoint
    const apiUrl = `https://api.1inch.dev/charts/v1.0/chart/aggregated/candle/${token0}/${token1}/${seconds}/1`;
    
    // Get API key from environment variable
    const apiKey = process.env.API_AUTH_TOKEN;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: "API key not configured. Please set the API_AUTH_TOKEN environment variable." 
      });
    }

    // Make request to 1inch API
    console.log(`Requesting URL: ${apiUrl}`);
    const response = await axios.get(apiUrl, {
      headers: { 
        Authorization: `Bearer ${apiKey}`
      }
    });
    
    // Return the data
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching 1inch chart data:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    // Return detailed error information
    return res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch chart data", 
      details: error.response?.data || error.message
    });
  }
};