import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  SaveAlt as SaveAltIcon,
  Bookmark as BookmarkIcon,
  DeleteSweep as DeleteSweepIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { userAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../../components/ConfirmDialog';
import Loading from '../../components/Loading';
import ErrorDisplay from '../../components/ErrorDisplay';

const UserList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccess, showError, showInfo } = useNotification();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    totalRows: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [presetName, setPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortModel, setSortModel] = useState([
    { field: 'createdAt', sort: 'desc' },
  ]);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    userId: null,
    userName: '',
  });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  const PRESET_KEY = 'userListPresets';

  const loadPresets = useCallback(() => {
    try {
      const stored = localStorage.getItem(PRESET_KEY);
      if (stored) {
        setSavedPresets(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load presets', err);
    }
  }, []);

  const persistPresets = (presets) => {
    setSavedPresets(presets);
    localStorage.setItem(PRESET_KEY, JSON.stringify(presets));
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: pagination.page + 1,
        limit: pagination.pageSize,
        query: searchQuery,
        status: statusFilter,
        gender: genderFilter,
        sortField: sortModel[0]?.field || 'createdAt',
        sortOrder: sortModel[0]?.sort || 'desc',
      };

      const response = searchQuery || statusFilter !== 'all' || genderFilter !== 'all'
        ? await userAPI.searchUsers(params)
        : await userAPI.getUsers(
            params.page,
            params.limit,
            params.sortField,
            params.sortOrder
          );

      setUsers(response.data);
      setPagination((prev) => ({
        ...prev,
        totalRows: response.pagination.totalUsers,
      }));
      setSelectedIds([]);
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.pageSize,
    searchQuery,
    statusFilter,
    genderFilter,
    sortModel,
    showError,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) {
      showError('Please enter a preset name');
      return;
    }

    const presetPayload = {
      id: Date.now(),
      name,
      searchQuery,
      statusFilter,
      genderFilter,
      pageSize: pagination.pageSize,
      sortField: sortModel[0]?.field || 'createdAt',
      sortOrder: sortModel[0]?.sort || 'desc',
    };

    const existingIndex = savedPresets.findIndex(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );

    let updatedPresets = [];
    if (existingIndex >= 0) {
      updatedPresets = [...savedPresets];
      updatedPresets[existingIndex] = presetPayload;
      showInfo(`Preset "${name}" updated`);
    } else {
      updatedPresets = [...savedPresets, presetPayload];
      showSuccess(`Preset "${name}" saved`);
    }

    persistPresets(updatedPresets);
    setPresetName('');
  };

  const handleApplyPreset = (preset) => {
    setSearchQuery(preset.searchQuery || '');
    setStatusFilter(preset.statusFilter || 'all');
    setGenderFilter(preset.genderFilter || 'all');
    setPagination((prev) => ({
      ...prev,
      page: 0,
      pageSize: preset.pageSize || prev.pageSize,
    }));
    if (preset.sortField && preset.sortOrder) {
      setSortModel([{ field: preset.sortField, sort: preset.sortOrder }]);
    }
    showInfo(`Applied preset "${preset.name}"`);
  };

  const handleDeletePreset = (id) => {
    const filtered = savedPresets.filter((p) => p.id !== id);
    persistPresets(filtered);
  };

  const handleDeleteClick = (userId, userName) => {
    setDeleteDialog({
      open: true,
      userId,
      userName,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await userAPI.deleteUser(deleteDialog.userId);
      showSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeleteDialog({ open: false, userId: null, userName: '' });
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      await userAPI.deleteUsersBulk(selectedIds);
      showSuccess(`Deleted ${selectedIds.length} user(s)`);
      fetchUsers();
    } catch (err) {
      showError(err.message);
    } finally {
      setBulkDeleteDialog(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const params = {
        query: searchQuery,
        status: statusFilter,
        gender: genderFilter,
        sortField: sortModel[0]?.field || 'createdAt',
        sortOrder: sortModel[0]?.sort || 'desc',
      };
      const blob = await userAPI.exportToCSV(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess('Users exported successfully');
    } catch (err) {
      showError(err.message);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 150,
      valueGetter: (params) =>
        `${params.row.firstName} ${params.row.lastName}`,
      sortable: false,
    },
    {
      field: 'firstName',
      headerName: 'First Name',
      hide: true,
    },
    {
      field: 'lastName',
      headerName: 'Last Name',
      hide: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      hide: isMobile,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 130,
      hide: isMobile,
    },
    {
      field: 'gender',
      headerName: 'Gender',
      width: 100,
      hide: isMobile,
    },
    {
      field: 'address.city',
      headerName: 'City',
      width: 120,
      valueGetter: (params) => params.row.address?.city || '-',
      hide: isMobile,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'Active' ? 'success' : 'default'}
          variant={params.value === 'Active' ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 160,
      valueFormatter: (params) =>
        params.value ? new Date(params.value).toLocaleDateString() : '',
      hide: isMobile,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton
              size="small"
              color="info"
              onClick={() => navigate(`/users/view/${params.row._id}`)}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/users/edit/${params.row._id}`)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={() =>
                handleDeleteClick(
                  params.row._id,
                  `${params.row.firstName} ${params.row.lastName}`
                )
              }
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  if (error && !loading) {
    return <ErrorDisplay message={error} onRetry={fetchUsers} />;
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Typography variant="h5" component="h1">
              Users
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweepIcon />}
                disabled={selectedIds.length === 0}
                onClick={() => setBulkDeleteDialog(true)}
              >
                Delete Selected ({selectedIds.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                disabled={users.length === 0}
              >
                Export CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/users/add')}
              >
                Add User
              </Button>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ mb: 2 }}
          >
            <TextField
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={handleSearch}
              size="small"
              sx={{ flexGrow: 1, maxWidth: { md: 400 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearch}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 0 }));
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Gender</InputLabel>
              <Select
                value={genderFilter}
                label="Gender"
                onChange={(e) => {
                  setGenderFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 0 }));
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                label="Sort By"
                value={sortModel[0]?.field || 'createdAt'}
                onChange={(e) =>
                  setSortModel([
                    { field: e.target.value, sort: sortModel[0]?.sort || 'desc' },
                  ])
                }
              >
                <MenuItem value="createdAt">Created At</MenuItem>
                <MenuItem value="firstName">First Name</MenuItem>
                <MenuItem value="lastName">Last Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Order</InputLabel>
              <Select
                label="Order"
                value={sortModel[0]?.sort || 'desc'}
                onChange={(e) =>
                  setSortModel([
                    { field: sortModel[0]?.field || 'createdAt', sort: e.target.value },
                  ])
                }
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ mb: 2 }}
          >
            <TextField
              label="Save current filters as preset"
              size="small"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              sx={{ flexGrow: 1, maxWidth: { md: 360 } }}
            />
            <Button
              variant="contained"
              startIcon={<SaveAltIcon />}
              onClick={handleSavePreset}
            >
              Save Preset
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" rowGap={1} sx={{ mb: 2 }}>
            {savedPresets.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No saved presets yet. Save your favorite filter combos for quick reuse.
              </Typography>
            ) : (
              savedPresets.map((preset) => (
                <Chip
                  key={preset.id}
                  icon={<BookmarkIcon />}
                  label={`${preset.name} · ${preset.statusFilter}/${preset.genderFilter}`}
                  onClick={() => handleApplyPreset(preset)}
                  onDelete={() => handleDeletePreset(preset.id)}
                  variant="outlined"
                  sx={{ borderStyle: 'dashed' }}
                />
              ))
            )}
          </Stack>

          <Box sx={{ width: '100%' }}>
            <DataGrid
              rows={users}
              columns={columns}
              getRowId={(row) => row._id}
              checkboxSelection
              onRowSelectionModelChange={(model) => setSelectedIds(model)}
              rowSelectionModel={selectedIds}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={(model) => {
                setSortModel(model.length ? model : [{ field: 'createdAt', sort: 'desc' }]);
                setPagination((prev) => ({ ...prev, page: 0 }));
              }}
              loading={loading}
              paginationMode="server"
              rowCount={pagination.totalRows}
              pageSizeOptions={[5, 10, 25, 50]}
              paginationModel={{
                page: pagination.page,
                pageSize: pagination.pageSize,
              }}
              onPaginationModelChange={(model) =>
                setPagination((prev) => ({
                  ...prev,
                  page: model.page,
                  pageSize: model.pageSize,
                }))
              }
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'grey.100',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                },
              }}
              columnVisibilityModel={{
                email: !isMobile,
                phone: !isMobile,
                gender: !isMobile,
                'address.city': !isMobile,
                createdAt: !isMobile,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialog.open}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteDialog.userName}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteDialog({ open: false, userId: null, userName: '' })
        }
        confirmText="Delete"
        severity="error"
      />

      <ConfirmDialog
        open={bulkDeleteDialog}
        title="Delete Selected Users"
        message={`Delete ${selectedIds.length} selected user(s)? This action cannot be undone.`}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={() => setBulkDeleteDialog(false)}
        confirmText="Delete"
        severity="error"
      />
    </Box>
  );
};

export default UserList;
