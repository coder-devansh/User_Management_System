import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { userAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const genderOptions = ['Male', 'Female', 'Other'];
const statusOptions = ['Active', 'Inactive'];

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: null,
  gender: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  },
  status: 'Active',
};

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  useEffect(() => {
    if (isEditMode) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userAPI.getUserById(id);
      const userData = response.data;
      reset({
        ...userData,
        dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : null,
      });
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const formData = {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? data.dateOfBirth.toISOString()
          : null,
      };

      if (isEditMode) {
        await userAPI.updateUser(id, formData);
        showSuccess('User updated successfully');
      } else {
        await userAPI.createUser(formData);
        showSuccess('User created successfully');
      }

      navigate('/users');
    } catch (err) {
      showError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading user data..." />;
  }

  if (error && isEditMode) {
    return <ErrorDisplay message={error} onRetry={fetchUser} />;
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/users')} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {isEditMode ? 'Edit User' : 'Add New User'}
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h6" gutterBottom color="primary">
              Personal Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{
                    required: 'First name is required',
                    maxLength: {
                      value: 50,
                      message: 'First name cannot exceed 50 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{
                    required: 'Last name is required',
                    maxLength: {
                      value: 50,
                      message: 'Last name cannot exceed 50 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Phone Number"
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      inputProps={{ maxLength: 10 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  rules={{ required: 'Date of birth is required' }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Date of Birth"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.dateOfBirth,
                          helperText: errors.dateOfBirth?.message,
                        },
                      }}
                      maxDate={dayjs()}
                      disableFuture
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: 'Gender is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.gender}>
                      <InputLabel>Gender</InputLabel>
                      <Select {...field} label="Gender">
                        {genderOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.gender && (
                        <FormHelperText>{errors.gender.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4 }}>
              Address Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="address.street"
                  control={control}
                  rules={{
                    maxLength: {
                      value: 100,
                      message: 'Street address cannot exceed 100 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Street Address"
                      fullWidth
                      error={!!errors.address?.street}
                      helperText={errors.address?.street?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="address.city"
                  control={control}
                  rules={{
                    required: 'City is required',
                    maxLength: {
                      value: 50,
                      message: 'City name cannot exceed 50 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City"
                      fullWidth
                      error={!!errors.address?.city}
                      helperText={errors.address?.city?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="address.state"
                  control={control}
                  rules={{
                    required: 'State is required',
                    maxLength: {
                      value: 50,
                      message: 'State name cannot exceed 50 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="State"
                      fullWidth
                      error={!!errors.address?.state}
                      helperText={errors.address?.state?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="address.zipCode"
                  control={control}
                  rules={{
                    required: 'Zip code is required',
                    pattern: {
                      value: /^[0-9]{5,6}$/,
                      message: 'Please enter a valid 5-6 digit zip code',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zip Code"
                      fullWidth
                      error={!!errors.address?.zipCode}
                      helperText={errors.address?.zipCode?.message}
                      inputProps={{ maxLength: 6 }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="address.country"
                  control={control}
                  rules={{ required: 'Country is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Country"
                      fullWidth
                      error={!!errors.address?.country}
                      helperText={errors.address?.country?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 4 }}>
              Account Status
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select {...field} label="Status">
                        {statusOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 4 }}
            >
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/users')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={submitting}
              >
                {submitting
                  ? 'Saving...'
                  : isEditMode
                  ? 'Update User'
                  : 'Create User'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserForm;
