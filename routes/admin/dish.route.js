import express from 'express';
import { createDish, deleteDish, updateDish } from '../../controllers/admin/dish.controller.js';
import upload from '../../middleware/multer.js';
import { protect } from '../../middleware/authMiddleware.js';
import { checkRole } from '../../middleware/checkRole.js';

const dishRouter = express.Router();

//create a new dish
dishRouter.post('/', upload.fields([{ name: "dishImg", maxCount: 1 }, { name: "ingredientImgs", maxCount: 2 }]), protect, checkRole('admin') ,createDish);

//delete dish
dishRouter.delete('/:id',protect, checkRole('admin'),deleteDish)

//update dish
dishRouter.put('/:id', upload.fields([{ name: "dishImg", maxCount: 1 }, { name: "ingredientImgs", maxCount: 2 }]),protect, checkRole('admin'), updateDish);

export default dishRouter;