// api/tokens.js - Vercel serverless function for token addresses
export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
  
    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
  
    // Common token addresses on Ethereum
    const tokens = {
      "ETH": "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      "USDC": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "USDT": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "DAI": "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "WBTC": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "UNI": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      "LINK": "0x514910771AF9Ca656af840dff83E8264EcF986CA"
    };
    
    // Return the token addresses
    res.status(200).json(tokens);
  }