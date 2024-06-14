const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/BlogPost');
const plm =require('passport-local-mongoose');

const userSchema =new mongoose.Schema({
  username: {
    type:String,
    require: true,  
  },
  name: String,
  email: {
    type:String,
    require: true,
  },
  bio:{
    type:String,
  },
  role:{
    type:String,
  },
  password:String,
  posts:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'post'
  }],
  profileImage:{
    type:String
  }

})

userSchema.plugin(plm);

module.exports = mongoose.model("User",userSchema);