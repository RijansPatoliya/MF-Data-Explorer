import axios from 'axios';
import cache from './cache';

const BASE_URL = 'https://api.mfapi.in/mf';

// Configure axios for Vercel
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAllSchemes = async () => {
  const cacheKey = 'all_schemes';
  let schemes = cache.get(cacheKey);
  
  if (!schemes) {
    try {
      const response = await apiClient.get(BASE_URL);
      schemes = response.data;
      cache.set(cacheKey, schemes);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      throw new Error('Failed to fetch mutual fund schemes');
    }
  }
  
  return schemes;
};

export const getSchemeDetails = async (code) => {
  const cacheKey = `scheme_${code}`;
  let details = cache.get(cacheKey);
  
  if (!details) {
    try {
      const response = await apiClient.get(`${BASE_URL}/${code}`);
      details = response.data;
      cache.set(cacheKey, details);
    } catch (error) {
      console.error('Error fetching scheme details:', error);
      throw new Error(`Failed to fetch details for scheme ${code}`);
    }
  }
  
  return details;
};

export const calculateReturns = (navData, period) => {
  if (!navData || navData.length === 0) return null;
  
  const today = new Date();
  let startDate;
  
  switch (period) {
    case '1m':
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      break;
    case '3m':
      startDate = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      break;
    case '6m':
      startDate = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
      break;
    case '1y':
      startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      break;
    default:
      return null;
  }
  
  const endData = navData[0];
  const startData = navData.find(item => new Date(item.date) <= startDate) || navData[navData.length - 1];
  
  if (!startData || !endData) return null;
  
  const startNAV = parseFloat(startData.nav);
  const endNAV = parseFloat(endData.nav);
  const simpleReturn = ((endNAV - startNAV) / startNAV) * 100;
  
  const daysDiff = Math.abs(new Date(endData.date) - new Date(startData.date)) / (1000 * 60 * 60 * 24);
  const annualizedReturn = daysDiff >= 30 ? (Math.pow(endNAV / startNAV, 365 / daysDiff) - 1) * 100 : null;
  
  return {
    startDate: startData.date,
    endDate: endData.date,
    startNAV,
    endNAV,
    simpleReturn: parseFloat(simpleReturn.toFixed(2)),
    annualizedReturn: annualizedReturn ? parseFloat(annualizedReturn.toFixed(2)) : null
  };
};

export const calculateSIP = (navData, amount, frequency, fromDate, toDate) => {
  if (!navData || navData.length === 0) return null;
  
  const start = new Date(fromDate);
  const end = new Date(toDate);
  let totalUnits = 0;
  let totalInvested = 0;
  const investments = [];
  
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    const navEntry = navData.find(item => {
      const itemDate = new Date(item.date);
      return itemDate <= currentDate;
    });
    
    if (navEntry && parseFloat(navEntry.nav) > 0) {
      const nav = parseFloat(navEntry.nav);
      const units = amount / nav;
      totalUnits += units;
      totalInvested += amount;
      
      investments.push({
        date: currentDate.toISOString().split('T')[0],
        nav,
        units,
        amount
      });
    }
    
    // Move to next SIP date based on frequency
    if (frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (frequency === 'quarterly') {
      currentDate.setMonth(currentDate.getMonth() + 3);
    }
  }
  
  const latestNAV = parseFloat(navData[0].nav);
  const currentValue = totalUnits * latestNAV;
  const absoluteReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;
  
  const years = Math.abs(end - start) / (1000 * 60 * 60 * 24 * 365.25);
  const annualizedReturn = years > 0 && totalInvested > 0 
    ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100 
    : 0;
  
  return {
    totalInvested,
    currentValue,
    totalUnits,
    absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
    annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
    investments
  };
};