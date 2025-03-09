import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  name_account:{
    type: String,
    required: true
  },
  surname:{
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
    enum: ['admin','user','customer','restaurant staff']
  }
},{
  timestamps: true
});

export const Account = mongoose.model('Account', AccountSchema);