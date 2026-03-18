import express from 'express';
import { updateIssueStatus, getIssuesByDepartment, reassignIssueDepartment } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.patch('/issues/:id/status', updateIssueStatus);
router.patch('/issues/:id/reassign', reassignIssueDepartment);
router.get('/issues/department/:dept', getIssuesByDepartment);

export default router;
