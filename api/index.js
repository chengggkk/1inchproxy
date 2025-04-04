// Simple serverless function for Vercel
module.exports = (req, res) => {
    res.status(200).json({
      message: "API is working!",
      query: req.query,
      timestamp: new Date().toISOString()
    });
  };