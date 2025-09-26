import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Tab,
  Tabs
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import axios from 'axios';
import { format } from 'date-fns';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SchemeDetail() {
  const router = useRouter();
  const { code } = router.query;
  const [schemeData, setSchemeData] = useState(null);
  const [returns, setReturns] = useState({});
  const [sipResult, setSipResult] = useState(null);
  const [lumpsumResult, setLumpsumResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // SIP Form State
  const [sipAmount, setSipAmount] = useState(5000);
  const [sipFrequency, setSipFrequency] = useState('monthly');
  const [sipStartDate, setSipStartDate] = useState('2020-01-01');
  const [sipEndDate, setSipEndDate] = useState('2023-12-31');
  
  // Lumpsum Form State
  const [lumpsumAmount, setLumpsumAmount] = useState(100000);
  const [lumpsumStartDate, setLumpsumStartDate] = useState('2020-01-01');
  const [lumpsumEndDate, setLumpsumEndDate] = useState('2023-12-31');

  useEffect(() => {
    if (code) {
      fetchSchemeData();
      fetchReturns();
    }
  }, [code]);

  const fetchSchemeData = async () => {
    try {
      const response = await axios.get(`/api/scheme/${code}`);
      setSchemeData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch scheme data');
      setLoading(false);
    }
  };

  const fetchReturns = async () => {
    const periods = ['1m', '3m', '6m', '1y'];
    const returnsData = {};
    
    for (const period of periods) {
      try {
        const response = await axios.get(`/api/scheme/${code}/returns?period=${period}`);
        returnsData[period] = response.data;
      } catch (err) {
        console.error(`Failed to fetch ${period} returns:`, err);
      }
    }
    
    setReturns(returnsData);
  };

  const calculateSIP = async () => {
    try {
      const response = await axios.post(`/api/scheme/${code}/sip`, {
        amount: sipAmount,
        frequency: sipFrequency,
        from: sipStartDate,
        to: sipEndDate
      });
      setSipResult(response.data);
    } catch (err) {
      console.error('Failed to calculate SIP:', err);
    }
  };

  const calculateLumpsum = () => {
    if (schemeData && schemeData.data.length > 0) {
      const startEntry = schemeData.data.find(item => item.date <= lumpsumStartDate) || schemeData.data[schemeData.data.length - 1];
      const endEntry = schemeData.data[0];
      
      const startNAV = parseFloat(startEntry.nav);
      const endNAV = parseFloat(endEntry.nav);
      const units = lumpsumAmount / startNAV;
      const currentValue = units * endNAV;
      const absoluteReturn = ((currentValue - lumpsumAmount) / lumpsumAmount) * 100;
      
      const startDate = new Date(startEntry.date);
      const endDate = new Date(endEntry.date);
      const years = Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
      const annualizedReturn = (Math.pow(currentValue / lumpsumAmount, 1 / years) - 1) * 100;
      
      setLumpsumResult({
        totalInvested: lumpsumAmount,
        currentValue,
        units,
        absoluteReturn,
        annualizedReturn,
        startNAV,
        endNAV
      });
    }
  };

  const prepareChartData = () => {
    if (!schemeData || !schemeData.data) return [];
    
    return schemeData.data
      .slice(-365) // Last 1 year
      .filter(item => item.date && !isNaN(new Date(item.date).getTime()))
      .reverse()
      .map(item => ({
        date: format(new Date(item.date), 'MMM dd'),
        nav: parseFloat(item.nav)
      }));
  };

  const prepareSIPGrowthData = () => {
    if (!sipResult || !sipResult.investments) return [];
    
    let cumulativeValue = 0;
    let cumulativeInvested = 0;
    
    return sipResult.investments.map(investment => {
      cumulativeInvested += investment.amount;
      cumulativeValue = cumulativeInvested * (investment.nav / sipResult.investments[0].nav);
      
      return {
        date: investment.date && !isNaN(new Date(investment.date).getTime()) 
          ? format(new Date(investment.date), 'MMM yyyy') 
          : 'Invalid Date',
        invested: cumulativeInvested,
        value: cumulativeValue
      };
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, 'dd MMM yyyy');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !schemeData) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error || 'Scheme not found'}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {schemeData.meta.scheme_name}
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Chip label={`Fund House: ${schemeData.meta.fund_house}`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Grid>
          <Grid item>
            <Chip label={`Scheme Code: ${schemeData.meta.scheme_code}`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Grid>
          <Grid item>
            <Chip label={`Category: ${schemeData.meta.scheme_category}`} sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Grid>
        </Grid>
      </Paper>

      {/* Current NAV */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                ₹{schemeData.data[0]?.nav}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current NAV
              </Typography>
              <Typography variant="caption" color="text.secondary">
                As of {formatDate(schemeData.data[0]?.date)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Returns Cards */}
        {Object.entries(returns).map(([period, data]) => (
          data && (
            <Grid item xs={12} md={2.25} key={period}>
              <Card>
                <CardContent textAlign="center">
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    color={data.simpleReturn >= 0 ? 'success.main' : 'error.main'}
                  >
                    {data.simpleReturn}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {period.toUpperCase()} Returns
                  </Typography>
                  {data.annualizedReturn && (
                    <Typography variant="caption" color="text.secondary">
                      Ann: {data.annualizedReturn}%
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )
        ))}
      </Grid>

      {/* NAV Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          NAV Trend (Last 1 Year)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={prepareChartData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => [`₹${value}`, 'NAV']} />
            <Line type="monotone" dataKey="nav" stroke="#1976d2" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Tabs for Different Calculators */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="SIP Calculator" />
          <Tab label="Lumpsum Calculator" />
          <Tab label="Fund Details" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    SIP Calculator
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="SIP Amount (₹)"
                      type="number"
                      value={sipAmount}
                      onChange={(e) => setSipAmount(Number(e.target.value))}
                      fullWidth
                    />
                    <TextField
                      label="Frequency"
                      select
                      value={sipFrequency}
                      onChange={(e) => setSipFrequency(e.target.value)}
                      fullWidth
                    >
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="quarterly">Quarterly</MenuItem>
                    </TextField>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={sipStartDate}
                      onChange={(e) => setSipStartDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={sipEndDate}
                      onChange={(e) => setSipEndDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={calculateSIP}
                      fullWidth
                      size="large"
                    >
                      Calculate SIP Returns
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              {sipResult && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      SIP Results
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="primary" fontWeight="bold">
                            ₹{sipResult.totalInvested.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Invested
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="success.main" fontWeight="bold">
                            ₹{sipResult.currentValue.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current Value
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography 
                            variant="h5" 
                            fontWeight="bold"
                            color={sipResult.absoluteReturn >= 0 ? 'success.main' : 'error.main'}
                          >
                            {sipResult.absoluteReturn}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Absolute Return
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography 
                            variant="h5" 
                            fontWeight="bold"
                            color={sipResult.annualizedReturn >= 0 ? 'success.main' : 'error.main'}
                          >
                            {sipResult.annualizedReturn}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Annualized Return
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* SIP Growth Chart */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Investment Growth
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={prepareSIPGrowthData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                          <Area type="monotone" dataKey="invested" stackId="1" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                          <Area type="monotone" dataKey="value" stackId="2" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Lumpsum Calculator
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Investment Amount (₹)"
                      type="number"
                      value={lumpsumAmount}
                      onChange={(e) => setLumpsumAmount(Number(e.target.value))}
                      fullWidth
                    />
                    <TextField
                      label="Investment Date"
                      type="date"
                      value={lumpsumStartDate}
                      onChange={(e) => setLumpsumStartDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={lumpsumEndDate}
                      onChange={(e) => setLumpsumEndDate(e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <Button 
                      variant="contained" 
                      onClick={calculateLumpsum}
                      fullWidth
                      size="large"
                    >
                      Calculate Lumpsum Returns
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              {lumpsumResult && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Lumpsum Results
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="primary" fontWeight="bold">
                            ₹{lumpsumResult.totalInvested.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Invested Amount
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography variant="h5" color="success.main" fontWeight="bold">
                            ₹{lumpsumResult.currentValue.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current Value
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography 
                            variant="h5" 
                            fontWeight="bold"
                            color={lumpsumResult.absoluteReturn >= 0 ? 'success.main' : 'error.main'}
                          >
                            {lumpsumResult.absoluteReturn.toFixed(2)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Absolute Return
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <Typography 
                            variant="h5" 
                            fontWeight="bold"
                            color={lumpsumResult.annualizedReturn >= 0 ? 'success.main' : 'error.main'}
                          >
                            {lumpsumResult.annualizedReturn.toFixed(2)}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Annualized Return
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Fund Information
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Fund House:</Typography>
                      <Typography variant="body2" fontWeight="bold">{schemeData.meta.fund_house}</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Scheme Category:</Typography>
                      <Typography variant="body2" fontWeight="bold">{schemeData.meta.scheme_category}</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Scheme Code:</Typography>
                      <Typography variant="body2" fontWeight="bold">{schemeData.meta.scheme_code}</Typography>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Scheme Type:</Typography>
                      <Typography variant="body2" fontWeight="bold">{schemeData.meta.scheme_type}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Recent NAV History
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell align="right">NAV (₹)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {schemeData.data.slice(0, 10).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{formatDate(row.date)}</TableCell>
                            <TableCell align="right">₹{row.nav}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
}