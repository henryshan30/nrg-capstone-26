import cors from "cors";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";

dotenv.config();

type ChatRole = "user" | "assistant" | "system";

type ChatMessage = {
  id?: string;
  role: ChatRole;
  content: string;
};

type ChatRequest = {
  messages?: ChatMessage[];
};

const app = express();
const port = Number(process.env.PORT ?? 5050);

const faqResponses = [
  {
    patterns: ["who reports directly to min cho", "direct reports to min cho", "who reports to min cho"],
    answer: [
      "Min Cho manages three direct reports:",
      "1. Sam Selin – GTM Consumer Junior Finance Analyst (Calgary)",
      "2. Amanda Klause – GTM Consumer Finance Analyst (Houston)",
      "3. Min Cho's manager is Khang Nguyen, placing this team within the Forecasting & Planning organization."
    ].join("\n")
  },
  {
    patterns: ["reporting chain", "key finance leaders supporting gtm strategy", "gtm finance organization"],
    answer: [
      "The GTM Finance organization is structured as follows:",
      "",
      "• Chikobi Ijomah — VP, GTM Finance",
      "• Brooke Beggerly — Senior Director, Finance",
      "• Henry Shan — GTM Finance Director",
      "• Erich Winkelmann — Senior Finance Manager",
      "• Khang Nguyen — Finance Manager",
      "• Min Cho — Senior Finance Analyst",
      "• Jacob Marko — Senior Finance Analyst",
      "",
      "Key leaders supporting GTM strategy include:",
      "",
      "• Chikobi Ijomah — Leads GTM Finance Strategy and GTM Strategic Planning.",
      "• Brooke Beggerly — Leads GTM Transformation initiatives.",
      "• Henry Shan — Leads GTM Finance Operations and the GTM Operating Model."
    ].join("\n")
  },
  {
    patterns: ["experience with forecasting and budgeting", "forecasting and budgeting"],
    answer: [
      "Several employees have forecasting and budgeting expertise:",
      "",
      "• Min Cho",
      "  Skills: Forecasting, Budgeting, Financial Modeling",
      "  Project: FY27 Forecast",
      "• Khang Nguyen",
      "  Skills: FP&A, Planning, Leadership",
      "  Project: Annual Budget Process",
      "• Emmanuel Stevens",
      "  Skills: KPI Reporting, Forecasting",
      "  Project: Sales Performance Dashboard",
      "",
      "Min Cho would be the best contact for detailed forecasting methodologies, while Khang Nguyen is likely the strongest resource for organization-wide budgeting processes."
    ].join("\n")
  },
  {
    patterns: ["commercial finance expertise", "commercial finance"],
    answer: [
      "Employees with commercial finance experience include:",
      "",
      "• Erich Winkelmann",
      "  Team Function: GTM Commercial Finance",
      "  Skills: Commercial Finance, Strategy",
      "• Brooke Beggerly",
      "  Team Function: Commercial & Consumer Finance",
      "  Skills: Enterprise Finance, Leadership",
      "• Chikobi Ijomah",
      "  Team Function: GTM Finance Strategy",
      "  Skills: Strategic Finance, Executive Leadership",
      "",
      "These individuals are closely aligned with commercial finance planning, strategy, and transformation initiatives."
    ].join("\n")
  },
  {
    patterns: ["pricing strategy projects", "pricing strategy"],
    answer: [
      "For pricing strategy initiatives, consider connecting with:",
      "",
      "1. Jacob Marko",
      "   Team Function: Pricing Strategy",
      "   Project: Pricing Optimization",
      "   Skills: Pricing Analytics, Financial Modeling",
      "2. Khang Nguyen",
      "   Oversees budget and planning functions that frequently support pricing decisions.",
      "3. Erich Winkelmann",
      "   Commercial finance leader with strategic planning responsibilities.",
      "",
      "Jacob Marko is the most directly aligned resource for pricing-specific work."
    ].join("\n")
  },
  {
    patterns: ["become a finance manager", "finance manager", "started as an analyst and was promoted internally"],
    answer: [
      "Examples of employees whose career paths show internal advancement include:",
      "",
      "• Min Cho",
      "  Current Role: Senior Finance Analyst",
      "  Career Path: Internal Promotion",
      "• Khang Nguyen",
      "  Current Role: Finance Manager",
      "  Career Path: Internal Promotion",
      "• Henry Shan",
      "  Current Role: Finance Director",
      "  Career Path: Internal Promotion",
      "",
      "Speaking with Khang Nguyen could be particularly valuable since they progressed into a Finance Manager role through internal advancement."
    ].join("\n")
  },
  {
    patterns: ["joined the company from external organizations", "external organizations", "external hire"],
    answer: [
      "The following finance leaders were hired externally:",
      "",
      "• Jacob Marko",
      "  Career Path: External Hire",
      "  Previous Background: Management Consulting",
      "• Erich Winkelmann",
      "  Career Path: External Leadership Hire",
      "  Previous Background: Former O&G Finance Manager",
      "• Brooke Beggerly",
      "  Career Path: External Director Hire",
      "  Previous Background: Former Deloitte Senior Manager",
      "",
      "These leaders may provide useful perspectives on transitioning into the organization from other industries and companies."
    ].join("\n")
  },
  {
    patterns: ["consulting backgrounds", "consulting"],
    answer: [
      "The strongest consulting-related backgrounds include:",
      "",
      "• Jacob Marko",
      "  Previous Background: Management Consulting",
      "• Brooke Beggerly",
      "  Previous Background: Former Deloitte Senior Manager",
      "",
      "These individuals may be particularly helpful for discussions around strategic problem-solving, transformation initiatives, and stakeholder management."
    ].join("\n")
  },
  {
    patterns: ["new finance analyst in consumer reporting", "consumer reporting", "new finance analyst"],
    answer: [
      "Recommended connections include:",
      "",
      "• Sam Selin",
      "  Works directly in Consumer Reporting.",
      "• Min Cho",
      "  Leads Forecasting & Planning activities and manages Consumer Reporting resources.",
      "• Khang Nguyen",
      "  Oversees Budget & Forecast Management and supports broader finance operations.",
      "",
      "Connecting with all three would provide visibility into both day-to-day reporting work and longer-term growth opportunities within the organization."
    ].join("\n")
  },
  {
    patterns: ["consumer finance and leadership roles", "consumer finance", "leadership roles"],
    answer: [
      "Potential contacts include:",
      "",
      "• Liane Wakefeild",
      "  Team Function: Consumer Product Finance",
      "  Skills: Product Finance, Team Leadership",
      "  Manages a team of 16 employees.",
      "• Brooke Beggerly",
      "  Team Function: Commercial & Consumer Finance",
      "  Skills: Enterprise Finance, Leadership",
      "",
      "These leaders combine consumer finance expertise with people leadership experience."
    ].join("\n")
  },
  {
    patterns: ["forecasting-related projects", "forecasting-related", "forecasting projects"],
    answer: [
      "Several employees are involved in forecasting-related projects:",
      "",
      "• Sam Selin works in Consumer Reporting and is currently supporting the Consumer Margin Reporting project.",
      "• Amanda Klause focuses on Customer Revenue Analysis and is involved in the Revenue Optimization initiative.",
      "• Liane Wakefeild leads work in Consumer Product Finance and is driving the Consumer Product Strategy project.",
      "• Brooke Beggerly oversees Commercial & Consumer Finance and is leading the GTM Transformation initiative, which includes consumer finance responsibilities.",
      "",
      "Together, these employees provide expertise across consumer reporting, revenue optimization, consumer product finance, and broader consumer-focused finance strategy. If you're looking to learn more about consumer finance within the organization, Liane Wakefeild and Brooke Beggerly would be strong starting points due to their leadership roles, while Sam Selin and Amanda Klause can provide hands-on perspectives from active consumer-focused projects."
    ].join("\n")
  }
];

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "mock-copilot-api" });
});

app.post("/api/chat", (req: Request<object, object, ChatRequest>, res: Response) => {
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

function buildMockCopilotReply(prompt: string, history: ChatMessage[]): string {
  const normalized = prompt.toLowerCase();
  const priorUserTurns = history.filter((message) => message.role === "user").length;

  const faqReply = faqResponses.find((entry) =>
    entry.patterns.some((pattern) => normalized.includes(pattern))
  );

  if (faqReply) {
    return faqReply.answer;
  }

  if (normalized.includes("summarize") || normalized.includes("summary")) {
    return [
      "Here is a concise summary:",
      "",
      "• The main request is about turning existing information into a clearer short form.",
      "• I would preserve decisions, owners, deadlines, and risks.",
      "• I would remove repetition and keep the final version easy to scan.",
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
    "• Identify the concrete outcome you want.",
    "• List the inputs or context that matter.",
    "• Decide what should happen next.",
    "",
    "Because this is a mock assistant, I can simulate helpful responses without sending data to an external AI service."
  ].join("\n");
}

app.listen(port, () => {
  console.log(`Mock Copilot API listening on http://localhost:${port}`);
});
