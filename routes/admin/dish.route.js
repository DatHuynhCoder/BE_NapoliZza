import express from 'express';
import { createDish, deleteDish, getAllDishes, updateDish, searchDishes, getTopRatingDishes } from '../../controllers/admin/dish.controller.js';
import upload from '../../middleware/multer.js';
import { protect } from '../../middleware/authMiddleware.js';

const dishRouter = express.Router();

//create a new dish
dishRouter.post('/', upload.fields([{ name: "dishImg", maxCount: 1 }, { name: "ingredientImgs", maxCount: 2 }]),protect, createDish);

//delete dish
dishRouter.delete('/:id',protect, deleteDish)

//update dish
dishRouter.put('/:id', upload.fields([{ name: "dishImg", maxCount: 1 }, { name: "ingredientImgs", maxCount: 2 }]),protect, updateDish);

//get all dishes
dishRouter.get('/', getAllDishes);

//search dishes: name and category, sort by price, rating, discount, quantitySold
dishRouter.get('/search', searchDishes)

//get first 20 dish and sort by rating
dishRouter.get('/toprating', protect, getTopRatingDishes)

export default dishRouter;