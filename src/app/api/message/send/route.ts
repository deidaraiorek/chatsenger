import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { fetchRedis } from "@/lib/helper/redis";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
import { messageValidation } from "@/lib/validations/message";
import { time } from "console";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

export async function POST(req: Request) {
  try {
    const { text, chatId } = await req.json();
    const session = await getServerSession(authOptions);
    if (!session) return new Response("Unauthorized", { status: 401 });
    const [userId1, userId2] = chatId.split("--");
    if (!userId1 || !userId2)
      return new Response("Bad Request", { status: 400 });
    if (userId1 !== session.user.id && userId2 !== session.user.id)
      return new Response("Unauthorized", { status: 401 });
    const friendId = session.user.id === userId1 ? userId2 : userId1;
    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];
    const isFriend = friendList.includes(friendId);
    if (!isFriend) return new Response("Unauthorized", { status: 401 });
    const rewSender = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(rewSender) as User;
    const timestamp = Date.now();
    const messageData: Message = {
      id: nanoid(),
      senderId: session.user.id,
      receiverId: friendId,
      content: text,
      timestamp,
    };
    const message = messageValidation.parse(messageData);
    //notify all connected chat room clients
    pusherServer.trigger(
      toPusherKey(`chat:${chatId}:messages`),
      "incoming_message",
      message
    );
    pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), "new_message", {
      ...message,
      senderName: sender.name,
      senderImage: sender.image,
    });
    // All valid, send message
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });
    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
