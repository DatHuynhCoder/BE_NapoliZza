import { Account } from "../../models/account.model.js";
import jwt from 'jsonwebtoken';

export const createUser = async (req, res) => {
  try {
    const { username, name, email, gender, birthday, phone, password } = req.body;
    // Check if email, username, or phone exists
    const existedAccount = await Account.findOne({
      $or: [{ email }, { username }, { phone }]
    });

    if (existedAccount) {
      let duplicateFields = [];
      if (existedAccount.email === email) duplicateFields.push("email");
      if (existedAccount.username === username) duplicateFields.push("username");
      if (existedAccount.phone === phone) duplicateFields.push("phone");

      return res.status(400).json({
        success: false,
        message: `These fields already exist: ${duplicateFields.join(", ")}`
      });
    }

    //create Account
    const account = await Account.create({
      username,
      name,
      email,
      gender,
      birthday,
      phone,
      password
    })

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Error in create user", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const account = await Account.findOne({ email });

    // Check if account exist and match the password
    if (!account || !(await account.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    } 

    // Tạo JWT token chỉ khi đăng nhập thành công
    const token = jwt.sign({ id: account._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(200).json({ success: true, data: account, token });
  } catch (error) {
    console.error("Error in login", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
