import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Message, User } from "@/types";
import { PostgrestError } from "@supabase/supabase-js";

interface ChatProps {
  user: User;
}

export default function Chat({ user }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 목록 가져오기
  useEffect(() => {
    fetchMessages();

    // Realtime 구독 설정
    // subscribe 함수는 구독을 시작하고, 구독을 해제할 수 있도록 응답값을 줌(구독객체)
    // 이 과정에서 Supabase 서버와의 WebSocket 연결을 수립하여 실시간 이벤트를 수신할 수 있게 함
    const channel = supabase
      .channel("public:messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      )
      .subscribe();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 스크롤을 항상 최신 메시지로 이동
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setMessages(data as Message[]);
      }
    } catch (error: PostgrestError | unknown) {
      const err = error as PostgrestError;
      console.error("메시지를 가져오는 중 오류 발생:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      // 새 메시지 전송
      const { error } = await supabase.from("messages").insert([
        {
          content: newMessage,
          user_id: user.id,
          username: user.username || "익명",
          avatar_url: user.avatar_url,
        },
      ]);

      if (error) {
        throw error;
      }

      setNewMessage("");
    } catch (error: PostgrestError | unknown) {
      const err = error as PostgrestError;
      console.error("메시지 전송 중 오류 발생:", err.message);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-[80vh] bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-xl font-bold">실시간 채팅</h2>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {loading && messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">메시지 로딩 중...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-gray-500">
              아직 메시지가 없습니다. 첫 메시지를 보내보세요!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex mb-4 ${
                message.user_id === user.id ? "justify-end" : "justify-start"
              }`}
            >
              {message.user_id !== user.id && (
                <div className="flex-shrink-0 mr-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {message.avatar_url ? (
                      <img
                        src={message.avatar_url}
                        alt={message.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl text-gray-600">
                        {message.username.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div
                className={`max-w-[70%] ${
                  message.user_id === user.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                } rounded-lg p-3`}
              >
                {message.user_id !== user.id && (
                  <div className="font-medium text-sm mb-1">
                    {message.username}
                  </div>
                )}
                <div className="break-words">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.user_id === user.id
                      ? "text-blue-100"
                      : "text-gray-500"
                  } text-right`}
                >
                  {formatTime(message.created_at)}
                </div>
              </div>

              {message.user_id === user.id && (
                <div className="flex-shrink-0 ml-2">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {message.avatar_url ? (
                      <img
                        src={message.avatar_url}
                        alt={message.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl text-gray-600">
                        {message.username.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-gray-200 p-4">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
