import { FormEvent, useEffect, useRef, useState } from "react";
import { BookOpen, Bot, MessageSquareText, Moon, Plus, Search, Sparkles, Sun, ArrowUp } from "lucide-react";

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

type ThemeMode = "light" | "dark";

const starterPrompts = [
  "Who reports directly to Min Cho?",
  "Show me the reporting chain and key finance leaders supporting GTM strategy.",
  "Who has experience with forecasting and budgeting?"
];

const agentHighlights = ["Finance insight", "Forecasting guidance", "Planning support"];

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hello! I can answer questions and help with short tasks. Try one of the suggestions below or ask your own question."
  }
];

const initialRecentChats: string[] = [];
const sidebarNavItems = [
  { id: "new-chat", label: "New chat", icon: Plus },
  { id: "search", label: "Search", icon: Search },
  { id: "library", label: "Library", icon: BookOpen },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "alice", label: "ALICE", icon: Bot }
];

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [recentChats, setRecentChats] = useState<string[]>(initialRecentChats);
  const [activeSidebarItem, setActiveSidebarItem] = useState("new-chat");
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("copilot-theme");
    return storedTheme === "dark" ? "dark" : "light";
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const canSend = input.trim().length > 0 && !isSending;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem("copilot-theme", theme);
  }, [theme]);

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
        throw new Error("The assistant could not answer right now.");
      }

      const data = (await response.json()) as ApiChatMessage;
      await new Promise((resolve) => window.setTimeout(resolve, 1800));

      const assistantId = crypto.randomUUID();
      setMessages((current) => [
        ...current,
        {
          id: assistantId,
          role: "assistant",
          content: ""
        }
      ]);

      const lines = data.content.split("\n");
      for (let index = 0; index < lines.length; index += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 220));
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content: lines.slice(0, index + 1).join("\n") } : message
          )
        );
      }
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

  function startNewChat() {
    const currentTopic = messages
      .filter((message) => message.role === "user")
      .map((message) => message.content.trim())
      .find(Boolean);

    if (currentTopic) {
      setRecentChats((current) => [currentTopic, ...current.filter((item) => item !== currentTopic)].slice(0, 6));
    }

    setMessages(initialMessages);
    setInput("");
    setActiveSidebarItem("new-chat");
    inputRef.current?.focus();
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Past chats">
        <div className="sidebar-top">
          <div className="brand-pill">
            <img className="brand-image" src="/copilot_brand.png" alt="Copilot logo" />
            <h2>Copilot</h2>
          </div>
          <div className="top-actions">
            <button
              className="sidebar-button theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="sidebar-button" type="button" aria-label="New chat" onClick={startNewChat}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="sidebar-section nav-section">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSidebarItem === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${item.id === "new-chat" ? "primary" : ""} ${isActive ? "active" : ""}`}
                onClick={() => {
                  if (item.id === "new-chat") {
                    startNewChat();
                  } else {
                    setActiveSidebarItem(item.id);
                  }
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-section">
          <p className="section-label">Chats</p>
          <div className="chat-list">
            {recentChats.length === 0 ? (
              <div className="chat-empty">No chats yet</div>
            ) : (
              recentChats.map((chat) => (
                <button key={chat} type="button" className="chat-item">
                  <MessageSquareText size={14} />
                  <span>{chat}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      <section className="chat-panel" aria-label="Chat">
        <div className="message-stream" aria-live="polite">
          {messages.length === 1 && (
            <div className="welcome-card">
              <div className="welcome-card-top">
                <div className="welcome-icon">
                  <Sparkles size={18} />
                </div>
                <div className="agent-pill">Agent</div>
              </div>
              <h2>How can I help?</h2>
              <p>Ask a question and I’ll respond with a simple, local answer.</p>
              <div className="agent-section">
                <div className="agent-summary">
                  <p className="agent-label">Finance Research Assistant</p>
                  <h3>Focused on budgets, forecasting, and GTM finance questions.</h3>
                </div>
                <ul className="agent-highlights">
                  {agentHighlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="prompt-row">
                {starterPrompts.map((prompt) => (
                  <button key={prompt} type="button" className="prompt-chip" onClick={() => void sendMessage(prompt)}>
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <article className={`message-row ${message.role}`} key={message.id}>
              <div className="message-bubble">
                <p>{message.content}</p>
              </div>
            </article>
          ))}

          {isSending && (
            <article className="message-row assistant">
              <div className="message-bubble typing">
                <span />
                <span />
                <span />
              </div>
            </article>
          )}
        </div>

        <form className="composer" onSubmit={handleSubmit}>
          <div className="composer-input-wrap">
            <button type="button" className="attach-button" aria-label="Attach file">
              <Plus size={16} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              placeholder="Message Copilot"
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(input);
                }
              }}
            />
            <button type="submit" className="send-button" disabled={!canSend} aria-label="Send message">
              <ArrowUp size={18} />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
