const express = require("express");
const Post = require("../models/post");
const Comment = require("../models/post");
const router = express.Router();


/**creates new comment */
router.post(
    "/",
    (req,res,next) => {
    Post.findById(req.body.postId).then(post => {
      if (post){
        const comment ={
          date: req.body.commentData.date,
          author: req.body.commentData.author,
          content: req.body.commentData.content,
          likes: [],
          replies: [],
          edited: null
        }
        post.comments.push(comment)
        post.save().then(post => {
          res.status(201).json({
            message: "comment added successfully",
            comment: {
              id: post.comments[post.comments.length-1]._id,
              date: req.body.commentData.date,
              author: req.body.commentData.author,
              content: req.body.commentData.content,
              likes: [],
              replies: [],
              edited: null
            }
          })
        })
      }
      else(
        res.status(404).json({ message: "Post not found!" })
      )
    })
  })
  /**replies to tree comment */
  router.post(
  "/:id",
  (req,res,next) => {
    Post.findById(req.body.postId).then(post => {
      if (post){
        const reply ={
          date: req.body.commentData.date,
          author: req.body.commentData.author,
          content: req.body.commentData.content,
          likes: [],
          edited: null
        };
        // console.log(reply);
        // console.log(post.comments.id(req.params.id).replies);
        (post.comments.id(req.params.id).replies).push(reply);
        post.save().then(post => {
          // console.log(post);
          res.status(201).json({
            message: "reply added successfully",
            reply: {
              id: post.comments.id(req.params.id).replies[post.comments.id(req.params.id).replies.length-1]._id,
              date: req.body.commentDatadate,
              author: req.body.commentData.author,
              content: req.body.commentData.content,
              likes: [],
              edited: null
            }
          })
        })
      }
      else{
        res.status(404).json({ message: "Comment not found!" })
      }
    })
  })
  /**edits existing comment */
  router.put(
    "/:id",
    (req, res, next) => {
        const comment = new Comment({
          date: req.body.date,
          author: req.body.author,
          content: req.body.content,
          edited: req.body.edited
        })
      try{
        Comment.updateOne({ _id: req.params.id }, comment).then(result => {
          res.status(200).json({ 
              message: "Update successful!",
              comment: {
                id: result._id,
                date: req.body.date,
                author: req.body.author,
                content: req.body.content,
                likes: req.body.likes,
                replies: req.body.replies,
                edited: req.body.edited
                
              }
            },
          );
        });
      } catch (e){
        print(e)
      }
    }
  );
  /**likes existing comment */
  router.put("/like/:id",(req, res, next) => {
    Comment.findById(req.params.id).then(comment => {
      if (comment) {
        if(!comment.likes.includes(req.body.username)){
          comment.likes.push(req.body.username)
        }
        else{
          comment.likes.pop(req.body.username)
        }
        comment.save()
        res.status(200).json({
          message: "like added/removed" ,
          likes : comment.likes
        });
      }
      else{
        res.status(404).json({ message: "comment not found!" });
      }
    })
  })

  /**get all comments associated to a post */
router.get("/:id", (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post.comments);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
});

  /**deletes existing comment */
router.delete("/:id", (req, res, next) => {
    Comment.deleteOne({ _id: req.params.id }).then(result => {
      console.log(result);
      res.status(200).json({ message: "Post deleted!" });
    });
  });
  
  
  module.exports = router;