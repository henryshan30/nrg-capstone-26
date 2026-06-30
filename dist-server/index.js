import cors from "cors";
import dotenv from "dotenv";
import express from "express";
dotenv.config();
const app = express();
const port = Number(process.env.PORT ?? 5050);
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "mock-copilot-api" });
});
app.post("/api/chat", (req, res) => {
    const messages = req.body.messages ?? [];
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
    if (!latestUserMessage?.content.trim()) {
        return res.status(400).json({ error: "A non-empty user message is required." });
    }
    const reply = buildMockCopilotReply(latestUserMessage.content, messages);
    res.json({
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString()
    });
});
function buildMockCopilotReply(prompt, history) {
    const normalized = prompt.toLowerCase();
    const priorUserTurns = history.filter((message) => message.role === "user").length;
    if (normalized.includes("summarize") || normalized.includes("summary")) {
        return [
            "Here is a concise summary:",
            "",
            "- The main request is about turning existing information into a clearer short form.",
            "- I would preserve decisions, owners, deadlines, and risks.",
            "- I would remove repetition and keep the final version easy to scan.",
            "",
            "Share the source text and I can turn this mock response into a tighter summary."
        ].join("\n");
    }
    if (normalized.includes("email") || normalized.includes("message")) {
        return [
            "Draft:",
            "",
            "Hi team,",
            "",
            "I wanted to share a quick update and confirm the next steps. The current priority is clear, and I will follow up with any blockers or changes as they come up.",
            "",
            "Thanks,"
        ].join("\n");
    }
    if (normalized.includes("code") || normalized.includes("typescript") || normalized.includes("react")) {
        return [
            "I can help with that. A practical path would be:",
            "",
            "1. Define the smallest working behavior.",
            "2. Add typed interfaces around the data flowing through the feature.",
            "3. Implement the UI state and backend endpoint separately.",
            "4. Verify the happy path and one failure path.",
            "",
            "For this mock app, the backend is returning deterministic TypeScript-generated answers instead of calling a real AI model."
        ].join("\n");
    }
    if (normalized.includes("plan") || normalized.includes("steps")) {
        return [
            "Suggested plan:",
            "",
            "1. Clarify the desired outcome and constraints.",
            "2. Break the work into visible milestones.",
            "3. Handle the highest-risk unknown first.",
            "4. Validate with a small test or demo.",
            "5. Polish the details after the core path works."
        ].join("\n");
    }
    return [
        `I understand. This is mock Copilot response ${priorUserTurns}, based on: "${prompt.trim()}"`,
        "",
        "Here is a useful starting point:",
        "",
        "- Identify the concrete outcome you want.",
        "- List the inputs or context that matter.",
        "- Decide what should happen next.",
        "",
        "Because this is a mock assistant, I can simulate helpful responses without sending data to an external AI service."
    ].join("\n");
}
app.listen(port, () => {
    console.log(`Mock Copilot API listening on http://localhost:${port}`);
});
