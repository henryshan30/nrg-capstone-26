// Client-side port of the mock Copilot backend (formerly server/src/index.ts).
// Runs entirely in the browser so the app works on static hosting (GitHub Pages).

type ChatRole = "user" | "assistant" | "system";

export type MockChatMessage = {
  id?: string;
  role: ChatRole;
  content: string;
};

const faqResponses = [
  {
    patterns: ["who reports directly to min cho", "direct reports to min cho", "who reports to min cho"],
    answer: [
      "Min Cho currently manages three direct reports:",
      "",
      "• Olivia Hart – GTM Finance Summer Intern",
      "• Sam Selin – GTM Consumer Junior Finance Analyst",
      "• One additional team member is listed within the reported span of control but is not individually identified in the dataset.",
      "",
      "Min Cho is part of the Forecasting & Planning organization and reports to Khang Nguyen."
    ].join("\n")
  },
  {
    patterns: [
      "who reports directly to erich winkelmann",
      "reports directly to erich",
      "direct reports to erich winkelmann",
      "who reports to erich winkelmann",
      "reports to erich winkelmann"
    ],
    answer: [
      "Erich Winkelmann – Director, GTM Commercial Finance",
      "",
      "• Span of Control: 5 direct reports, 23 total employees",
      "• Organization Focus: Forecasting, Planning, Budgeting, Pricing Strategy, and Consumer Finance",
      "",
      "Erich's direct reports include:",
      "",
      "• Khang Nguyen – GTM Finance Manager, responsible for Budget & Forecast Management and the Annual Budget Process.",
      "• Additional members of Erich's organization are reflected in his span of control but are not individually identified in the dataset.",
      "",
      "Through these teams, Erich's organization supports forecasting, planning, budgeting, pricing strategy, and consumer finance initiatives — including leaders such as Min Cho (Forecasting & Planning) and Jacob Marko (Pricing Strategy), who manage teams focused on financial planning and strategic analysis.",
      "",
      "Current Strategic Initiatives:",
      "",
      "• FY2027 Budget Development – leading the annual budget cycle across GTM Commercial Finance, consolidating inputs from the forecasting and planning teams.",
      "• Pricing Optimization Program – partnering with Jacob Marko's pricing team to refine pricing models and margin targets across product lines.",
      "• Consumer Margin Enhancement Initiative – driving cross-functional work to improve consumer segment profitability and cost efficiency.",
      "• Revenue Forecast Automation – modernizing forecast workflows with automated data pipelines to improve accuracy and shorten cycle time.",
      "",
      "This structure positions Erich as a key leader connecting commercial finance strategy with operational planning and forecasting activities across the GTM Finance organization."
    ].join("\n")
  },
  {
    patterns: ["reporting chain", "key finance leaders supporting gtm strategy", "gtm finance organization"],
    answer: [
      "The GTM Finance organization is led by Chikobi Ijomah, Vice President of GTM Finance, who oversees GTM Finance Strategy and Strategic Planning. Above this role are Peyton Robertson, EVP of Finance, and Rod Degautte, President and CEO.",
      "",
      "Key finance leaders supporting GTM strategy include:",
      "",
      "• Chikobi Ijomah – VP, GTM Finance; responsible for GTM Strategic Planning.",
      "• Brooke Beggerly – Senior Director, Finance; leads Commercial & Consumer Finance and GTM Transformation.",
      "• Henry Shan – Finance Director; leads GTM Finance Operations and the GTM Operating Model.",
      "• Hee Lang – Finance Director; leads Finance Transformation initiatives.",
      "• Erich Winkelmann – Senior Finance Manager; responsible for GTM Commercial Planning."
    ].join("\n")
  },
  {
    patterns: ["experience with forecasting and budgeting", "forecasting and budgeting"],
    answer: [
      "The strongest forecasting and budgeting resources include:",
      "",
      "• Min Cho, who leads Forecasting & Planning and has skills in forecasting, budgeting, and financial modeling while overseeing the FY27 Forecast initiative.",
      "• Khang Nguyen, who manages Budget & Forecast Management and leads the Annual Budget Process.",
      "• Olivia Hart, who supports Forecasting & Planning activities through FY27 Budget Data Input work.",
      "• Emmanuel Stevens, who has forecasting experience through KPI reporting and performance analytics.",
      "",
      "For strategic forecasting discussions, Min Cho and Khang Nguyen would be the best contacts."
    ].join("\n")
  },
  {
    patterns: ["commercial finance expertise", "commercial finance"],
    answer: [
      "Employees with commercial finance expertise include:",
      "",
      "• Erich Winkelmann, whose team function is GTM Commercial Finance and whose current focus is GTM Commercial Planning.",
      "• Brooke Beggerly, who leads Commercial & Consumer Finance and GTM Transformation initiatives.",
      "• Chikobi Ijomah, who oversees GTM Finance Strategy and Strategic Planning.",
      "• Henry Shan, who directs GTM Finance Operations across the organization.",
      "",
      "These individuals would be strong contacts for commercial finance strategy, planning, and transformation efforts."
    ].join("\n")
  },
  {
    patterns: ["pricing strategy projects", "pricing strategy"],
    answer: [
      "For pricing strategy initiatives, I recommend connecting with:",
      "",
      "• Jacob Marko, Senior Finance Analyst for Pricing Strategy, who leads the Pricing Optimization project and specializes in pricing analytics and financial modeling.",
      "• Lucas Ramirez, who supports Pricing Planning through price data pulls and analysis.",
      "• Khang Nguyen, whose budgeting and planning responsibilities frequently intersect with pricing-related decisions.",
      "",
      "Jacob Marko would be the primary expert for pricing strategy work."
    ].join("\n")
  },
  {
    patterns: ["become a finance manager", "finance manager", "started as an analyst and was promoted internally"],
    answer: [
      "Several leaders demonstrate successful internal career progression:",
      "",
      "• Min Cho advanced to Senior Finance Analyst through internal promotion.",
      "• Khang Nguyen advanced into a Finance Manager role through internal promotion.",
      "• Henry Shan progressed into a Finance Director position through the organization's internal leadership pipeline.",
      "• Hee Lang advanced into Finance Director through an internal leadership track.",
      "• Chikobi Ijomah progressed into executive leadership through internal promotion.",
      "",
      "Khang Nguyen would be particularly valuable to speak with because their career path closely aligns with your goal of becoming a Finance Manager."
    ].join("\n")
  },
  {
    patterns: ["joined the company from external organizations", "external organizations", "external hire"],
    answer: [
      "Several finance leaders were hired externally and bring experience from other organizations:",
      "",
      "• Jacob Marko joined as an external hire following a background in management consulting.",
      "• Erich Winkelmann joined as an external leadership hire after serving as an Oil & Gas Finance Manager.",
      "• Brooke Beggerly joined as an external director hire and previously worked as a Deloitte Senior Manager.",
      "• Rod Degautte joined as an external CEO hire with extensive energy industry leadership experience.",
      "",
      "These leaders may offer unique perspectives on transitioning into the organization and leveraging experience gained elsewhere."
    ].join("\n")
  },
  {
    patterns: ["consulting backgrounds", "consulting"],
    answer: [
      "Leaders with consulting-related experience include:",
      "",
      "• Jacob Marko, whose previous background was in management consulting.",
      "• Brooke Beggerly, who previously worked as a Deloitte Senior Manager before joining the organization.",
      "",
      "Both individuals bring perspectives from advisory and consulting environments that may be valuable for strategic and transformation-focused work.",
      "",
      "Their consulting backgrounds may make them valuable connections for employees seeking guidance on strategic problem-solving, business transformation, stakeholder management, and cross-functional initiatives. Building relationships with leaders who have experience in consulting can also help expand internal networks and provide exposure to diverse approaches for tackling complex business challenges."
    ].join("\n")
  },
  {
    patterns: ["new finance analyst in consumer reporting", "consumer reporting", "new finance analyst"],
    answer: [
      "If you're new to Consumer Reporting, I recommend connecting with:",
      "",
      "• Sam Selin, who works directly in Consumer Reporting and supports Consumer Margin Reporting.",
      "• Min Cho, who manages Forecasting & Planning activities and oversees reporting resources.",
      "• Khang Nguyen, who leads Budget & Forecast Management and can provide visibility into broader finance planning initiatives.",
      "• Liane Wakefeild, who leads Consumer Product Finance and can offer insight into consumer-focused strategic work.",
      "",
      "These connections would help you understand both operational reporting responsibilities and long-term career opportunities within the finance organization."
    ].join("\n")
  },
  {
    patterns: ["consumer finance and leadership roles", "consumer finance", "leadership roles"],
    answer: [
      "You may want to connect with:",
      "",
      "• Liane Wakefeild, who leads Consumer Product Finance, manages a large team, and is responsible for the Consumer Product Strategy initiative.",
      "• Brooke Beggerly, who oversees Commercial & Consumer Finance and leads GTM Transformation efforts.",
      "• Chikobi Ijomah, who brings executive-level leadership experience and oversees GTM Finance Strategy.",
      "",
      "These leaders combine consumer finance knowledge with significant management and strategic leadership responsibilities."
    ].join("\n")
  },
  {
    patterns: ["forecasting-related projects", "forecasting-related", "forecasting projects"],
    answer: [
      "Several employees are currently involved in forecasting and planning activities:",
      "",
      "• Min Cho leads the FY27 Forecast initiative.",
      "• Khang Nguyen leads the Annual Budget Process.",
      "• Olivia Hart supports FY27 Budget Data Input work as part of Forecasting & Planning Support.",
      "• Emmanuel Stevens brings forecasting experience through KPI reporting and sales performance analytics.",
      "",
      "Together, these individuals represent both strategic and operational forecasting expertise within the finance organization."
    ].join("\n")
  },
  {
    patterns: ["consumer-focused finance projects", "consumer-focused", "consumer finance projects"],
    answer: [
      "I found several employees whose current responsibilities and projects are aligned with consumer-focused finance initiatives:",
      "",
      "• Sam Selin works in Consumer Reporting and supports the Consumer Margin Reporting project.",
      "• Amanda Klause focuses on Customer Revenue Analysis and contributes to the Revenue Optimization initiative.",
      "• Emmanuel Stevens supports Sales Performance Reporting through the Sales Performance Dashboard project.",
      "• Liane Wakefeild leads Consumer Product Finance and is responsible for the Consumer Product Strategy initiative.",
      "• Brooke Beggerly oversees Commercial & Consumer Finance and leads the GTM Transformation project, which includes consumer-focused finance initiatives.",
      "",
      "Together, these employees provide expertise across consumer reporting, revenue analysis, sales performance, product finance, and consumer-focused finance strategy. For strategic discussions, Liane Wakefeild and Brooke Beggerly would be strong contacts, while Sam Selin, Amanda Klause, and Emmanuel Stevens can provide day-to-day project insights."
    ].join("\n")
  }
];

export function buildMockCopilotReply(prompt: string, history: MockChatMessage[]): string {
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
