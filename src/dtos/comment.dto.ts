import { Comment } from "@prisma/client";

export type ICommentDTO = Omit<Comment, "recipeId">;

export class CommentDTO implements ICommentDTO {
  public id            : string;
  public authorUsername: string;
  public authorImage   : string;
  public commentText   : string;
  public grade         : number;
  public createdAt     : Date;

  constructor (data: ICommentDTO) {
    this.id             = data.id,
    this.authorImage    = data.authorImage,
    this.authorUsername = data.authorUsername,
    this.commentText    = data.commentText,
    this.grade          = data.grade
    this.createdAt      = data.createdAt
  };
};