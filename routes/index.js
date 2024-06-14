var express = require('express');
var router = express.Router();
// const bcrypt = require('bcrypt.js')
// import bcrypt from "bcryptjs";
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const upload = require('./multer');
const moment = require('moment');
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/loginHere', function(req, res, next) {
  res.render('login',{error:req.flash('error')});
});
router.get('/profile', isLoggedIn ,async function(req,res){
  const user = await userModel.findOne({
    username:req.session.passport.user
  }).populate('posts');
  res.render('profile',{user})
})
router.get("/upload",isLoggedIn,function(req,res,next){
  res.render('upload');
})
router.get("/editprofile",isLoggedIn,async function(req,res,next){
  const user = await userModel.findOne({username:req.session.passport.user});
  res.render('editprofile',{user}); 
})
router.get('/feed', isLoggedIn , async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const posts = await postModel.find().populate("user");
  res.render('feed',{posts,user,moment});
})
router.get('/search',isLoggedIn, function(req,res){
  res.render('search');
})
router.get('/like/post/:id',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const post  = await postModel.findOne({_id: req.params.id});

  //if not liked the post then like it
  if(post.likes.indexOf(user._id) === -1){
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id) , 1);
  }

  await post.save();
  res.redirect('/feed');
})

router.post('/comment/post/:id',isLoggedIn,async function(req,res){
  const user = await userModel.findOne({username:req.session.passport.user});
  const post  = await postModel.findOne({_id: req.params.id});
  const newComment = {
    text:req.body.comment,
    user:user._id,
  };
  if(!newComment.text){
    req.flash('error',"Please enter a comment");
    return res.redirect('/feed')
  }
  post.comments.push(newComment)
  await post.save();

  res.redirect('/feed');
})

  router.get('/commentSection/:id',isLoggedIn, async function(req,res){
    const user = await userModel.findOne({username: req.session.passport.user});
    const post = await postModel.findOne({_id:req.params.id}).populate({
      path:'comments',
      populate:{path:'user',select:'username profileImage'}
    });
    res.render('commentSection',{post,user});
})


router.get('/username/:username',isLoggedIn, async function(req,res){
  const regex = new RegExp(`^${req.params.username}` , 'i');
  const users = await userModel.find({username: regex});
  res.json(users)
});

router.get('/comment/delete/:id/:commentId',isLoggedIn,async function(req,res){
  try{
    const postId = req.params.id;
    const commentId = req.params.commentId;
    await postModel.findOneAndUpdate(
      {_id:postId},
      {$pull:{comments:{_id:commentId}}}
    );
    res.redirect(`/commentSection/${postId}`);
    
  }catch(err){
    console.error(err);
    res.status(500).send({message:'error deleting the comment'})
  }
})


router.get('/post/delete/:id',isLoggedIn,async function(req,res){
  try{
    const postId = req.params.id;
    await postModel.findOneAndDelete({_id:postId});
    res.redirect('/profile')
  }catch(err){
    res.status(500).send({message:'error while deleting post'})
  }
})
router.post('/register',async  function(req,res,next){

  //hashing password
  // const salt = await bcrypt.genSalt(10);
  const userData = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });
  userModel.register(userData,req.body.password)
  .then(function(){
    passport.authenticate('local')(req,res,function(){
      res.redirect('/profile');
    })
  })
});
router.post('/login', passport.authenticate('local',{
  successRedirect: '/feed',
  failureRedirect: '/loginHere',
  failureFlash:true,
}),function(req,res){})

router.get('/logout',function(req,res,next){
  req.logout(function(err){
    if(err) return next(err);
    res.redirect('/loginHere')
  })
})
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/loginHere')
}
router.post('/upload',upload.single('upload-img'),async (req,res)=>{
  if(!req.file){
    return res.status(404).send('no file uploaded');
  }
  const user = await userModel.findOne({username:req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    postCaption:req.body.caption,
    user:user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/feed')
});
router.post('/updateDetails',isLoggedIn,upload.single('profileUpload'), async function(req,res){
  const user = await userModel.findOneAndUpdate({username:req.session.passport.user},
    {name:req.body.fullname , username:req.body.username, email:req.body.email, role:req.body.role, bio:req.body.bio},
    {new:true}
  );
  if(req.file){
    user.profileImage = req.file.filename;
  }
  await user.save();
  res.redirect('/profile');
})
module.exports = router;
