import { getSchemeDetails, calculateSIP } from '../../../../lib/api';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code } = req.query;
  const { amount, frequency, from, to } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'Scheme code is required' });
  }

  if (!amount || !frequency || !from || !to) {
    return res.status(400).json({ message: 'Missing required fields: amount, frequency, from, to' });
  }

  // Validate input types
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Amount must be a positive number' });
  }

  if (!['monthly', 'quarterly'].includes(frequency)) {
    return res.status(400).json({ message: 'Frequency must be monthly or quarterly' });
  }

  try {
    const details = await getSchemeDetails(code);
    const sipResult = calculateSIP(details.data, amount, frequency, from, to);
    
    if (!sipResult) {
      return res.status(400).json({ message: 'Unable to calculate SIP - insufficient data' });
    }
    
    res.status(200).json(sipResult);
  } catch (error) {
    console.error('Error calculating SIP:', error);
    res.status(500).json({ 
      message: 'Failed to calculate SIP',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}