import { Comment, CommentReply } from "@prisma/client";

export type ICommentDTO      = Omit<Comment, "recipeId">;
export type ICommentReplyDTO = Omit<CommentReply, "commentId">;

export class CommentDTO implements ICommentDTO {
  public id            : string;
  public authorUsername: string;
  public authorImage   : string;
  public commentText   : string;
  public grade         : number;
  public createdAt     : Date;
  public userId        : string;

  constructor (data: ICommentDTO) {
    this.id             = data.id,
    this.authorImage    = data.authorImage,
    this.authorUsername = data.authorUsername,
    this.commentText    = data.commentText,
    this.grade          = data.grade
    this.createdAt      = data.createdAt
    this.userId         = data.userId
  };
};

export class CommentReplyDTO implements ICommentReplyDTO {
  public id         : string;
  public commentText: string;
  public userId     : string;
  public createdAt  : Date;

  constructor (data: ICommentReplyDTO) {
    this.id          = data.id,
    this.commentText = data.commentText,
    this.userId      = data.userId
    this.createdAt   = data.createdAt
  };
};