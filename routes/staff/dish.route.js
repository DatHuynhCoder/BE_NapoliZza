import express from 'express';
import { createDish, deleteDish, getAllDishes, updateDish } from '../../controllers/staff/dish.controller.js';
import upload from '../../middleware/multer.js';

const dishRouter = express.Router();

//create a new dish
dishRouter.post('/', upload.fields([{ name: "images", maxCount: 5 }, { name: "ingredientImages", maxCount: 5 }]), createDish);

//delete dish
dishRouter.delete('/:id', deleteDish)

//update dish
dishRouter.put('/:id', upload.fields([{ name: "images", maxCount: 5 }, { name: "ingredientImages", maxCount: 5 }]), updateDish);

//get all dishes
dishRouter.get('/', getAllDishes);

export default dishRouter;