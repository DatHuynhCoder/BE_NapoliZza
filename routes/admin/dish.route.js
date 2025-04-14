import express from 'express';
import { createDish, deleteDish, getAllDishes, updateDish, searchDishes } from '../../controllers/admin/dish.controller.js';
import upload from '../../middleware/multer.js';

const dishRouter = express.Router();

//create a new dish
dishRouter.post('/', upload.fields([{ name: "dishImg", maxCount: 1 }, { name: "ingredientImgs", maxCount: 2 }]), createDish);

//delete dish
dishRouter.delete('/:id', deleteDish)

//update dish
dishRouter.put('/:id', upload.fields([{ name: "dishImg", maxCount: 1 }, { name: "ingredientImgs", maxCount: 2 }]), updateDish);

//get all dishes
dishRouter.get('/', getAllDishes);

//search dishes: name and category, sort by price, rating, discount, quantitySold
dishRouter.get('/search', searchDishes)

export default dishRouter;