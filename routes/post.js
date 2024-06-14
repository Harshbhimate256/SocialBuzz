const { text } = require('express');
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/BlogPost');
// const plm =require('passport-local-mongoose');
const postSchema =new mongoose.Schema({
    postCaption:{
      type:String,
      require: true
    },
    image:{
      type:String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      
    }],
    comments: [{
      text:String,
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
      },
      commentedAt:{
        type:Date,
        default:Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
  })

// postSchema.plugin(plm);

module.exports = mongoose.model("post",postSchema);