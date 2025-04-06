import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/connect_DB.js';
import { Account } from './models/account.model.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

//import customer routes 
import commentRouter from './routes/customer/comment.route.js';
import manageAccountRouter from './routes/customer/manageAccount.route.js';

//import admin routes
import dishRouter from './routes/admin/dish.route.js';

//import user route
import accountActionRouter from './routes/user/accountAction.route.js';

dotenv.config(); // You can access .env vars globally

const app = express();

//Add middleware to parse json
app.use(express.json()); //parse json
app.use(cors({origin: "http://localhost:5173", credentials: true})); //allow all cors
app.use(express.urlencoded({ extended: true })); //allow to handle url encoded data (form data)

const PORT = process.env.PORT;

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

// ADMIN API HERE
// dish api
app.use('/admin/dish', dishRouter);

//USER API HERE
// accountAction api
app.use('/user/accountAction', accountActionRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server start at http://localhost:${PORT}`);
})