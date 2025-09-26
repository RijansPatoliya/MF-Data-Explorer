import { getAllSchemes } from '../../lib/api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const schemes = await getAllSchemes();
    res.status(200).json(schemes);
  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ message: 'Failed to fetch schemes' });
  }
}