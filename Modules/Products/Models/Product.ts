import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxLength:50
    },
    description:{
        type :String,
        required:true,
        trim:true,
        minlength:3,
    },
    price:{
        type:Number,
        required:true,
        trim:true,
    },
    image:{
        type:Object,
        required:true,
        trim:true,
        default: {
        public_id:null,
        url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ZVqt1vymmkOK6yfJqvJpUpTAHUu0Fxf3VqwevyXI4e6o1OybFw7zHqhMqhY&s"
      },
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true,
        trim:true,
    },
    
},
{timestamps:true});

export const Product = mongoose.model("Product",productSchema);