import { z } from "zod";

export const CreateNotitficationSchema = z.object({
  userId              : z.string(),
  type                : z.string(),
  noficitaionCreatorId: z.string(),
  noficationData      : z.string(),
  recipeId            : z.string(),
  createdAt           : z.date().default(() => new Date())
});

export type ICreateNotificationSchema = z.infer<typeof CreateNotitficationSchema>;