import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Register a new administrator
// @route   POST /api/auth/register
// @access  Public (for initial setup or authenticated admin)
export const registerAdmin = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email address, and password',
      });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'An administrator account with this email address already exists',
      });
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      role: role || 'admin',
    });

    await logActivity({
      action: 'CREATE',
      entity: 'ADMIN',
      description: `New administrator registered: ${admin.name} (${admin.email})`,
      user: admin._id,
      userName: admin.name,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      },
      message: 'Administrator registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate admin & get token
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password',
      });
    }

    // Explicitly select password field which is select: false
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password',
      });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    await logActivity({
      action: 'LOGIN',
      entity: 'ADMIN',
      description: `Administrator logged in: ${admin.name}`,
      user: admin._id,
      userName: admin.name,
    });

    res.json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        token: generateToken(admin._id),
      },
      message: 'Login successful',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/profile
// @access  Private
export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator profile not found',
      });
    }

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateAdminProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user._id).select('+password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrator profile not found',
      });
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;

    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
      }
      admin.password = req.body.password;
    }

    const updatedAdmin = await admin.save();

    await logActivity({
      action: 'UPDATE',
      entity: 'ADMIN',
      description: `Administrator profile updated: ${updatedAdmin.name}`,
      user: updatedAdmin._id,
      userName: updatedAdmin.name,
    });

    res.json({
      success: true,
      data: {
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        token: generateToken(updatedAdmin._id),
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check system setup status (whether any admin account exists)
// @route   GET /api/auth/setup-status
// @access  Public
export const getSetupStatus = async (req, res, next) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({
      success: true,
      hasAdmin: adminCount > 0,
      count: adminCount,
    });
  } catch (error) {
    next(error);
  }
};
