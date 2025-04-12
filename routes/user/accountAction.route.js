import express from 'express';
import { createUser, handleLogin, refreshToken } from '../../controllers/user/accountAction.controller.js';
import { protect } from '../../middleware/authMiddleware.js';

const accountActionRouter = express.Router();

//Create an account
accountActionRouter.post('/register', createUser);

//Login
accountActionRouter.post('/login', handleLogin);

//Refresh new token
accountActionRouter.post('/refresh-token', refreshToken)

//logout
accountActionRouter.post('/logout', handleLogin)

export default accountActionRouter;