import { Box, Typography, Button } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

const ErrorDisplay = ({ message = 'Something went wrong', onRetry }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        gap: 2,
        textAlign: 'center',
        p: 3,
      }}
    >
      <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
      <Typography variant="h6" color="error">
        Error
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

export default ErrorDisplay;
