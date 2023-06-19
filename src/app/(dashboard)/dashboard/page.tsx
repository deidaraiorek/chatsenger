import { authOptions } from "@/lib/auth";
import { getFriendsByUserId } from "@/lib/helper/getFriendByUserId";
import { fetchRedis } from "@/lib/helper/redis";
import { chatHrefConstructor } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

const page = async ({}) => {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const friends = await getFriendsByUserId(session.user.id);
  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageRaw] = (await fetchRedis(
        "zrange",
        `chat:${chatHrefConstructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];

      const lastMessage = JSON.parse(lastMessageRaw) as Message;
      return {
        ...friend,
        lastMessage,
      };
    })
  );
  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl mb-8">Recent chats</h1>
      {friendsWithLastMessage.length === 0 ? (
        <div className="text-2xl text-gray-500">Nothing new to show here</div>
      ) : (
        friendsWithLastMessage.map((friend) => (
          <div
            key={friend.id}
            className="
        relative p-3 rounded-md space-y-3"
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="w-7 h-7 " />
            </div>
            <Link
              href={`/dashboard/chat/${chatHrefConstructor(
                session.user.id,
                friend.id
              )}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    className="rounded-full "
                    alt="Profile picture"
                    fill
                    src={friend.image}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <p className="mt-1 max-w-md">
                  <span className="">
                    {friend.lastMessage?.senderId === session.user.id
                      ? "You: "
                      : ""}
                  </span>
                  {friend.lastMessage?.content}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default page;
