import express from 'express';

import { createComment, deleteComment, getAllComment, updateComment } from '../../controllers/customer/comment.controller.js';

const commentRouter = express.Router();

//1. Create new comment
commentRouter.post('/:id', createComment);

//2. Update comment
commentRouter.put('/:id', updateComment);

//3. Delete comment
commentRouter.delete('/:id', deleteComment);

//4. get all comments
commentRouter.get('/', getAllComment);

export default commentRouter;