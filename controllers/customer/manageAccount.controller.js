import { Account } from "../../models/account.model.js";
import cloudinary from "../../config/cloudinary.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";
import bcrypt from "bcryptjs";

export const getAccountById = async (req, res) => {
  try {
    const userID = req.user.id;
    const account = await Account.findById(userID);
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }
    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Error in get account: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateAccount = async (req, res) => {
  try {
    //Reminder: Please add phone validate later
    //get account id from request
    const userID = req.user.id;

    //get update account info from request
    const updateAccount = { ...req.body };

    //Prevent updating email and password
    delete updateAccount.email;
    delete updateAccount.password;

    //Validate phone if exist
    // if(updateAccount.phone){
    //Check later
    // }


    //upload avatar
    const avatar = req.file;
    if (avatar) {
      const account = await Account.findById(userID);
      //Check if account exist
      if (!account) {
        return res.status(404).json({ success: false, message: "account not found" });
      }
      //Delete old avatar
      if (account.avatar && account.avatar.public_id) {
        await cloudinary.uploader.destroy(account.avatar.public_id);
      }

      //Upload new avatar
      const avatarImg = await cloudinary.uploader.upload(avatar.path, {
        folder: "NapoliZza/Avatar",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      });

      //update avatar
      updateAccount.avatar = {
        url: avatarImg.secure_url,
        public_id: avatarImg.public_id
      }

      //delete temp file
      deleteTempFiles([avatar]);
    }

    //update account info
    const account = await Account.findByIdAndUpdate(userID, updateAccount, { new: true });
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }
    res.status(200).json({ success: true, data: account });
  } catch (error) {
    console.error("Error in update account info: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const changePassword = async (req, res) => {
  try {
    const userID = req.user.id;
    const account = await Account.findById(userID);
    //Check if account exist
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }

    //get pass and newpass
    const { password, newpassword } = req.body;

    //Check if password match account password
    const isMatch = await account.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password doesn't match" });
    }

    //Change to new password (account has hash function so we dont need to use it here)
    account.password = newpassword;


    //update account
    await account.save();

    res.status(200).json({ success: true, message: "Account updated sucessfully!" });
  } catch (error) {
    console.error('Error in change password', error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteAccount = async (req, res) => {
  try {
    const userID = req.user.id;
    const account = await Account.findByIdAndDelete(userID);
    if (!account) {
      return res.status(404).json({ success: false, message: "account not found" });
    }
    res.status(200).json({ success: true, message: "Delete account successfully" });
  } catch (error) {
    console.error("Error in delete account: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}