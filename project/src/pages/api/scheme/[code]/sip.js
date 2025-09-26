import { getSchemeDetails, calculateSIP } from '../../../../lib/api';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;
  const { amount, frequency, from, to } = req.body;

  if (!amount || !frequency || !from || !to) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const details = await getSchemeDetails(code);
    const sipResult = calculateSIP(details.data, amount, frequency, from, to);
    
    if (!sipResult) {
      return res.status(400).json({ message: 'Unable to calculate SIP' });
    }
    
    res.status(200).json(sipResult);
  } catch (error) {
    console.error('Error calculating SIP:', error);
    res.status(500).json({ message: 'Failed to calculate SIP' });
  }
}