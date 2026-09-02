"use client";

import { SessionProvider } from "next-auth/react";
import { ChatWidget } from "./ChatWidget";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <ChatWidget />
    </SessionProvider>
  );
}
