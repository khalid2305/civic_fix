import Issue from '../models/Issue.js';
import Comment from '../models/Comment.js';

import Department from '../models/Department.js';

const getDepartmentId = async (category) => {
  const dept = await Department.findOne({ name: category });
  return dept ? dept._id : null;
};

// @desc    Create new issue
// @route   POST /api/issues
// @access  Private
export const createIssue = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const latitude = parseFloat(req.body.latitude);
    const longitude = parseFloat(req.body.longitude);
    let address = req.body.address || '';

    // If no address was sent, reverse-geocode with Nominatim
    if (!address) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geoData = await geoRes.json();
        address = geoData.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      } catch (geoErr) {
        address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      }
    }
    
    // Construct image URL from uploaded file
    let imageUrl = 'https://placehold.co/600x400/1e293b/a8b2d1?text=No+Image+Available'; // Default city/issue placeholder
    if (req.file) {
      console.log('--- UPLOADED FILE ---', req.file);
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    // Check for duplicates (same user, same title, roughly same location in last 24h)
    const duplicate = await Issue.findOne({
      createdBy: req.user._id,
      title: title,
      latitude: { $gte: latitude - 0.0001, $lte: latitude + 0.0001 },
      longitude: { $gte: longitude - 0.0001, $lte: longitude + 0.0001 },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (duplicate) {
      return res.status(400).json({ message: 'Duplicate issue detected. You have already reported this recently.' });
    }

    // Auto routing: Map category to department
    const categoryMap = {
      'Roads & Potholes': 'Road Safety',
      'Water Supply': 'Water Supply',
      'Electricity': 'Electricity',
      'Garbage & Sanitation': 'Sanitation',
      'Parks & Recreation': 'Parks',
      'Street Lights': 'Electricity',
      'Drainage': 'Road Safety',
      'Other': 'General Maintenance'
    };
    
    let deptName = categoryMap[category] || 'General Maintenance';

    let departmentId = await getDepartmentId(deptName);
    
    if (!departmentId) {
      const newDept = await Department.create({ name: deptName });
      departmentId = newDept._id;
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude], // GeoJSON uses [lng, lat]
      },
      imageUrl,
      department: departmentId,
      createdBy: req.user._id,
    });

    res.status(201).json(issue);
  } catch (error) {
    console.error('CREATE ISSUE ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues with filters
// @route   GET /api/issues
// @access  Public
export const getIssues = async (req, res) => {
  try {
    const { department, status, category, nearLat, nearLng, radius } = req.query;
    
    let query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (category) query.category = category;

    // Proximity search
    if (nearLat && nearLng) {
      const lat = parseFloat(nearLat);
      const lng = parseFloat(nearLng);
      const rad = parseFloat(radius) || 5; // Default 5km radius
      
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: rad * 1000, // Distance in meters
        },
      };
    }

    const issues = await Issue.find(query)
      .populate('createdBy', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get issue by ID
// @route   GET /api/issues/:id
// @access  Public
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('supportedUsers', 'name')
      .populate('department', 'name');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user is creator or admin
    if (issue.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this issue' });
    }

    await issue.deleteOne();
    res.json({ message: 'Issue removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like/Unlike issue
// @route   POST /api/issues/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if user already supported
    const index = issue.supportedUsers.findIndex(id => id.toString() === req.user._id.toString());

    if (index === -1) {
      issue.supportedUsers.push(req.user._id);
    } else {
      issue.supportedUsers.splice(index, 1);
    }

    issue.supportCount = issue.supportedUsers.length;
    await issue.save();
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment
// @route   POST /api/issues/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const issueId = req.params.id;

    const comment = await Comment.create({
      text,
      issueId: issueId,
      userId: req.user._id,
    });

    const populatedComment = await Comment.findById(comment._id).populate('userId', 'name email');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for an issue
// @route   GET /api/issues/:id/comments
// @access  Public
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ issueId: req.params.id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all departments
// @route   GET /api/issues/departments
// @access  Public
export const getDepartments = async (req, res) => {
  try {
    const depts = await Department.find();
    res.json(depts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
