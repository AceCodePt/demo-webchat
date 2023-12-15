"use client";
import { supabaseClient } from "@/supabase/client-types";
import { Row } from "@/util/database-util.types";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type User = {
  id: string | null;
  full_name: string | null;
  img_url: string | null;
};

export type ChatMessageContextType = {
  getMessages: () => (Row<"public", "message"> & { user: User })[];
  addMessage: (message: Row<"public", "message">) => void;
  getProfileOfMessage: (message: Row<"public", "message">) => User | undefined;
  userId: string;
};

export const ChatMessageContext = createContext<ChatMessageContextType>({
  getMessages: () => [],
  addMessage: () => {},
  getProfileOfMessage: () => ({ id: "", full_name: "", img_url: "" }),
  userId: "",
});

export const MessagesContextProvider = (props: {
  children: React.ReactNode;
  messages: Row<"public", "message">[];
  users: User[];
  userId: string;
}) => {
  const [users, setUsers] = useState<User[]>(props.users);
  const [messages, setMessages] = useState<Row<"public", "message">[]>(
    props.messages
  );
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);

  const addMessage = useCallback(
    (newMessage: Row<"public", "message">) => {
      setMessages((prevMessages) => {
        const newMessages = [newMessage, ...prevMessages];
        console.log("adD", newMessages);
        return newMessages;
      });
    },
    [setMessages]
  );

  const updateMessage = useCallback(
    (newMessage: Row<"public", "message">) => {
      setMessages((prevMessages) => {
        const messageIndex = prevMessages.findIndex(
          (m) => m.id === newMessage.id
        );
        return prevMessages.with(messageIndex, newMessage);
      });
    },
    [setMessages]
  );

  const deleteMessage = useCallback(
    (deletedMessageId?: number) => {
      setMessages((messages) => {
        const newMessages = messages.filter((message) => {
          return message.id !== deletedMessageId;
        });
        return newMessages;
      });
    },
    [setMessages]
  );

  const handleMessagePayload = useCallback(
    (payload: RealtimePostgresChangesPayload<Row<"public", "message">>) => {
      switch (payload.eventType) {
        case "INSERT":
          addMessage(payload.new);
          break;
        case "UPDATE":
          updateMessage(payload.new);
          break;
        case "DELETE":
          deleteMessage(payload.old.id);
          break;
      }
    },
    [addMessage, updateMessage, deleteMessage]
  );

  useEffect(() => {
    if (!realtimeChannel) {
      setRealtimeChannel(
        supabaseClient
          .channel(`listening to everything`)
          .on<Row<"public", "message">>(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "message",
            },
            handleMessagePayload
          )
          .subscribe((status) =>
            console.log("chat message subscription", status)
          )
      );
    }
    return () => {
      realtimeChannel?.unsubscribe();
    };
  }, [handleMessagePayload, realtimeChannel]);

  const getProfileOfMessage = useCallback(
    (message: Row<"public", "message">) => {
      const userId = message.user_id;
      let user: User | null | undefined = users.find((x) => x.id === userId);

      return user;
    },
    [users]
  );

  const addUser = useCallback(
    async (userId: string) => {
      const { data: user } = await supabaseClient
        .from("users")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .single();

      if (!user || !user.id || !user.full_name || !user.img_url) {
        return;
      }
      setUsers((prevUsers) => {
        const userIndex = prevUsers.findIndex(
          (prevUser) => prevUser.id === user.id
        );
        if (userIndex >= 0) {
          return prevUsers.with(userIndex, user);
        }
        return [...prevUsers, user];
      });
    },
    [setUsers]
  );

  const getMessages: ChatMessageContextType["getMessages"] = useCallback(() => {
    console.log("get messages", messages);
    return messages.flatMap((message) => {
      const user = getProfileOfMessage(message);
      if (!user) {
        addUser(message.user_id);
        return [];
      }
      return [{ ...message, user }];
    });
  }, [messages, addUser, getProfileOfMessage]);

  return (
    <ChatMessageContext.Provider
      value={{
        addMessage,
        getMessages,
        getProfileOfMessage,
        userId: props.userId,
      }}
    >
      {props.children}
    </ChatMessageContext.Provider>
  );
};

export const useChatMessageProvider = () => useContext(ChatMessageContext);
