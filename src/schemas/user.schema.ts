import { z } from "zod";

export const UdpateUserInfoSchema = z.object({
  username       : z.string().max(32),
  name           : z.string().max(32),
  image          : z.string(),
  backgroundImage: z.string(),
  isPrivate      : z.boolean(),
});

export const FollowSchema = z.object({
  followerId: z.string(),
  userId    : z.string(),
});

export const CreateFollowRequest = z.object({
  requesterId: z.string(),
  requestedId: z.string(),
});

export type IUpdateUserInfoSchema      = z.infer<typeof UdpateUserInfoSchema>;
export type IFollowSchema              = z.infer<typeof FollowSchema>;
export type ICreateFollowRequestSchema = z.infer<typeof CreateFollowRequest>;