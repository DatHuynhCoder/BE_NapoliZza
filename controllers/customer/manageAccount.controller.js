import { Account } from "../../models/account.model.js";
import cloudinary from "../../config/cloudinary.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

export const getAccountById = async (req, res) => {
  try {
    const userID = req.user.id;
    const customer = await Account.findById(userID);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error in get customer: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const updateAccount = async (req, res) => {
  try {
    //Reminder: Please add phone validate later
    //get customer id from request
    const userID = req.user.id;

    //get update customer info from request
    const updateCustomer = req.body;

    //upload avatar
    const avatar = req.file;
    if(avatar){
      const customer = await Account.findById(userID);
      if (!customer) {
        return res.status(404).json({ success: false, message: "Customer not found" });
      }
      //Delete old avatar
      if (customer.avatar && customer.avatar.public_id) {
        await cloudinary.uploader.destroy(customer.avatar.public_id);
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
      updateCustomer.avatar = {
        url: avatarImg.secure_url,
        public_id: avatarImg.public_id
      }

      //delete temp file
      deleteTempFiles([avatar]);
    }

    //update customer info
    const customer = await Account.findByIdAndUpdate(userID, updateCustomer, { new: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error in update customer info: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

export const deleteAccount = async (req, res) => {
  try {
    const userID = req.params.id;
    const customer = await Account.findByIdAndDelete(userID);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.status(200).json({ success: true, message: "Delete customer successfully" });
  } catch (error) {
    console.error("Error in delete customer: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}