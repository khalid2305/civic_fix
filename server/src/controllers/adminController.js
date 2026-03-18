import Issue from '../models/Issue.js';

// @desc    Update issue status
// @route   PATCH /api/admin/issues/:id/status
// @access  Private/Admin
export const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.status = status;
    const updatedIssue = await issue.save();

    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get issues by department with filters and sorting
// @route   GET /api/admin/issues/department/:dept
// @access  Private/Admin or Dept Head
export const getIssuesByDepartment = async (req, res) => {
  try {
    const { dept } = req.params;
    const { lat, lng, radius, sortBy } = req.query;
    
    let query = {};
    if (dept !== 'All') {
      query.department = dept;
    }

    // Location filtering (simple bounding box for radius in km)
    if (lat && lng && radius) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const rad = parseFloat(radius);
      
      // Roughly 1 degree lat = 111km
      const latRange = rad / 111;
      const lngRange = rad / (111 * Math.cos(latitude * Math.PI / 180));

      query.latitude = { $gte: latitude - latRange, $lte: latitude + latRange };
      query.longitude = { $gte: longitude - lngRange, $lte: longitude + lngRange };
    }

    let sortOption = { createdAt: -1 };
    if (sortBy === 'supportCount') {
      sortOption = { supportCount: -1, createdAt: -1 };
    }

    const issues = await Issue.find(query)
      .populate('createdBy', 'name email')
      .populate('department', 'name')
      .sort(sortOption);

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reassign issue to another department
// @route   PATCH /api/admin/issues/:id/reassign
// @access  Private/Admin
export const reassignIssueDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    issue.department = departmentId;
    const updatedIssue = await issue.save();
    
    // Optional: Populate and return
    const populatedIssue = await Issue.findById(updatedIssue._id)
      .populate('department', 'name')
      .populate('createdBy', 'name email');

    res.json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
