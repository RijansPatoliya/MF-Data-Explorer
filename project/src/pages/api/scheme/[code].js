import { getSchemeDetails } from '../../../lib/api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;

  try {
    const details = await getSchemeDetails(code);
    res.status(200).json(details);
  } catch (error) {
    console.error('Error fetching scheme details:', error);
    res.status(500).json({ message: 'Failed to fetch scheme details' });
  }
}