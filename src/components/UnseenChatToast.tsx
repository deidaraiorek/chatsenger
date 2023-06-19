import { chatHrefConstructor, cn } from "@/lib/utils";
import Image from "next/image";
import { FC } from "react";
import { toast, type Toast } from "react-hot-toast";

interface UnseenChatToastProps {
  t: Toast;
  sessionId: string;
  senderId: string;
  senderImage: string;
  senderName: string;
  senderMessage: string;
}

const UnseenChatToast: FC<UnseenChatToastProps> = ({
  t,
  sessionId,
  senderId,
  senderImage,
  senderName,
  senderMessage,
}) => {
  console.log(senderImage);
  return (
    <div
      className={cn(
        "max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
        {
          "animate-enter": t.visible,
          "animate-leave": !t.visible,
        }
      )}
    >
      <a
        onClick={() => toast.dismiss(t.id)}
        href={`/dashboard/chat/${chatHrefConstructor(sessionId, senderId)}`}
        className="flex flex-1 w-0 p-4"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="relative h-10 w-10">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={senderImage}
                alt="Sender Image"
                className="rounded-full"
              />
            </div>
          </div>

          <div className="ml-3 flex-1 ">
            <p className="text-sm font-medium text-gray-900">{senderName}</p>
            <p className="mt-1 text-sm text-gray-500">{senderMessage}</p>
          </div>
        </div>
      </a>

      <div className="flex border-1 border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex items-center justify-center w-12 h-12 text-gray-400 hover:text-gray-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UnseenChatToast;
