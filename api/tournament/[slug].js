export default function handler(req, res) {
  const { slug } = req.query;
  
  if (slug === 'test-tournament') {
    res.status(200).json({
      result: {
        data: {
          slug: 'test-tournament',
          name: 'Test Beer Olympics',
          date: '2024-06-15',
          ownerId: 'user-123',
          isOpen: true,
          createdAt: '2024-06-01T00:00:00Z'
        }
      }
    });
  } else {
    res.status(404).json({ 
      error: { message: 'Tournament not found' } 
    });
  }
}