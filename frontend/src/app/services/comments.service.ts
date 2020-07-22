import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "../models/post.model";
import { Comment } from "../models/comment.model";
import { AddPostService } from "./add-post.service"
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  url = environment.travelnetCommentURL
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private PostService: AddPostService) {}

  addComment(newComment,postId: string){
    this.http
    .post<{ message: string; comment: Comment }>(
      this.url,
      {commentData: newComment, postId: postId},{
        headers: {}
      }
    ).subscribe(responseData => {
      const comment: Comment = {
        _id: responseData.comment._id,
        date: responseData.comment.date,
        author: responseData.comment.author,
        likes: responseData.comment.likes,
        content: newComment.content,
        replies: responseData.comment.replies,
        edited: responseData.comment.edited,
      };
      console.log(comment)
      //need to update post
      const postIndex = this.PostService.posts.findIndex(p => p.id === postId);
      this.PostService.posts[postIndex].comments.push(comment)
      this.PostService.updatePosts(this.PostService.posts)
  })
}
  /**get all comments associated to a post*/
  getComments() {
    this.http
      .get<{ message: string; comments: any }>(this.url)
      .pipe(
        map(commentData => {
          return commentData.comments.map(comment => {
            return {
              id: comment._id,
              date: comment.date,
              author: comment.author,
              content: comment.content,
              likes: comment.likes,
              replies: comment.replies,
              edited: comment.edited
            };
          });
        })
      )
      .subscribe(transformedComments => {
        // this.posts = transformedPosts;
        // this.postsUpdated.next([...this.posts])/;
      });
  }
  //doesnt even exist lul
  /**get specific comment given its id */
  getComment(commentId: string) {
    return this.http.get<{
      _id: string;
      date: string;
      author: string;
      content: string;
      likes: string[];
      replies: Comment[];
      edited: string
    }>(
      this.url + commentId
    );
  }
  /**reply to head comment */
  reply(postId: string, commentId: string, reply: any){
    const postIndex = this.PostService.posts.findIndex(p => p.id === postId);
    const commentIndex = this.PostService.posts[postIndex].comments.findIndex(c => c._id === commentId)

    this.http
    .post<{ message: string; reply: Comment }>(
      this.url + commentId,
      {commentData:reply, postId: postId})
    .subscribe(responseData => {
      // console.log(responseData.reply)
      this.PostService.posts[postIndex].comments[commentIndex].replies.push(responseData.reply)
      // console.log(this.PostService.posts[postIndex].comments[commentIndex].replies)
      this.PostService.updatePosts(this.PostService.posts)
    })
  }
  /**edit comment */
  editComment(postId: string, commentId: string, newComment: Comment){
    const commentData = new FormData();
    commentData.append("id", newComment._id);
    commentData.append("date", newComment.date);
    commentData.append("author", newComment.author);
    commentData.append("content", newComment.content);
    commentData.append("edited", newComment.edited);
  }
  /**like existing comment */
  /**delete existing comment */


}