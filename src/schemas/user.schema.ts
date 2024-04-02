import { z } from "zod";

export const UdpateUserInfoSchema = z.object({
  username       : z.string().max(32),
  name           : z.string().max(32),
  image          : z.string(),
  backgroundImage: z.string(),
});

export const FollowSchema = z.object({
  followerId: z.string(),
  userId    : z.string(),
});

export type IUpdateUserInfoSchema = z.infer<typeof UdpateUserInfoSchema>;
export type IFollowSchema         = z.infer<typeof FollowSchema>;