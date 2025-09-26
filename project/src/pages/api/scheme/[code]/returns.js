import { getSchemeDetails, calculateReturns } from '../../../../lib/api';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, period, from, to } = req.query;

  try {
    const details = await getSchemeDetails(code);
    
    if (period) {
      const returns = calculateReturns(details.data, period);
      res.status(200).json(returns);
    } else if (from && to) {
      // Custom date range logic can be implemented here
      res.status(200).json({ message: 'Custom date range not implemented yet' });
    } else {
      res.status(400).json({ message: 'Either period or from/to dates required' });
    }
  } catch (error) {
    console.error('Error calculating returns:', error);
    res.status(500).json({ message: 'Failed to calculate returns' });
  }
}