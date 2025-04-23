import express from 'express';
import { changePassword, deleteAccount, getAccountById, updateAccount } from '../../controllers/customer/manageAccount.controller.js';
import upload from '../../middleware/multer.js';
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';

const manageAccountRouter = express.Router();

//get account by id
manageAccountRouter.get('/',protect, checkRole('admin','customer'), getAccountById);

//update account info
manageAccountRouter.patch('/', protect ,checkRole('admin','customer'),upload.single('image') , updateAccount)

//change account password
manageAccountRouter.patch('/changepass', protect, checkRole('admin','customer'), changePassword);

//delete account
manageAccountRouter.delete('/:id',protect, checkRole('admin','customer'), deleteAccount);

export default manageAccountRouter;