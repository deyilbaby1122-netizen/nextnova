"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCompareIds } from "@/lib/compare-store";
import { useProducts } from "@/lib/store";
import type { ChatProduct } from "@/lib/assistant";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  slugs?: string[];
  pending?: boolean;
}

const WELCOME =
  "Hi! I'm the NextNova assistant. Ask me about anything in the catalogue — prices, specs, launch dates or how to buy.";

const SUGGESTIONS = [
  "What can I buy under $500?",
  "Which humanoid robots are available?",
  "What launches in 2027?",
  "How does checkout work?",
];

// Counter only (no timestamps) so the first render is identical on server and client.
let counter = 0;
const nextId = () => `m-${counter++}`;

export function ChatWidget() {
  const products = useProducts();
  const compareIds = useCompareIds();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "m-welcome", role: "assistant", text: WELCOME },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const offset = compareIds.length > 0 ? "bottom-24 sm:bottom-28" : "bottom-5";

  useEffect(() => {
    const element = listRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;

    setInput("");
    setMessages((current) => [
      ...current,
      { id: nextId(), role: "user", text: message },
      { id: nextId(), role: "assistant", text: "", pending: true },
    ]);
    setBusy(true);

    const catalog: ChatProduct[] = products.map((product) => ({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      status: product.status,
      price: product.price,
      tagline: product.tagline,
      priceNote: product.priceNote,
      expectedLaunch: product.expectedLaunch,
      buyUrl: product.buyUrl,
      tags: product.tags,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, catalog }),
      });
      const data = (await response.json()) as { reply?: string; slugs?: string[] };
      const reply = data.reply ?? "Sorry — I could not process that. Please try again.";
      setMessages((current) =>
        current.map((item) =>
          item.pending ? { ...item, pending: false, text: reply, slugs: data.slugs ?? [] } : item,
        ),
      );
    } catch {
      setMessages((current) =>
        current.map((item) =>
          item.pending
            ? {
                ...item,
                pending: false,
                text: "I'm offline right now — the chat endpoint did not respond. Try reloading the page.",
              }
            : item,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* launcher */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        className={`fixed ${offset} right-4 z-[60] flex h-14 items-center gap-2 rounded-full border border-accent/50 bg-surface px-4 text-sm font-bold text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)] transition hover:border-accent sm:right-6`}
      >
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-base text-bg">
          ✦
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-surface" />
        </span>
        <span className="hidden sm:inline">Ask the assistant</span>
      </button>

      {/* panel */}
      {open ? (
        <section
          role="dialog"
          aria-label="NextNova AI assistant"
          className={`fixed right-3 z-[60] flex w-[min(94vw,25rem)] flex-col overflow-hidden rounded-3xl border border-accent/40 bg-elev shadow-[0_30px_80px_-30px_rgba(0,0,0,1)] sm:right-6`}
          style={{
            bottom: compareIds.length > 0 ? "6.5rem" : "1.25rem",
            height: "min(72vh, 34rem)",
          }}
        >
          <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm text-bg">
              ✦
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">NextNova Assistant</p>
              <p className="text-[11px] text-muted">
                {busy ? "Thinking…" : "Catalogue-aware · replies instantly"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="grid h-8 w-8 place-items-center rounded-full border border-line text-muted hover:text-ink"
            >
              ✕
            </button>
          </header>

          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            className="scroll-thin flex-1 space-y-4 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <Bubble key={message.id} message={message} onNavigate={() => setOpen(false)} />
            ))}

            {messages.length <= 1 && !busy ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-line bg-surface px-3 py-3"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Message the assistant
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a product…"
              maxLength={600}
              className="min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Send message"
              className="btn-primary grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold disabled:opacity-45"
            >
              ➤
            </button>
          </form>
        </section>
      ) : null}
    </>
  );
}

function Bubble({ message, onNavigate }: { message: Message; onNavigate: () => void }) {
  const isUser = message.role === "user";

  if (message.pending) {
    return (
      <div className="flex justify-start">
        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent/70 [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent/40 [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-md bg-accent text-bg"
            : "rounded-tl-md border border-line bg-surface text-ink"
        }`}
      >
        {message.text}
      </div>

      {message.slugs && message.slugs.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {message.slugs.map((slug) => (
            <Link
              key={slug}
              href={`/products/${slug}`}
              onClick={onNavigate}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
            >
              View product →
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
