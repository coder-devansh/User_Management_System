import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Stack,
  Divider,
  IconButton,
  Avatar,
  Paper,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Cake as CakeIcon,
  Wc as GenderIcon,
  LocationOn as LocationIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { userAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';
import ConfirmDialog from '../../components/ConfirmDialog';

const InfoItem = ({ icon, label, value }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        backgroundColor: 'grey.50',
        borderRadius: 2,
        height: '100%',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: 'primary.light',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {value || '-'}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const theme = useTheme();
  const { showSuccess, showError } = useNotification();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getUserById(id);
      setUser(response.data);
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await userAPI.deleteUser(id);
      showSuccess('User deleted successfully');
      navigate('/users');
    } catch (err) {
      showError(err.message);
    } finally {
      setDeleteDialog(false);
    }
  };

  if (loading) {
    return <Loading message="Loading user details..." />;
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchUser} />;
  }

  if (!user) {
    return <ErrorDisplay message="User not found" />;
  }

  const fullName = `${user.firstName} ${user.lastName}`;
  const fullAddress = [
    user.address?.street,
    user.address?.city,
    user.address?.state,
    user.address?.zipCode,
    user.address?.country,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/users')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          User Details
        </Typography>
      </Stack>

      {/* User Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={3}
            alignItems={{ xs: 'center', sm: 'flex-start' }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'primary.main',
                fontSize: '3rem',
              }}
            >
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </Avatar>

            <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h4" gutterBottom>
                {fullName}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                justifyContent={{ xs: 'center', sm: 'flex-start' }}
                sx={{ mt: 1 }}
              >
                <Chip
                  label={user.status}
                  color={user.status === 'Active' ? 'success' : 'default'}
                  variant="filled"
                />
                <Chip label={user.gender} variant="outlined" />
              </Stack>
            </Box>

            <Stack
              direction={{ xs: 'row', sm: 'column' }}
              spacing={1}
              sx={{ alignSelf: { sm: 'flex-start' } }}
            >
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/users/edit/${id}`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialog(true)}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Personal Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <InfoItem
                icon={<PersonIcon />}
                label="First Name"
                value={user.firstName}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoItem
                icon={<PersonIcon />}
                label="Last Name"
                value={user.lastName}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoItem
                icon={<EmailIcon />}
                label="Email Address"
                value={user.email}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoItem
                icon={<PhoneIcon />}
                label="Phone Number"
                value={user.phone}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoItem
                icon={<CakeIcon />}
                label="Date of Birth"
                value={
                  user.dateOfBirth
                    ? dayjs(user.dateOfBirth).format('MMMM D, YYYY')
                    : '-'
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoItem
                icon={<GenderIcon />}
                label="Gender"
                value={user.gender}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Address Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <InfoItem
                icon={<LocationIcon />}
                label="Full Address"
                value={fullAddress}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <InfoItem
                icon={<LocationIcon />}
                label="Street"
                value={user.address?.street}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <InfoItem
                icon={<LocationIcon />}
                label="City"
                value={user.address?.city}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <InfoItem
                icon={<LocationIcon />}
                label="State"
                value={user.address?.state}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <InfoItem
                icon={<LocationIcon />}
                label="Zip Code"
                value={user.address?.zipCode}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Account Information
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <InfoItem
                icon={<CalendarIcon />}
                label="Created At"
                value={
                  user.createdAt
                    ? dayjs(user.createdAt).format('MMMM D, YYYY h:mm A')
                    : '-'
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <InfoItem
                icon={<CalendarIcon />}
                label="Last Updated"
                value={
                  user.updatedAt
                    ? dayjs(user.updatedAt).format('MMMM D, YYYY h:mm A')
                    : '-'
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  backgroundColor: 'grey.50',
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor:
                        user.status === 'Active'
                          ? 'success.main'
                          : 'grey.500',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PersonIcon />
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Account Status
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      <Chip
                        label={user.status}
                        size="small"
                        color={user.status === 'Active' ? 'success' : 'default'}
                      />
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog}
        title="Delete User"
        message={`Are you sure you want to delete "${fullName}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(false)}
        confirmText="Delete"
        severity="error"
      />
    </Box>
  );
};

export default UserDetails;
