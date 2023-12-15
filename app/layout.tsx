import { supabaseServer } from "@/supabase/server-types";
import { Inter } from "next/font/google";
import React from "react";
import { MessagesContextProvider } from "./context";
import "./globals.css";

const inter = Inter({ weight: "400", subsets: ["latin"] });

export const metadata = {
  title: "NextJS Supabase Demo Chat",
  description: "Your open source chat",
};

export default async function RootLayout({
  children,
  messagePrompt,
}: {
  children: React.ReactNode;
  messagePrompt: React.ReactNode;
}) {
  const supabase = supabaseServer();
  const user = await supabase.auth.getUser();
  const messages = await supabaseServer()
    .from("message")
    .select("*")
    .order("created_at", { ascending: false });

  if (!messages.data) {
    return <>Couldn&apos;t find any messages</>;
  }
  const uniqueUserIds = [...new Set(messages.data?.map((x) => x.user_id))];
  const users = await supabaseServer()
    .from("users")
    .select("*")
    .in("id", uniqueUserIds);

  if (!users.data) {
    return <>Couldn&apos;t find any users</>;
  }

  return (
    <html className="h-full w-full" lang="en">
      <body
        className={
          inter.className +
          " flex min-h-full w-full flex-col bg-white dark:bg-gray-900"
        }
        hx-ext="my-ext"
      >
        {user.data.user ? (
          <MessagesContextProvider
            users={users.data}
            messages={messages.data}
            userId={user.data.user.id}
          >
            <>
              {messagePrompt}
              {children}
            </>
          </MessagesContextProvider>
        ) : (
          <>
            <form method="post" action="api/login">
              <button
                type="submit"
                className="m-auto mb-2 mr-2 inline-flex w-full max-w-lg cursor-pointer items-center rounded-lg bg-[#24292F] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#24292F]/90 focus:outline-none focus:ring-4 focus:ring-[#24292F]/50 dark:hover:bg-[#050708]/30 dark:focus:ring-gray-500"
              >
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                    clipRule="evenodd"
                  />
                </svg>
                Sign in with Github
              </button>
            </form>
          </>
        )}
      </body>
    </html>
  );
}
