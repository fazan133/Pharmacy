import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { Block as BlockIcon, ArrowBack } from '@mui/icons-material';

export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'error.light',
              color: 'white',
              mb: 3,
            }}
          >
            <BlockIcon sx={{ fontSize: 40 }} />
          </Box>

          <Typography variant="h4" fontWeight={600} gutterBottom>
            Access Denied
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You don't have permission to access this system. Only administrators
            can use this application.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            If you believe this is an error, please contact your system
            administrator.
          </Typography>

          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/login')}
            sx={{ px: 4 }}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
