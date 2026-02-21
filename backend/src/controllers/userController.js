const User = require('../models/User');
const { Parser } = require('json2csv');


const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const totalUsers = await User.countDocuments();
    const users = await User.find()
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
const updateUser = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages,
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

// @desc    Bulk delete users
// @route   POST /api/users/bulk-delete
// @access  Public
const deleteUsersBulk = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs to delete',
      });
    }

    const result = await User.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} user(s)`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting users',
      error: error.message,
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = async (req, res) => {
  try {
    const { query, status, gender } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let searchQuery = {};

    // Text search for name or email
    if (query) {
      searchQuery.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      searchQuery.status = status;
    }

    // Filter by gender
    if (gender && gender !== 'all') {
      searchQuery.gender = gender;
    }

    const totalUsers = await User.countDocuments(searchQuery);
    const users = await User.find(searchQuery)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
        hasNextPage: page < Math.ceil(totalUsers / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching users',
      error: error.message,
    });
  }
};

// @desc    Export users to CSV
// @route   GET /api/users/export
// @access  Public
const exportUsersToCSV = async (req, res) => {
  try {
    const { query, status, gender } = req.query;
    const sortField = req.query.sortField || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    let searchQuery = {};

    if (query) {
      searchQuery.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      searchQuery.status = status;
    }

    if (gender && gender !== 'all') {
      searchQuery.gender = gender;
    }

    const users = await User.find(searchQuery)
      .sort({ [sortField]: sortOrder })
      .lean();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No users found to export',
      });
    }

    // Transform data for CSV
    const csvData = users.map((user) => ({
      'First Name': user.firstName,
      'Last Name': user.lastName,
      Email: user.email,
      Phone: user.phone,
      'Date of Birth': user.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString()
        : '',
      Gender: user.gender,
      Street: user.address?.street || '',
      City: user.address?.city || '',
      State: user.address?.state || '',
      'Zip Code': user.address?.zipCode || '',
      Country: user.address?.country || '',
      Status: user.status,
      'Created At': new Date(user.createdAt).toLocaleDateString(),
    }));

    const fields = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Date of Birth',
      'Gender',
      'Street',
      'City',
      'State',
      'Zip Code',
      'Country',
      'Status',
      'Created At',
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting users',
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  deleteUsersBulk,
  searchUsers,
  exportUsersToCSV,
};
