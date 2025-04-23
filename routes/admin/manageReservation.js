import express from 'express';
import { protect } from '../../middleware/authMiddleware.js';
import { getReservation, updateReservationStatus } from '../../controllers/admin/manageReservation.controller.js';
import { checkRole } from '../../middleware/checkRole.js';

const manageReservationRouter = express.Router();

//get all reservation
manageReservationRouter.get('/', protect, checkRole('admin'), getReservation);

//update status reservation
manageReservationRouter.post('/', protect, checkRole('admin'), updateReservationStatus);

export default manageReservationRouter;