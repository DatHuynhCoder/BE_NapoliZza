import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { cancelReservation, changePaymentMethod, changePaymentStatus, createReservation, getReservationByUserId, createPaymentReservation } from '../../controllers/customer/reservation.controller.js';
import { checkRole } from '../../middleware/checkRole.js';

const reservationRouter = express.Router();

//create a reservation
reservationRouter.post('/', protect, checkRole('admin', 'customer'), createReservation)

//get reservation by userId and status (if it has)
reservationRouter.get('/', protect, checkRole('admin', 'customer'), getReservationByUserId);

//cancel an reservation
reservationRouter.delete("/:id", protect, checkRole('admin', 'customer'), cancelReservation)

//change payment method of reservation
reservationRouter.patch("/:id/payment-method", protect, checkRole('admin', 'customer'), changePaymentMethod)

//change payment status of reservation
reservationRouter.patch("/:id/payment-status", protect, checkRole('admin', 'customer'), changePaymentStatus)

reservationRouter.post("/create-payment-link", protect, checkRole('admin', 'customer'), createPaymentReservation)

export default reservationRouter;