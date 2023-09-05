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

export const MessageContext = createContext<{
  messages: Row<"public", "message">[];
  addMessage: (message: Row<"public", "message">) => void;
  getProfileOfMessage: (message: Row<"public", "message">) => User;
  userId: string;
}>({
  messages: [],
  addMessage: () => {},
  getProfileOfMessage: () => ({ id: "", full_name: "", img_url: "" }),
  userId: "",
});

export const MessagesContextProvider = (props: {
  children: React.ReactNode;
  userId: string;
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Row<"public", "message">[]>([]);
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);

  useEffect(() => {
    supabaseClient
      .from("message")
      .select("*")
      .order("created_at", { ascending: false })
      .then(async (messages) => {
        if (!messages.data) {
          return;
        }
        const uniqueUserIds = [
          ...new Set(messages.data?.map((x) => x.user_id)),
        ];
        const users = await supabaseClient
          .from("users")
          .select("*")
          .in("id", uniqueUserIds);
        if (users.data) {
          setUsers(users.data);
        }
        setMessages(messages.data);
      });
  }, []);

  const addMessage = useCallback((newMessage: Row<"public", "message">) => {
    setMessages((messages) => {
      const newMessages = [newMessage, ...messages];
      return newMessages;
    });
  }, []);

  const handleMessagePayload = (
    payload: RealtimePostgresChangesPayload<Row<"public", "message">>
  ) => {
    console.log("message payload", payload);
    switch (payload.eventType) {
      case "INSERT":
        addMessage(payload.new);
        break;
      case "UPDATE":
        setMessages((messages) => {
          const newMessages = [...messages];
          const messageIndex = newMessages.findIndex(
            (m) => m.id === payload.new.id
          );
          newMessages[messageIndex] = payload.new;
          return newMessages;
        });
        break;
      case "DELETE":
        setMessages((messages) => {
          const newMessages = messages.filter((message) => {
            return message.id === payload.old.id;
          });
          return newMessages;
        });
        break;
    }
  };

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
  }, []);

  const getProfileOfMessage = useCallback(
    (message: Row<"public", "message">) => {
      const userId = message.user_id;
      let user: User | null | undefined = users.find((x) => x.id === userId);

      if (user) {
        return user;
      }

      setUsers((users) => {
        const newUsers = [
          ...users,
          { id: userId, img_url: null, full_name: null },
        ];
        return newUsers;
      });

      supabaseClient
        .from("users")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .single()
        .then((x) => {
          setUsers((users) => {
            const newUsers = [...users, x.data!];
            return newUsers;
          });
        });

      return { id: "", full_name: "Unknown User", img_url: "" };
    },
    [users]
  );

  return (
    <MessageContext.Provider
      value={{
        addMessage,
        messages,
        getProfileOfMessage,
        userId: props.userId,
      }}
    >
      {props.children}
    </MessageContext.Provider>
  );
};

export const useMessageProvider = () => useContext(MessageContext);
