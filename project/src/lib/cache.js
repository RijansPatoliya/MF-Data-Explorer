import NodeCache from 'node-cache';

// Create cache with 24-hour TTL
const cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

export default cache;