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
    // Extract parameters from query
    const srcChain = req.query.srcChain || req.query.srcchain || '1';
    const dstChain = req.query.dstChain || req.query.dstchain || '42161';
    const srcTokenAddress = req.query.srcTokenAddress || req.query.srctokenaddress;
    const dstTokenAddress = req.query.dstTokenAddress || req.query.dsttokenaddress;
    const amount = req.query.amount;
    const walletAddress = req.query.walletAddress || req.query.walletaddress;
    const enableEstimate = req.query.enableEstimate || req.query.enableestimate || 'true';
    const source = req.query.source || 'sdk';
    
    // Validate required parameters
    if (!srcTokenAddress) {
        console.log("missing srcTokenAddress");
      }
      
      if (!dstTokenAddress) {
        console.log("missing dstTokenAddress");
      }
      
      if (!amount) {
        console.log("missing amount");
      }
      
      if (!walletAddress) {
        console.log("missing walletAddress");
      }
      
      if (!srcTokenAddress || !dstTokenAddress || !amount || !walletAddress) {
        return res.status(400).json({ 
          error: "Missing required parameters. Please provide srcTokenAddress, dstTokenAddress, amount, and walletAddress." 
        });
      }
      
    // Build the 1inch Fusion Plus API URL
    const apiUrl = `https://api.1inch.dev/fusion-plus/quoter/v1.0/quote/receive/?srcChain=${srcChain}&dstChain=${dstChain}&srcTokenAddress=${srcTokenAddress}&dstTokenAddress=${dstTokenAddress}&amount=${amount}&walletAddress=${walletAddress}&enableEstimate=${enableEstimate}&source=${source}`;
    
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
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json'
      }
    });
    
    // Return the data
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching quote data:", error.message);
    
    // Return detailed error information
    return res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch quote data", 
      details: error.response?.data || error.message
    });
  }
};