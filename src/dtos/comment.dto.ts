import { Comment, CommentReply, User } from "@prisma/client";

export type ICommentDTO      = Omit<Comment, "recipeId" | "userId"> & { user: User };
export type ICommentReplyDTO = Omit<CommentReply, "commentId" | "userId"> & { user: User };

export class CommentDTO implements ICommentDTO {
  public id            : string;
  public commentText   : string;
  public grade         : number;
  public createdAt     : Date;
  public user          : User

  constructor (data: ICommentDTO) {
    this.id             = data.id,
    this.commentText    = data.commentText,
    this.grade          = data.grade
    this.createdAt      = data.createdAt
    this.user           = data.user
  };
};

export class CommentReplyDTO implements ICommentReplyDTO {
  public id         : string;
  public commentText: string;
  public user       : User;
  public createdAt  : Date;

  constructor (data: ICommentReplyDTO) {
    this.id          = data.id,
    this.commentText = data.commentText,
    this.user        = data.user,
    this.createdAt   = data.createdAt
  };
};