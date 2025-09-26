import { getAllSchemes } from '../../lib/api';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const schemes = await getAllSchemes();
    res.status(200).json(schemes);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ 
      message: 'Failed to fetch schemes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}