import { FormEvent, useEffect, useRef, useState } from "react";
import {
  AudioLines,
  BarChart3,
  BookOpen,
  Bot,
  Braces,
  Edit3,
  Ellipsis,
  Grid3X3,
  Lightbulb,
  Mic,
  Minus,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  X
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

type ThemeMode = "light" | "dark";

const quickFilters = ["Files", "Emails", "People", "Meetings"];

const agentItems = [
  { label: "Researcher", icon: "researcher" },
  { label: "Analyst", icon: "analyst" },
  { label: "Data Analysis Partner", icon: "data" },
  { label: "Power BI Report Assistant", icon: "power" },
  { label: "Idea Coach", icon: "idea" }
];

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
  { id: "library", label: "Library", icon: BookOpen }
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

  function renderAgentIcon(icon: string) {
    if (icon === "analyst") {
      return (
        <span className="agent-icon analyst-icon" aria-hidden="true">
          <BarChart3 size={15} />
        </span>
      );
    }

    if (icon === "data" || icon === "power") {
      return (
        <span className="agent-icon code-icon" aria-hidden="true">
          <Braces size={15} />
        </span>
      );
    }

    if (icon === "idea") {
      return (
        <span className="agent-icon idea-icon" aria-hidden="true">
          <Lightbulb size={15} />
        </span>
      );
    }

    return <span className="agent-icon researcher-icon" aria-hidden="true" />;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Past chats">
        <div className="sidebar-top">
          <div className="brand-pill">
            <img className="brand-image" src="/copilot_brand.png" alt="Copilot logo" />
          </div>
          <button className="icon-button app-grid-button" type="button" aria-label="Apps">
            <Grid3X3 size={19} strokeWidth={2.2} />
          </button>
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
                <span className={`nav-icon ${item.id === "new-chat" ? "new-chat-icon" : ""}`}>
                  <Icon size={item.id === "library" ? 18 : 17} strokeWidth={1.8} />
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-section agents-section">
          <p className="section-label">Agents</p>
          <div className="agent-list">
            {agentItems.map((agent) => (
              <button key={agent.label} type="button" className="agent-link">
                {renderAgentIcon(agent.icon)}
                <span>{agent.label}</span>
              </button>
            ))}
            <button type="button" className="agent-link">
              <span className="agent-icon line-icon" aria-hidden="true">
                <Bot size={18} />
              </span>
              <span>New agent</span>
            </button>
            <button type="button" className="agent-link">
              <span className="agent-icon plain-icon" aria-hidden="true">
                <Ellipsis size={18} />
              </span>
              <span>More agents</span>
            </button>
          </div>
        </div>

        <div className="sidebar-section chats-section">
          <p className="section-label">Chats</p>
          {recentChats.length > 0 && (
            <div className="chat-list">
              {recentChats.map((chat) => (
                <button key={chat} type="button" className="chat-item">
                  <span>{chat}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="profile-row">
          <span className="avatar">CM</span>
          <span>Cho, Min</span>
          <button className="icon-button profile-menu" type="button" aria-label="Profile options">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>

      <section className="chat-panel" aria-label="Chat">
        <header className="workspace-topbar">
          <div className="mode-toggle" aria-label="Mode">
            <button type="button" className="mode-button active">
              Work
            </button>
            <button type="button" className="mode-button">
              Web
            </button>
          </div>

          <div className="right-toolbar">
            <button
              className={`switch-button ${theme === "dark" ? "on" : ""}`}
              type="button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              onClick={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
            >
              <span />
            </button>
            <button className="auto-button" type="button">
              Auto
              <span aria-hidden="true">⌄</span>
            </button>
            <div className="compose-split">
              <button className="compose-button" type="button" aria-label="New message" onClick={startNewChat}>
                <Edit3 size={17} />
              </button>
              <button className="compose-chevron" type="button" aria-label="More compose options">
                ⌄
              </button>
            </div>
            <button className="icon-button status-button" type="button" aria-label="Security status">
              <ShieldCheck size={18} />
            </button>
            <button className="icon-button" type="button" aria-label="More options">
              <MoreHorizontal size={19} />
            </button>
          </div>

          <div className="window-controls" aria-hidden="true">
            <Minus size={16} />
            <span className="window-square" />
            <X size={16} />
          </div>
        </header>

        <div className="workspace-body">
          {messages.length === 1 ? (
            <div className="home-layout">
              <h1>What can I help you with?</h1>

              <form className="composer" onSubmit={handleSubmit}>
                <div className="composer-input-wrap">
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
                  <div className="composer-actions">
                    <button type="button" className="attach-button" aria-label="Attach file">
                      <Plus size={28} strokeWidth={1.4} />
                    </button>
                    <div className="composer-right-actions">
                      <button type="button" className="mic-button" aria-label="Voice input">
                        <Mic size={22} strokeWidth={1.9} />
                      </button>
                      <button type="submit" className="voice-button" disabled={!canSend} aria-label="Send message">
                        <AudioLines size={24} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="prompt-row">
                {quickFilters.map((item) => (
                  <button key={item} type="button" className="prompt-chip">
                    {item}
                  </button>
                ))}
                <button type="button" className="prompt-chip icon-chip" aria-label="More suggestions">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="conversation-layout">
              <div className="message-stream" aria-live="polite">
                {messages
                  .filter((message) => message.id !== "welcome")
                  .map((message) => (
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

              <form className="composer compact-composer" onSubmit={handleSubmit}>
                <div className="composer-input-wrap">
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
                  <div className="composer-actions">
                    <button type="button" className="attach-button" aria-label="Attach file">
                      <Plus size={28} strokeWidth={1.4} />
                    </button>
                    <div className="composer-right-actions">
                      <button type="button" className="mic-button" aria-label="Voice input">
                        <Mic size={22} strokeWidth={1.9} />
                      </button>
                      <button type="submit" className="voice-button" disabled={!canSend} aria-label="Send message">
                        <AudioLines size={24} strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
