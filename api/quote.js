const axios = require('axios');

// 1inch Fusion+ API configuration
const ONE_INCH_API_BASE = 'https://api.1inch.dev/fusion';  // Changed from fusion-plus to fusion

// Middleware to handle CORS and proxy requests
module.exports = async (req, res) => {
    // CORS headers - Set for ALL responses
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

    // Get API key from environment variable
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

        // Log the full request details
        console.log('Proxy received request with params:', {
            srcChain, 
            dstChain, 
            srcTokenAddress, 
            dstTokenAddress, 
            amount, 
            walletAddress,
            enableEstimate,
            apiKeyPresent: !!apiKey
        });

        // Construct 1inch API URL
        const quoteUrl = `${ONE_INCH_API_BASE}/quote`;
        console.log('Making request to 1inch API URL:', quoteUrl);

        // Make request to 1inch API with full error capture
        try {
            const response = await axios.get(quoteUrl, {
                params: {
                    srcChainId: srcChain,  // Changed from srcChain to srcChainId
                    dstChainId: dstChain,  // Changed from dstChain to dstChainId
                    srcTokenAddress,
                    dstTokenAddress,
                    amount,
                    receiver: walletAddress,  // Changed from walletAddress to receiver
                    enableEstimate
                },
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            console.log('Successful response from 1inch API with status:', response.status);
            
            // Return the response with CORS headers already set at the top
            return res.status(200).json(response.data);
        } catch (axiosError) {
            // Detailed logging of the exact error from axios
            console.error('Axios error details:', {
                message: axiosError.message,
                code: axiosError.code,
                status: axiosError.response?.status,
                responseData: axiosError.response?.data,
                requestConfig: {
                    url: axiosError.config?.url,
                    method: axiosError.config?.method,
                    params: axiosError.config?.params,
                    headers: {
                        ...axiosError.config?.headers,
                        Authorization: 'Bearer [REDACTED]' // Don't log the actual token
                    }
                }
            });

            if (axiosError.response) {
                return res.status(axiosError.response.status).json({
                    error: 'Error from 1inch API',
                    details: axiosError.response.data,
                    status: axiosError.response.status
                });
            } else {
                return res.status(500).json({
                    error: 'Request to 1inch API failed',
                    details: axiosError.message
                });
            }
        }
    } catch (error) {
        console.error('General proxy error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
};