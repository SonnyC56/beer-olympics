export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For development, return a mock OAuth URL
  // In production, you would integrate with Auth.js/NextAuth
  const redirectUrl = new URL('http://localhost:5173/auth/callback');
  redirectUrl.searchParams.set('token', 'mock-token-' + Date.now());
  redirectUrl.searchParams.set('user', JSON.stringify({
    id: 'google-user-' + Math.random().toString(36).substr(2, 9),
    email: 'player@gmail.com',
    name: 'Google User',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Date.now()
  }));
  
  return res.status(200).json({
    url: redirectUrl.toString()
  });
}