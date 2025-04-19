import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { cancelReservation, changePaymentMethod, createReservation, getReservationByUserId } from '../../controllers/customer/reservation.controller.js';

const reservationRouter = express.Router();

//create a reservation
reservationRouter.post('/', protect, createReservation)

//get reservation by userId and status (if it has)
reservationRouter.get('/', protect, getReservationByUserId);

//cancel an reservation
reservationRouter.delete("/:id", protect, cancelReservation)

//change payment method of reservation
reservationRouter.put("/:id/payment-method", protect, changePaymentMethod)

export default reservationRouter;