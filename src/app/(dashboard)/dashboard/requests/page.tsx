import FriendRequests from "@/components/FriendRequests";
import { authOptions } from "@/lib/auth";
import { fetchRedis } from "@/lib/helper/redis";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

const page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  // ids of ppl who sent current logged in user friend requests
  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_request`
  )) as string[];

  const incomingFriendRequest = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      //parse the string to json
      const senderEmail = JSON.parse(sender) as User;

      return {
        senderId,
        senderEmail: senderEmail.email,
      };
    })
  );
  console.log(incomingFriendRequest, "incomingFriendRequest");
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8 "> Add a friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={incomingFriendRequest}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};

export default page;
