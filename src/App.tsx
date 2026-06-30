import { FormEvent, useMemo, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  Menu,
  PanelLeft,
  Plus,
  SendHorizontal,
  Sparkles,
  UserRound
} from "lucide-react";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type ApiChatMessage = {
  id: string;
  role: "assistant";
  content: string;
  createdAt: string;
};

const starterPrompts = [
  "Summarize the capstone project goals",
  "Draft an email update for my team",
  "Give me a plan for building a React dashboard",
  "Explain how this mock chatbot works"
];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hi, I am your mock Copilot. Ask me to summarize, draft, plan, or explain something and I will return a local simulated response."
  }
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canSend = input.trim().length > 0 && !isSending;
  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages]
  );

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages })
      });

      if (!response.ok) {
        throw new Error("The mock assistant could not answer right now.");
      }

      const data = (await response.json()) as ApiChatMessage;
      setMessages((current) => [
        ...current,
        {
          id: data.id,
          role: "assistant",
          content: data.content
        }
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected chat error.";
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${message} Check that the TypeScript backend is running on port 5050.`
        }
      ]);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  async function copyMessage(message: ChatMessage) {
    await navigator.clipboard.writeText(message.content);
    setCopiedMessageId(message.id);
    window.setTimeout(() => setCopiedMessageId(null), 1400);
  }

  function resetChat() {
    setMessages(initialMessages);
    setInput("");
    inputRef.current?.focus();
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Chat navigation">
        <div className="brand-row">
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={18} />
          </span>
          <div>
            <strong>Mock Copilot</strong>
            <span>Local assistant</span>
          </div>
        </div>

        <button className="new-chat-button" type="button" onClick={resetChat}>
          <Plus size={18} />
          New chat
        </button>

        <nav className="prompt-list" aria-label="Suggested prompts">
          {starterPrompts.map((prompt) => (
            <button key={prompt} type="button" onClick={() => void sendMessage(prompt)}>
              {prompt}
            </button>
          ))}
        </nav>
      </aside>

      <section className="chat-panel" aria-label="Mock Copilot chat">
        <header className="topbar">
          <button className="icon-button mobile-only" type="button" aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="topbar-title">
            <Bot size={22} />
            <div>
              <h1>Mock Microsoft Copilot Chatbot</h1>
              <p>React frontend with a TypeScript mock API</p>
            </div>
          </div>
          <button className="icon-button" type="button" aria-label="Toggle side panel">
            <PanelLeft size={20} />
          </button>
        </header>

        <div className="message-stream" aria-live="polite">
          {messages.map((message) => (
            <article className={`message-row ${message.role}`} key={message.id}>
              <div className="avatar" aria-hidden="true">
                {message.role === "assistant" ? <Sparkles size={18} /> : <UserRound size={18} />}
              </div>
              <div className="message-bubble">
                <div className="message-meta">
                  <strong>{message.role === "assistant" ? "Copilot" : "You"}</strong>
                  {message.role === "assistant" && (
                    <button
                      className="copy-button"
                      type="button"
                      onClick={() => void copyMessage(message)}
                      aria-label="Copy assistant message"
                    >
                      {copiedMessageId === message.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
                <p>{message.content}</p>
              </div>
            </article>
          ))}

          {isSending && (
            <article className="message-row assistant">
              <div className="avatar" aria-hidden="true">
                <Sparkles size={18} />
              </div>
              <div className="message-bubble typing">
                <span />
                <span />
                <span />
              </div>
            </article>
          )}
        </div>

        <footer className="composer-wrap">
          <div className="context-strip">
            <span>Latest answer</span>
            <strong>{latestAssistantMessage?.content.split("\n")[0]}</strong>
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              placeholder="Message mock Copilot"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
            />
            <button type="submit" disabled={!canSend} aria-label="Send message">
              <SendHorizontal size={20} />
            </button>
          </form>
        </footer>
      </section>
    </main>
  );
}
