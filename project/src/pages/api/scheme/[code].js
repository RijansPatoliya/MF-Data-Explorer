import { getSchemeDetails } from '../../../lib/api';

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

  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Scheme code is required' });
  }

  try {
    const details = await getSchemeDetails(code);
    res.status(200).json(details);
  } catch (error) {
    console.error('Error fetching scheme details:', error);
    res.status(500).json({ 
      message: 'Failed to fetch scheme details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}