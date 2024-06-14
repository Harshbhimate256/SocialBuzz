const mongoose = require('mongoose');
const userModel = require('./routes/users');

mongoose.connect('mongodb://127.0.0.1:27017/BlogPost', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixNullUsernames() {
  try {
    const users = await userModel.find({ username: null });

    for (const user of users) {
      user.username = `user_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;
      await user.save();
    }

    console.log('Null usernames fixed');
  } catch (error) {
    console.error('Error fixing null usernames:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixNullUsernames();
