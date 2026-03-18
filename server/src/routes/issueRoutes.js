import express from 'express';
import {
  createIssue,
  getIssues,
  getIssueById,
  deleteIssue,
  toggleLike,
  addComment,
  getComments,
  getDepartments,
} from '../controllers/issueController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateIssue } from '../middleware/issueValidation.js';

import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/departments', getDepartments);

router.route('/')
  .get(getIssues)
  .post(protect, upload.single('image'), createIssue);

router.route('/:id').get(getIssueById).delete(protect, deleteIssue);

router.post('/:id/like', protect, toggleLike);

router.route('/:id/comments').get(getComments).post(protect, addComment);

export default router;
