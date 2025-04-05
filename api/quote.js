const axios = require('axios');

// 1inch Fusion+ API configuration
const ONE_INCH_API_BASE = 'https://api.1inch.dev/fusion-plus';

// Middleware to handle CORS and proxy requests
module.exports = async (req, res) => {
    // CORS headers - Set for ALL responses
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Consider limiting this in production
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

    // Get API key from environment variable rather than from the request
    const apiKey = process.env.API_AUTH_TOKEN;
    
    // Validate API key
    if (!apiKey) {
        console.error('API key missing from environment variables');
        return res.status(401).json({ error: 'API key configuration error' });
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

        console.log('Proxy received request with params:', {
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
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // Add timeout to prevent hanging requests
            timeout: 10000
        });

        console.log('Successful response from 1inch API');
        
        // Return the response with CORS headers already set at the top
        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Proxy error details:', error);

        // Enhanced error logging
        if (error.response) {
            console.error('1inch API Error Response:', {
                status: error.response.status,
                headers: error.response.headers,
                data: error.response.data
            });
            
            // Return the API error response
            return res.status(error.response.status).json({
                error: 'Error from 1inch API',
                details: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from 1inch API');
            return res.status(504).json({
                error: 'Gateway Timeout',
                details: 'No response received from 1inch API'
            });
        } else {
            // Something happened in setting up the request
            console.error('Error setting up the request:', error.message);
            return res.status(500).json({
                error: 'Internal Server Error',
                details: error.message
            });
        }
    }
};