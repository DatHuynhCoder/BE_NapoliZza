import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { cancelReservation, createReservation, getReservationByUserId } from '../../controllers/customer/reservation.controller.js';

const reservationRouter = express.Router();

//create a reservation
reservationRouter.post('/', protect, createReservation)

//get reservation by userId and status (if it has)
reservationRouter.get('/', protect, getReservationByUserId);

//cancel an reservation
reservationRouter.delete("/:id", protect, cancelReservation)

export default reservationRouter;