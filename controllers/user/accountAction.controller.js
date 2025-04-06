import { Account } from "../../models/account.model.js";
import jwt from 'jsonwebtoken';

//refresh token
export const refreshToken = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user by ID
    const account = await Account.findById(decoded.id);

    if (!account) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: account._id, role: account.role },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log("token refresh!")
    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid refresh token'});
  }
};

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

    // Generate access token
    const token = jwt.sign({ id: account._id, role: account.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
    // Generate refresh token
    const refreshtoken = jwt.sign({ id: account._id, role: account.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    // Store refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Change to true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ success: true, data: account, token, refreshtoken });
  } catch (error) {
    console.error("Error in login", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const handleLogout = async (req,res) => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    })
		res.status(200).json({ success: true, message: "Logged out successfully" });

  } catch (error) {
    console.error("Error in log out: ", error.message);
		return res.status(500).json({ success: false, message: "Server error" });
  }
}
