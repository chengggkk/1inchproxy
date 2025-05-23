const axios = require('axios');

// 1inch Fusion+ API configuration
const ONE_INCH_API_BASE = 'https://api.1inch.dev/fusion-plus';

// Middleware to handle CORS and proxy requests
module.exports = async (req, res) => {
    // Set CORS headers for all responses
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Extract API key from headers or query
    const apiKey = req.headers.authorization?.replace('Bearer ', '') || req.query.apiKey;
    
    // Validate API key
    if (!apiKey) {
        return res.status(401).json({ error: 'Missing 1inch Developer Portal API Key' });
    }

    try {
        // Prepare query parameters
        const { 
            srcChain, 
            dstChain, 
            srcTokenAddress, 
            dstTokenAddress, 
            amount, 
            walletAddress, 
            enableEstimate 
        } = req.query;

        // Log the incoming request parameters for debugging
        console.log('Incoming request params:', {
            srcChain, 
            dstChain, 
            srcTokenAddress, 
            dstTokenAddress, 
            amount, 
            walletAddress,
            enableEstimate
        });

        // Construct 1inch API URL
        const quoteUrl = `${ONE_INCH_API_BASE}/quote`;

        // Make request to 1inch API
        const response = await axios.get(quoteUrl, {
            params: {
                srcChain,
                dstChain,
                srcTokenAddress,
                dstTokenAddress,
                amount,
                walletAddress,
                enableEstimate
            },
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Return the response with CORS headers
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Proxy error:', error);

        // Handle specific error scenarios
        if (error.response) {
            // The request was made and the server responded with a status code
            return res.status(error.response.status).json({
                error: error.response.data,
                status: error.response.status
            });
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(500).json({
                error: 'No response received from 1inch API',
                details: error.message
            });
        } else {
            // Something happened in setting up the request
            return res.status(500).json({
                error: 'Error setting up the request',
                details: error.message
            });
        }
    }
};