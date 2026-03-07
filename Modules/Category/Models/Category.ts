import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const categorySchema= new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:3,
        maxLength:50
    },
    description:{
        type :String,
        required:true,
        trim:true,
        minlength:3,
    } 
}
,{timestamps:true}
)


export const Category = mongoose.model("Category",categorySchema);