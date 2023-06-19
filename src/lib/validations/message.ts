import { z } from "zod";

export const messageValidation = z.object({
  id: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
  timestamp: z.number(),
});

export const messageArrayValidation = z.array(messageValidation);
export type Message = z.infer<typeof messageValidation>;
