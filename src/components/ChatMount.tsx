"use client";

import { ChatWidget } from "./ChatWidget";

/** Kept as a client boundary so the widget can live in the server layout. */
export function ChatMount() {
  return <ChatWidget />;
}
