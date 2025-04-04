// api/health.js - Vercel serverless function for health check
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
  
    // Return simple health check response
    res.status(200).json({ 
      status: "OK", 
      message: "API server is running", 
      timestamp: new Date().toISOString() 
    });
  }