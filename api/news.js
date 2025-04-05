// pages/api/crypto-data/market-updates.js (renamed to avoid ad blockers)
import axios from 'axios';

export default async function handler(req, res) {
  // Extract query parameters
  const { from, q = 'Bitcoin AND Ethereum' } = req.query;
  
  // Set your API key securely on the server
  const API_KEY = process.env.NEWS_API_KEY; // Add to your environment variables
  
  // Construct the URL for NewsAPI
  const url = `https://newsapi.org/v2/everything?q=(${q})&from=${from || ''}&sortBy=publishedAt&language=en&domains=coindesk.com,cointelegraph.com,cryptoslate.com&excludeDomains=npmjs.com,github.com,medium.com&apiKey=${API_KEY}`;

  try {
    // Make the request server-side
    const response = await axios.get(url);
    
    // Return the data to the client
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error.response?.data || error.message);
    
    // Return error to client
    return res.status(error.response?.status || 500).json({
      status: 'error',
      message: error.response?.data?.message || 'Failed to fetch news data',
    });
  }
}