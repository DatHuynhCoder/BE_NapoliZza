import mongoose, { Schema } from "mongoose";

const TableSchema = new Schema({
  status: {type: String, required: true}
},{
  timestamps: true
});

export const Table = mongoose.model('Table', TableSchema);