import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  Chip, 
  Button,
  Paper,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, ExpandMore, TrendingUp } from '@mui/icons-material';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function Funds() {
  const [schemes, setSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundHouses, setFundHouses] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const response = await axios.get('/api/mf');
      setSchemes(response.data);
      setFilteredSchemes(response.data);
      
      // Group by fund house
      const grouped = response.data.reduce((acc, scheme) => {
        const fundHouse = scheme.fundHouse || 'Others';
        if (!acc[fundHouse]) {
          acc[fundHouse] = [];
        }
        acc[fundHouse].push(scheme);
        return acc;
      }, {});
      
      setFundHouses(grouped);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch mutual funds data');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = schemes.filter(scheme =>
        scheme.schemeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSchemes(filtered);
    } else {
      setFilteredSchemes(schemes);
    }
  }, [searchTerm, schemes]);

  const getSchemeCategory = (schemeName) => {
    if (schemeName.toLowerCase().includes('equity')) return 'Equity';
    if (schemeName.toLowerCase().includes('debt')) return 'Debt';
    if (schemeName.toLowerCase().includes('hybrid')) return 'Hybrid';
    if (schemeName.toLowerCase().includes('elss')) return 'ELSS';
    return 'Other';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Equity': '#4CAF50',
      'Debt': '#2196F3',
      'Hybrid': '#FF9800',
      'ELSS': '#9C27B0',
      'Other': '#757575'
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h3" gutterBottom fontWeight="bold" textAlign="center">
        Mutual Funds Explorer
      </Typography>
      <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
        Discover and analyze over {schemes.length} mutual fund schemes
      </Typography>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search mutual funds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {schemes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Funds
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent textAlign="center">
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {Object.keys(fundHouses).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fund Houses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent textAlign="center">
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {filteredSchemes.filter(s => s.schemeName.toLowerCase().includes('equity')).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Equity Funds
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {filteredSchemes.filter(s => s.schemeName.toLowerCase().includes('debt')).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Debt Funds
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Fund Houses Accordion */}
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>
        Browse by Fund House
      </Typography>

      {Object.entries(fundHouses).slice(0, 10).map(([fundHouse, funds], index) => (
        <Accordion key={index} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box display="flex" alignItems="center" width="100%">
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                {fundHouse}
              </Typography>
              <Chip 
                label={`${funds.length} funds`} 
                size="small" 
                color="primary"
                sx={{ mr: 2 }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {funds.slice(0, 6).map((scheme) => (
                <Grid item xs={12} md={6} key={scheme.schemeCode}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => router.push(`/scheme/${scheme.schemeCode}`)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="between" alignItems="flex-start" mb={1}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ flexGrow: 1 }}>
                          {scheme.schemeName.slice(0, 60)}...
                        </Typography>
                        <Chip 
                          label={getSchemeCategory(scheme.schemeName)}
                          size="small"
                          sx={{ 
                            backgroundColor: getCategoryColor(getSchemeCategory(scheme.schemeName)),
                            color: 'white',
                            ml: 1
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Code: {scheme.schemeCode}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {funds.length > 6 && (
                <Grid item xs={12}>
                  <Button variant="text" size="small">
                    View all {funds.length} funds
                  </Button>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Popular Funds */}
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mt: 6 }}>
        Popular Funds
      </Typography>
      
      <Grid container spacing={3}>
        {filteredSchemes.slice(0, 12).map((scheme) => (
          <Grid item xs={12} md={6} lg={4} key={scheme.schemeCode}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 8
                }
              }}
              onClick={() => router.push(`/scheme/${scheme.schemeCode}`)}
            >
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="flex-start" mb={2}>
                  <TrendingUp color="primary" />
                  <Chip 
                    label={getSchemeCategory(scheme.schemeName)}
                    size="small"
                    sx={{ 
                      backgroundColor: getCategoryColor(getSchemeCategory(scheme.schemeName)),
                      color: 'white'
                    }}
                  />
                </Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                  {scheme.schemeName.slice(0, 50)}...
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Fund House: {scheme.fundHouse || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Code: {scheme.schemeCode}
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/scheme/${scheme.schemeCode}`);
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}