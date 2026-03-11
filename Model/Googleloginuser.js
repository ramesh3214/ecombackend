import mongoose from "mongoose";

const googleuser = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }
 
  
});

export const Usergoogle = mongoose.model("Googleuser", googleuser);
