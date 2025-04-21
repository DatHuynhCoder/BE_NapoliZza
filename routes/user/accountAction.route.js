import express from 'express';
import { changepassbyOTP, createUser, handleLogin, handleLogout, refreshToken, sendOTP, verifyOTP } from '../../controllers/user/accountAction.controller.js';

const accountActionRouter = express.Router();

//Create an account
accountActionRouter.post('/register', createUser);

//Login
accountActionRouter.post('/login', handleLogin);

//Refresh new token
accountActionRouter.post('/refresh-token', refreshToken)

//logout
accountActionRouter.post('/logout', handleLogout)

//send OTP
accountActionRouter.post('/sendOTP', sendOTP)

//verify OTP
accountActionRouter.post('/verifyOTP', verifyOTP)

//change pass by OTP
accountActionRouter.post('/changepassbyOTP', changepassbyOTP)

export default accountActionRouter;