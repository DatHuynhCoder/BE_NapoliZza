import { Dish } from "../../models/dish.model.js";
import { Reservation } from "../../models/reservation.model.js";
import PayOS from "@payos/node";

const payos = new PayOS('bb520963-30b7-4f6a-b03b-22b41fa4bb7d', 'a4546b7a-be26-4579-92c1-11cef8ada9a2', '5876d916797c540648b31e3d97c4dff0bb34136b8c60422f7a688f7428471276')

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
      if (foundDish.available < qty) {
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

export const changePaymentStatus = async (req, res) => {
  try {
    const reservationId = req.params.id;
    const userId = req.user.id;
    const paymentStatus = "paid"

    const reservation = await Reservation.findOneAndUpdate(
      { _id: reservationId, accountId: userId },
      { paymentStatus },
      { new: true }
    );

    return res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    console.error("Error in change payment status:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

const YOUR_DOMAIN = 'http://localhost:5173';

export const createPaymentReservation = async (req, res) => {
  const {
    reservationid,
    amount,
    description,
    items
  } = req.body;
  // items: [
  //   {
  //     name: "Pizza",
  //     quantity: 1,
  //     price: 2000,
  //   },
  // ],

  // Generate a unique orderCode using timestamp and random number
  const orderCode = Number(`${Date.now()}${Math.floor(10 + Math.random() * 90)}`); // Example: 16832012345671234
  const order = {
    orderCode: orderCode,
    amount: amount,
    description: "Thanh đoán đơn đặt bàn",
    items: items,
    returnUrl: `${YOUR_DOMAIN}?reservationid=${reservationid}`,
    // ex: http://localhost:5173/?code=00&id=41161ff2b8ec4c1bb486321677354626&cancel=false&status=PAID&orderCode=174636829966485
    cancelUrl: `${YOUR_DOMAIN}/theo-doi-dat-ban?reservationid=${reservationid}`,
    // ex: http://localhost:5173/ve-chung-toi?code=00&id=66f03c8a0ca848df8906678a7c8fb52c&cancel=true&status=CANCELLED&orderCode=174629713782093
  };
  console.log("check order info: ", order)
  const paymentLink = await payos.createPaymentLink(order);
  return res.json({ url: paymentLink.checkoutUrl });
}