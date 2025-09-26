import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Container,
  Paper,
  Chip,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  AccountBalanceWallet, 
  Calculate, 
  Timeline,
  MonetizationOn,
  Assessment
} from '@mui/icons-material';
import { useRouter } from 'next/router';

const features = [
  {
    icon: <TrendingUp sx={{ fontSize: 40 }} />,
    title: 'Market Analysis',
    description: 'Deep insights into mutual fund performance with advanced analytics',
    color: '#4CAF50'
  },
  {
    icon: <AccountBalanceWallet sx={{ fontSize: 40 }} />,
    title: 'SIP Calculator',
    description: 'Calculate systematic investment returns with historical data',
    color: '#2196F3'
  },
  {
    icon: <Calculate sx={{ fontSize: 40 }} />,
    title: 'Lumpsum Calculator',
    description: 'Compare one-time investments with SIP strategies',
    color: '#FF9800'
  },
  {
    icon: <Timeline sx={{ fontSize: 40 }} />,
    title: 'Performance Charts',
    description: 'Interactive visualizations of NAV trends and returns',
    color: '#9C27B0'
  },
  {
    icon: <MonetizationOn sx={{ fontSize: 40 }} />,
    title: 'SWP Planning',
    description: 'Systematic Withdrawal Plan calculator for retirement planning',
    color: '#F44336'
  },
  {
    icon: <Assessment sx={{ fontSize: 40 }} />,
    title: 'Portfolio Analysis',
    description: 'Comprehensive analysis tools for investment decisions',
    color: '#795548'
  }
];

export default function Home() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Paper 
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          px: 4,
          mb: 6,
          borderRadius: 2
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom align="center" fontWeight="bold">
            Smart Mutual Fund Explorer
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 4, opacity: 0.9 }}>
            Make informed investment decisions with our comprehensive analysis tools
          </Typography>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => router.push('/funds')}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                px: 4,
                py: 1.5
              }}
            >
              Explore Funds
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ 
                borderColor: 'rgba(255,255,255,0.5)', 
                color: 'white',
                '&:hover': { 
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)' 
                },
                px: 4,
                py: 1.5
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
          Powerful Features
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    mb={2}
                    sx={{ color: feature.color }}
                  >
                    {feature.icon}
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Stats Section */}
        <Box sx={{ mt: 8, mb: 6 }}>
          <Paper sx={{ p: 4, backgroundColor: '#f8f9fa' }}>
            <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
              Why Choose Our Platform?
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    5000+
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Mutual Funds
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    Real-time
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    NAV Updates
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    Advanced
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Analytics
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    Free
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Always
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* CTA Section */}
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Ready to Start Investing?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Explore thousands of mutual funds and make data-driven investment decisions
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => router.push('/funds')}
            sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
          >
            Get Started Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
}