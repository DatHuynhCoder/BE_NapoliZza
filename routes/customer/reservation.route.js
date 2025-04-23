import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { cancelReservation, changePaymentMethod, createReservation, getReservationByUserId } from '../../controllers/customer/reservation.controller.js';
import { checkRole } from '../../middleware/checkRole.js';

const reservationRouter = express.Router();

//create a reservation
reservationRouter.post('/', protect, checkRole('customer'), createReservation)

//get reservation by userId and status (if it has)
reservationRouter.get('/', protect, checkRole('customer'), getReservationByUserId);

//cancel an reservation
reservationRouter.delete("/:id", protect, checkRole('customer'), cancelReservation)

//change payment method of reservation
reservationRouter.put("/:id/payment-method", protect, checkRole('customer'), changePaymentMethod)

export default reservationRouter;