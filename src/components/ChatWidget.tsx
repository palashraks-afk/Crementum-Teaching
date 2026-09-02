"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import styles from "./ChatWidget.module.css";

type Message = { role: "user" | "assistant"; content: string };

const GREETING = "Hi — what class are you stuck on?";

/** Shown until the student sends something, so the box is never a blank prompt. */
const QUICK_REPLIES = ["Book a session", "What subjects?", "Is it really free?"];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: GREETING },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-8),
          page: pathname,
        }),
      });
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.reply ?? "Say that again?" }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "I dropped out. Email crementumteaching@gmail.com." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showQuickReplies = messages.length === 1 && !loading;

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            className={styles.panel}
            role="dialog"
            aria-label="Chat with Crementum"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.26, ease: [0.2, 0.7, 0.3, 1] }}
          >
            <header className={styles.header}>
              <span className={styles.avatar}>
                <Logo size={26} showText={false} />
              </span>
              <span className={styles.who}>
                <strong className={styles.name}>Crementum</strong>
                <span className={styles.status}>
                  <i className={styles.dot} aria-hidden="true" />
                  Online
                </span>
              </span>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path
                    d="M2 2l10 10M12 2L2 12"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <div className={styles.messages}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={styles.line}
                  data-role={m.role}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {m.role === "assistant" ? (
                    <span className={styles.bubbleAvatar} aria-hidden="true">
                      <Logo size={18} showText={false} />
                    </span>
                  ) : null}
                  <p className={styles.bubble}>{m.content}</p>
                </motion.div>
              ))}

              {loading ? (
                <div className={styles.line} data-role="assistant">
                  <span className={styles.bubbleAvatar} aria-hidden="true">
                    <Logo size={18} showText={false} />
                  </span>
                  <p className={`${styles.bubble} ${styles.typing}`} aria-label="Typing">
                    <i />
                    <i />
                    <i />
                  </p>
                </div>
              ) : null}

              {showQuickReplies ? (
                <div className={styles.quick}>
                  {QUICK_REPLIES.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      className={styles.chip}
                      onClick={() => send(reply)}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>

            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message…"
                aria-label="Message"
              />
              <button
                type="submit"
                className={styles.send}
                disabled={loading || !input.trim()}
                aria-label="Send"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M2 8h10M8 3l5 5-5 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Chat with Crementum"}
      >
        {open ? (
          <svg className={styles.fabIcon} viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <>
            <span className={styles.ping} aria-hidden="true" />
            <Logo size={30} showText={false} />
          </>
        )}
      </motion.button>
    </>
  );
}
