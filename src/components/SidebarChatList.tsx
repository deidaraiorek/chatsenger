"use client";
import { FC, use, useEffect, useState } from "react";
import { Icons } from "./Icons";
import { Link } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { set } from "zod";
import { chatHrefConstructor, toPusherKey } from "@/lib/utils";
import { pusherClient } from "@/lib/pusher";
import path from "path";
import { toast } from "react-hot-toast";
import UnseenChatToast from "./UnseenChatToast";
import { send } from "process";

interface SidebarChatListProps {
  friends: User[];
  sessionId: string;
}
interface ExtendedMessage extends Message {
  senderName: string;
  senderImage: string;
}
const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }) => {
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const router = useRouter();
  const pathName = usePathname();
  useEffect(() => {
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`));
    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathName !==
        `/dashboard/chat/${chatHrefConstructor(message.senderId, sessionId)}`;
      if (!shouldNotify) {
        return;
      }
      toast.custom((t) => (
        <UnseenChatToast
          t={t}
          sessionId={sessionId}
          senderId={message.senderId}
          senderImage={message.senderImage}
          senderName={message.senderName}
          senderMessage={message.content}
        />
      ));
      setUnseenMessages((prev) => [...prev, message]);
    };
    const friendHandler = () => {
      router.refresh();
    };
    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", friendHandler);
    return () => {
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`));
    };
  }, [pathName, sessionId, router]);

  useEffect(() => {
    if (pathName?.includes("chat")) {
      setUnseenMessages((prev) => {
        const newUnseenMessages = prev.filter(
          (message) => !pathName.includes(message.senderId)
        );
        return newUnseenMessages;
      });
    }
  }, [pathName]);

  return (
    <ul role="list" className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {friends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter(
          (message) => message.senderId === friend.id
        ).length;

        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHrefConstructor(
                friend.id,
                sessionId
              )}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMessagesCount}
                </div>
              ) : (
                ""
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
