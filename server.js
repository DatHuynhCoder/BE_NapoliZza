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
import { Dish } from './models/dish.model.js';
import { normalizeString } from './utils/normalizeString.js';

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

//update unsigndish
app.use('/updateUnsignDish', async (req, res) => {
  try {
    const dishes = await Dish.find();
    for (const dish of dishes) {
      const originalName = dish.name;
      const normalized = normalizeString(originalName);

      dish.unsignName = normalized;
      await dish.save();
    }
    res.status(200).json({ success: true, message: "Unsign dish names updated successfully" });
  } catch (error) {
    console.error("Error updating unsign dish:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
})
