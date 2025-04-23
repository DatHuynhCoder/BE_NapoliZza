import express from 'express';
import { getAllCategory, getAllComments, getDishes, getTopRatingDishes } from '../../controllers/user/displayData.controller.js';

const displayDataRouter = express.Router();

//Get all category
displayDataRouter.get('/getAllCate', getAllCategory)

//get all comment
displayDataRouter.get('/getAllComments', getAllComments)

//get first 20 dish and sort by rating
displayDataRouter.get('/toprating', getTopRatingDishes)

//get all dishes, get dishes by category
displayDataRouter.get('/dishes', getDishes)

export default displayDataRouter;