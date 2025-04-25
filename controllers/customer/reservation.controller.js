import { Dish } from "../../models/dish.model.js";
import { Reservation } from "../../models/reservation.model.js";

export const createReservation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, time, numGuests, listDishes, note, paymentMethod } = req.body;

    // Validate required fields
    if (!date || !time || !numGuests) {
      return res.status(400).json({
        success: false,
        message: "Date, time, and number of guests are required",
      });
    }

    // Validate listDishes
    if (!listDishes || !Array.isArray(listDishes) || listDishes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one dish is required",
      });
    }

    let totalPrice = 0;
    let quantity = 0;
    const validatedDishes = [];

    for (const item of listDishes) {
      const { dishId, quantity: qty } = item;

      //Check if dishId and quantity are valid
      if (!dishId || typeof qty !== "number" || qty <= 0) {
        return res.status(400).json({
          success: false,
          message: "Each dish must have a valid ID and quantity > 0",
        });
      }

      //Check if can find dish
      const foundDish = await Dish.findById(dishId);
      if (!foundDish) {
        return res.status(404).json({
          success: false,
          message: `Dish not found with ID ${dishId}`,
        });
      }

      //Check if avaiable > quantity
      if( foundDish.available < qty) {
        return res.status(400).json({
          success: false,
          message: `Dish with ID ${dishId} is not available in quantity ${qty}`,
        });
      }

      totalPrice += foundDish.price * qty;
      quantity += qty;

      validatedDishes.push({ dishId, quantity: qty });
    }

    const reservationDateTime = new Date(`${date}T${time}`);

    if (isNaN(reservationDateTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date or time format",
      });
    }

    const newReservation = {
      quantity,
      time: reservationDateTime,
      status: "pending",
      totalPrice,
      listDishes: validatedDishes,
      note: note || "",
      accountId: userId,
      numGuests,
      paymentMethod
    };

    const reservation = await Reservation.create(newReservation);

    return res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    console.error("Error in create reservation:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getReservationByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const filter = { accountId: userId };
    //if has status we filter by status too
    if (status) {
      filter.status = status;
    }

    const reservations = await Reservation.find(filter)
      .populate("listDishes.dishId", "name price rating")
      .sort({ time: -1 });

    if (reservations.length == 0) {
      return res.status(200).json({ success: true, message: "There is no reservation" });
    }

    return res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    console.error("Error in get reservation:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const cancelReservation = async (req, res) => {
  try {
    //get userId
    const userId = req.user.id;

    //get id reservation
    const reservationId = req.params.id;

    //get reservation
    const reservation = await Reservation.findOne({ _id: reservationId, accountId: userId });

    //Check if reservation exist
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `Reservation not found with ID ${reservationId}`,
      });
    }

    if (reservation.status != 'pending') {
      return res.status(404).json({
        success: false,
        message: 'Reservation status is not pending',
      });
    }

    //cancel reservation
    reservation.status = 'canceled';

    //save reservation status
    await reservation.save();

    return res.status(200).json({ success: true, message: "Cancel your reservation sucessfully!" });
  } catch (error) {
    console.error("Error in cancel reservation:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const changePaymentMethod = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;
    const { paymentMethod } = req.body;

    //Validate payment method
    if (!paymentMethod || !['direct', 'online'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Must be 'direct' or 'online'",
      });
    }

    //Find reservation and update payment method
    const reservation = await Reservation.findOneAndUpdate(
      { _id: reservationId, accountId: userId },
      { paymentMethod },
      { new: true }
    );

    return res.status(200).json({ success: true, data: reservation });

  } catch (error) {
    console.error("Error in change payment method:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}