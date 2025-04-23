import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';
import { createComment, deleteComment, updateComment } from '../../controllers/customer/comment.controller.js';

const commentRouter = express.Router();

//1. Create new comment
commentRouter.post('/:id', protect, checkRole('admin','customer'), createComment);

//2. Update comment
commentRouter.put('/:id', protect, checkRole('admin','customer'), updateComment);

//3. Delete comment
commentRouter.delete('/:id', protect, checkRole('admin','customer'), deleteComment);

export default commentRouter;