import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import upload from '../../middleware/multer.js';
import { createRestaurant } from '../../controllers/admin/manageRestaunrant.controller.js';
import { checkRole } from '../../middleware/checkRole.js';

const manageRestaunrantRouter = express.Router();

//create a new restaurant
manageRestaunrantRouter.post('/', protect, upload.single('resImg'), checkRole('admin'), createRestaurant)

export default manageRestaunrantRouter;