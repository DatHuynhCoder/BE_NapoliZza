import { Reservation } from "../../models/reservation.model.js";
import { Dish } from "../../models/dish.model.js";
import { Restaurant } from "../../models/restaurant.model.js";
import { Account } from "../../models/account.model.js";
import sendMail from "../../utils/sendMail.js";

export const getReservation = async (req, res) => {
  try {
    const status = req.query.status;
    const reservations = await Reservation.find({ status: status })
      .populate("accountId", "name email phone")
      .populate("listDishes.dishId", "name price rating")
      .sort({ time: -1 });

    if (reservations.length == 0) {
      return res.status(200).json({ success: true, message: "There is no reservation" });
    }

    return res.status(200).json({ success: true, data: reservations });
  } catch (error) {
    console.error("Error in get reservation: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateReservationStatus = async (req, res) => {
  try {
    const { reservationId, status } = req.body;

    if (!reservationId || !status) {
      return res.status(400).json({ success: false, message: "reservationId and status are required !" });
    }

    const reservation = await Reservation.findOne({ _id: reservationId });
    if (!reservation) {
      return res.status(400).json({ success: false, message: "Cannot find reservation" });
    }

    //get username and email
    const account = await Account.findOne({ _id: reservation.accountId });

    //check if account exist
    if (!account) {
      return res.status(400).json({ success: false, message: "Cannot find account" });
    }

    //check if you can update status reservation
    if (reservation.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Cannot update status if reservation is not pending" });
    }

    //if status is confirmed, caculate profit and email user
    if (status === 'confirmed') {
      let totalPrice = reservation.totalPrice;
      let quantitySold = reservation.quantity;

      //update dish quantity sold and available
      for (const item of reservation.listDishes) {
        const dish = await Dish.findOne({ _id: item.dishId });
        if (dish) {
          dish.quantitySold += item.quantity;
          dish.available -= item.quantity;
          await dish.save();
        }
      }

      let paymentStatusText = "";
      if(reservation.paymentStatus === 'pending') {
        paymentStatusText = 'Thanh toán tại nhà hàng';
      } else {
        paymentStatusText = 'Qúy khách đã thanh toán online';
      }

      //HTML email content
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Xin chào ${account.username},</h2>
          <p>Đơn đặt bàn của bạn đã được <strong>xác nhận</strong> thành công</p>

          <p><strong>Mã đơn hàng: ${reservation._id}</strong></p>
          <p><strong>Thời gian:</strong> ${new Date(reservation.time).toLocaleString()}</p>
          <p><strong>Số người:</strong> ${reservation.quantity}</p>

          <p><strong>Tổng tiền:</strong> ${reservation.totalPrice.toLocaleString()}đ</p>
          <p><strong>Thanh toán:</strong> ${paymentStatusText}</p>

          <p>Chúng tôi rất mong được phục vụ bạn tại nhà hàng ❤️</p>
          <p style="margin-top: 20px;">Trân trọng,<br>Đội ngũ NapoliZza</p>
        </div>
      `;

      //Send email to customer
      const emailContent = {
        to: account.email,
        subject: "Xác nhận đặt bàn NapoliZza",
        text: htmlContent
      };

      //send email to customer
      const sendMailStatus = await sendMail(emailContent.to, emailContent.subject, emailContent.text);
      if (!sendMailStatus) {
        return res.status(500).json({ success: false, message: "Cannot send email" });
      }

      //update restaurant profit
      const restaurant = await Restaurant.findOne({});
      if (restaurant) {
        restaurant.profit += totalPrice;
        restaurant.quantitySold += quantitySold;
        await restaurant.save();
      }
    }

    //update reservation status
    reservation.status = status;
    await reservation.save();

    return res.status(200).json({ success: true, message: "Update reservation status successfully" });
  } catch (error) {
    console.error("Error in get reservation: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}