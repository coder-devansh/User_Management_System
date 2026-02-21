import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
}) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: severity === 'warning' ? 'warning.main' : 'error.main',
        }}
      >
        <WarningIcon />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity === 'warning' ? 'warning' : 'error'}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
