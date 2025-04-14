import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getReservation, updateReservationStatus } from '../../controllers/admin/manageReservation.controller.js';

const manageReservationRouter = express.Router();

//get all reservation
manageReservationRouter.get('/', protect, getReservation);

//update status reservation
manageReservationRouter.post('/', protect, updateReservationStatus);

export default manageReservationRouter;