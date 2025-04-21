import { Account } from "../../models/account.model.js";
import jwt from 'jsonwebtoken';
import sendMail from "../../utils/sendMail.js";
import bcrypt from "bcryptjs";
import { OTP } from "../../models/otp.model.js";

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
    return res.status(403).json({ success: false, message: 'Invalid refresh token' });
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
    const accessToken = jwt.sign({ id: account._id, role: account.role }, process.env.JWT_SECRET, { expiresIn: "15m" });
    // Generate refresh token
    const refreshToken = jwt.sign({ id: account._id, role: account.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

    // Store refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Change to true in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({ success: true, data: account, accessToken });
  } catch (error) {
    console.error("Error in login", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const handleLogout = async (req, res) => {
  try {
    //Clear the refresh token cookie
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

export const sendOTP = async (req, res) => {
  try {
    //Get email from req
    const { email } = req.body;

    //Check if account exist
    const accountCheck = await Account.findOne({ email: email });
    if (!accountCheck) {
      return res.status(404).json({ success: false, message: "account not found" });
    }

    //Generate OTP
    let otp = Math.floor(100000 + Math.random() * 900000).toString();

    //has OTP for security purpose
    const salt = 10;
    const hashOTP = await bcrypt.hash(otp, salt);

    //Create Otp document
    const Otp = new OTP({
      otp: hashOTP,
      email: email
    })

    //save Otp
    await Otp.save();

    //OTP HTML mail content
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <p>Đây là mã <strong>OTP</strong>: <strong>${otp}</strong></p>

          <p>Mã OTP sẽ hết hạn sau <strong>15</strong> phút</p>

          <p style="margin-top: 20px;">Trân trọng,<br>Đội ngũ NapoliZza</p>
        </div>
      `;

    //Send email to user
    const emailContent = {
      to: email,
      subject: "Mã OTP quên mật khẩu từ NapoliZza",
      text: htmlContent
    };

    //send email to user
    const sendMailStatus = await sendMail(emailContent.to, emailContent.subject, emailContent.text);

    //Check if you succesfully sent OTP
    if (!sendMailStatus) {
      return res.status(500).json({ success: false, message: "Cannot send email" });
    }

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in send OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const verifyOTP = async (req, res) => {
  try {
    //Get email and otp
    const { email, otp } = req.body;

    //Check if OTP exist
    if (!otp) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    //Find Otp by email (latest)
    const otpfind = await OTP.findOne({ email: email }).sort({ createdAt: -1 });

    //Check if otp exist in database
    if (!otpfind) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    //Check if otp expire
    if (otpfind.expiresAt < Date.now()) {
      //delete OTP record
      await OTP.deleteMany({ email: email })
      return res.status(404).json({ success: false, message: "OTP expire" });
    }

    //compare otp
    const isValid = await bcrypt.compare(otp, otpfind.otp);

    //Check if enter otp correct
    if (!isValid) {
      return res.status(404).json({ success: false, message: "Otp entered not correct!" });
    }

    res.status(200).json({ success: true, message: "OTP verify successfully" });
  } catch (error) {
    console.error("Error in verify OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const changepassbyOTP = async (req, res) => {
  try {
    //Get otp and email
    const { email, otp, newpass } = req.body;

    //Check if email and otp exist
    if (!email || !otp) {
      return res.status(404).json({ success: false, message: "Require OTP and Email" });
    }

    //Find Otp by email (latest)
    const otpfind = await OTP.findOne({ email: email }).sort({ createdAt: -1 });

    //Check if otp exist in database
    if (!otpfind) {
      return res.status(404).json({ success: false, message: "OTP not found" });
    }

    //Check if expire
    if (otpfind.expiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }
    

    //compare otp
    const isValid = await bcrypt.compare(otp, otpfind.otp);

    //Check if enter otp correct
    if (!isValid) {
      return res.status(404).json({ success: false, message: "Otp not correct!" });
    }

    //Check if pass exist
    if (!newpass) {
      return res.status(404).json({ success: false, message: "Require new password" });
    }

    //get the account to update
    const account = await Account.findOne({ email: email });

    //Check if account exist
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }

    //change pass
    account.password = newpass;

    //update account
    await account.save();

    res.status(200).json({ success: true, message: "Account updated sucessfully!" });
  } catch (error) {
    console.error("Error in change pass by OTP: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}