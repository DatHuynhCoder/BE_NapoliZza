import express from 'express';
import { deleteAccount, getAccountById, updateAccount } from '../../controllers/customer/manageAccount.controller.js';
import upload from '../../middleware/multer.js';

const manageAccountRouter = express.Router();

//get account by id
manageAccountRouter.get('/:id', getAccountById);

//update customer info
manageAccountRouter.put('/:id',upload.single('image') , updateAccount)

//3 delete customer
manageAccountRouter.delete('/:id', deleteAccount);

export default manageAccountRouter;