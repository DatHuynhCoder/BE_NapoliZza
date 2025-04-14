import express from 'express';
import { deleteAccount, getAccountById, updateAccount } from '../../controllers/customer/manageAccount.controller.js';
import upload from '../../middleware/multer.js';
import { protect } from '../../middleware/authMiddleware.js';

const manageAccountRouter = express.Router();

//get account by id
manageAccountRouter.get('/',protect, getAccountById);

//update customer info
manageAccountRouter.put('/', protect ,upload.single('image') , updateAccount)

//delete customer
manageAccountRouter.delete('/:id', deleteAccount);

export default manageAccountRouter;