import express from 'express'
import { searchDishes } from '../../controllers/user/search.controller.js';

const searchRouter = express.Router();

//Ultimate search dish: name and category, sort by price, rating, discount, quantitySold
searchRouter.get('/dish', searchDishes)

export default searchRouter;