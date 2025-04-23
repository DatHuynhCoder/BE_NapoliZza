import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AccountSchema = new mongoose.Schema({
  username:{
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required:true
  },
  gender: {
    type: String,
    enum: ['Nam','Nữ','Không tiện tiết lộ']
  },
  birthday: {
    type: Date,
    required: true
  },
  avatar: {
    url: String,
    public_id: String
  },
  role: {
    type: String,
    enum: ['admin','customer'],
    default: 'customer'
  },
},{
  timestamps: true
});

AccountSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

AccountSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Account = mongoose.model('Account', AccountSchema);