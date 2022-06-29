const express = require('express');
const mongoose = require("mongoose");
const path = require('path');
const router = express.Router();
// "mongodb://localhost:27017/WikiBiologyComment"
//mongodb://admin:admin@ac-xcb6fsi-shard-00-00.vmnjmd8.mongodb.net:27017,ac-xcb6fsi-shard-00-01.vmnjmd8.mongodb.net:27017,ac-xcb6fsi-shard-00-02.vmnjmd8.mongodb.net:27017/WikiBiologyComment?ssl=true&replicaSet=atlas-1dao57-shard-0&authSource=admin&retryWrites=true&w=majority
const db_temp = process.env.MONGODB_URI;
mongoose.connect(db_temp, {useNewUrlParser: true, useUnifiedTopology: true});
console.log(db_temp);
const db = mongoose.connection;
db.on("error", error => {
  console.log(error);
})
db.once("open", () => {
  console.log("Connected to database");
})

const CommentSchema = mongoose.Schema({
  user: String,
  message: String,
  likes: Number,
  editable: Boolean,
  replies: [{
    user: String,
    message: String,
    likes: Number
  }]
});

const CommentsModel = mongoose.model("Comment", CommentSchema);

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
// Handle routes

app.use(express.static((path.join(__dirname + "/build"))))
app.use(express.static('build/static'))

// Get document from the collection. LImited by the data sent in the POST request
app.get("/", (req, res) => {
  res.sendFile('/index.html');
})

app.post("/get-data", (req, res) => {
  CommentsModel.find({}, (err, data) => {
    console.log(req.body);
    if(err){
      console.log(err);
    } else {
      res.send(data);
    }
  }).limit(req.body.limitNum)
});

// user create new comment from top comment box
app.post("/new-comment", (req, res) => {
  let messageData = req.body.messageData;
  const newMessage = new CommentsModel({
    user: "Super user",
    message: messageData,
    likes: 0,
    editable: true,
    replies: []
  }).save();

  // send back empty data so we can use Promise
  res.send('');
})

// Intersection Observer wants more data
app.post("/get-more-data", (req,res) => {
  let commentIncrement = req.body.commentIncrement;
  CommentsModel.find({}, (err, data) => {
    if(err){
      console.log(err);
    } else {
      res.send(data)
    }
  }).skip(commentIncrement).limit(10)
})

app.listen(5000 || process.env.PORT, () => console.log("server runs on port 5000"));
