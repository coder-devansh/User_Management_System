import { Snackbar, Alert } from '@mui/material';
import { useNotification } from '../../context/NotificationContext';

const Notification = () => {
  const { notification, hideNotification } = useNotification();

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={5000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={hideNotification}
        severity={notification.severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
