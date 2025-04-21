import express from 'express';
import { changePassword, deleteAccount, getAccountById, updateAccount } from '../../controllers/customer/manageAccount.controller.js';
import upload from '../../middleware/multer.js';
import { protect } from '../../middleware/authMiddleware.js';

const manageAccountRouter = express.Router();

//get account by id
manageAccountRouter.get('/',protect, getAccountById);

//update account info
manageAccountRouter.put('/', protect ,upload.single('image') , updateAccount)

//change account password
manageAccountRouter.put('/changepass', protect, changePassword);

//delete account
manageAccountRouter.delete('/:id', deleteAccount);

export default manageAccountRouter;