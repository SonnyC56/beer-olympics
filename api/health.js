module.exports = function handler(req, res) {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Beer Olympics API is running!',
    timestamp: new Date().toISOString()
  });
};