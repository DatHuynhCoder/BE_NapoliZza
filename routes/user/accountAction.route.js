import express from 'express';
import { createUser, handleLogin } from '../../controllers/user/accountAction.controller.js';

const accountActionRouter = express.Router();

accountActionRouter.post('/register', createUser);

accountActionRouter.post('/login', handleLogin);

export default accountActionRouter;