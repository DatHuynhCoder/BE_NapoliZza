import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connect_DB.js';
import { Account } from './models/account.model.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';
import axios from 'axios';
import moment from 'moment';
import PayOS from "@payos/node";

//import customer routes 
import commentRouter from './routes/customer/comment.route.js';
import manageAccountRouter from './routes/customer/manageAccount.route.js';
import reservationRouter from './routes/customer/reservation.route.js';

//import admin routes
import dishRouter from './routes/admin/dish.route.js';
import manageReservationRouter from './routes/admin/manageReservation.js';
import manageRestaunrantRouter from './routes/admin/manageRestaunrant.route.js';

//import user route
import accountActionRouter from './routes/user/accountAction.route.js';
import displayDataRouter from './routes/user/displaydata.route.js';
import searchRouter from './routes/user/search.route.js';

dotenv.config(); // You can access .env vars globally

const app = express();

//Add middleware to parse json
app.use(express.json()); //parse json
app.use(cors({ origin: "http://localhost:5173", credentials: true })); //allow all cors
app.use(cookieParser()); //parse cookie
app.use(express.urlencoded({ extended: true })); //allow to handle url encoded data (form data)

const PORT = process.env.PORT;

const payos = new PayOS('bb520963-30b7-4f6a-b03b-22b41fa4bb7d', 'a4546b7a-be26-4579-92c1-11cef8ada9a2', '5876d916797c540648b31e3d97c4dff0bb34136b8c60422f7a688f7428471276')

app.get('/', (req, res) => {
  res.send('<h1>Welcome to Ours Server</h1>');
})

//API to TEST
//1 Get all accounts information
app.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.find({});
    res.status(200).json({ success: true, data: accounts });
  } catch (error) {
    console.error("Error in get accounts: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

//2 Create new account
app.post('/accounts', async (req, res) => {
  try {
    const newAccount = await Account.create(req.body);
    res.status(201).json({ success: true, data: newAccount });
  } catch (error) {
    console.error("Error in create account: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

//3 create many accounts
app.post('/accounts/many', async (req, res) => {
  try {
    const newAccounts = await Account.insertMany(req.body);
    res.status(201).json({ success: true, data: newAccounts });
  } catch (error) {
    console.error("Error in create many accounts: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

//4 delete all accounts
app.delete('/accounts', async (req, res) => {
  try {
    await Account.deleteMany({});
    res.status(200).json({ success: true, message: "Delete all accounts successfully" });
  } catch (error) {
    console.error("Error in delete all accounts: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
})

//CUSTOMER API HERE
//customer comment api
app.use('/customer/comment', commentRouter);
//customer manage account api
app.use('/customer/manageAccount', manageAccountRouter);
//customer books an reservation
app.use('/customer/reservation', reservationRouter);

// ADMIN API HERE
// dish api
app.use('/admin/dish', dishRouter);
app.use('/admin/manageReservation', manageReservationRouter);
app.use('/admin/manageRestaunrant', manageRestaunrantRouter);

//USER API HERE
// accountAction api
app.use('/user/accountAction', accountActionRouter);
app.use('/user/display', displayDataRouter);
app.use('/user/search', searchRouter)

// const config = {
//   app_id: '2553',
//   key1: 'PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL',
//   key2: 'kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz',
//   endpoint: 'https://sb-openapi.zalopay.vn/v2/create',
//   callback_url: 'http://localhost:5000/zalopay-callback',
// };

// app.post('/zalopay', async (req, res) => {
//   const { tableId, comboName, amount } = req.body;
//   const embed_data = {
//     tableId,
//     comboName,
//   };

//   const items = [{}]; // có thể thêm danh sách món ăn nếu cần
//   const transID = Math.floor(Math.random() * 1000000);
//   const order = {
//     app_id: config.app_id,
//     app_trans_id: `${moment().format('YYMMDD')}_${transID}`,
//     app_user: 'demo_user',
//     app_time: Date.now(),
//     item: JSON.stringify(items),
//     embed_data: JSON.stringify(embed_data),
//     amount,
//     description: `Đặt bàn: ${comboName}`,
//     bank_code: '',
//     callback_url: config.callback_url,
//   };

//   // Tạo chữ ký
//   const data = `${order.app_id}|${order.app_trans_id}|${order.app_user}|${order.amount}|${order.app_time}|${order.embed_data}|${order.item}`;
//   order.mac = crypto.createHmac('sha256', config.key1).update(data).digest('hex');

//   try {
//     const result = await axios.post(config.endpoint, null, { params: order });
//     console.log('✅ ZaloPay order created:', result.data);
//     return res.json({ order_url: result.data.order_url });
//   } catch (err) {
//     console.error(err.response?.data || err);
//     return res.status(500).json({ error: 'Lỗi tạo đơn hàng ZaloPay' });
//   }
// });

// use ngrok to call this
// app.post('/zalopay-callback', express.json(), (req, res) => {
//   const dataStr = req.body.data;
//   const reqMac = req.body.mac;
//   const mac = crypto.createHmac('sha256', config.key2).update(dataStr).digest('hex');

//   if (reqMac !== mac) {
//     return res.status(400).send('invalid callback');
//   }

//   const data = JSON.parse(dataStr);
//   console.log('✅ ZaloPay payment success:', data);

//   // 👉 Cập nhật trạng thái đơn hàng trong DB tại đây

//   res.json({ return_code: 1, return_message: 'success' });
// });
const YOUR_DOMAIN = 'http://localhost:5173';

app.post('/create-payment-link', async (req, res) => {
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
    returnUrl: `${YOUR_DOMAIN}/`,
    cancelUrl: `${YOUR_DOMAIN}/ve-chung-toi`,
  };
  console.log("check order info: ", order)
  const paymentLink = await payos.createPaymentLink(order);
  return res.json({ url: paymentLink.checkoutUrl });
})

// webhook-url using ngrok
// example: https://22a5-2402-800-6394-7899-2913-cbda-3cd6-8e52.ngrok-free.app/payment-callback
app.post('/payment-callback', async (req, res) => {
  console.log("check payment callback: ", req.body)
  return res.json()
})

app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
})