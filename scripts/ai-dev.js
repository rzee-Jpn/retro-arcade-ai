const fs = require("fs");
const applyAIChanges = require("./parser");

const issue = process.env.ISSUE_BODY;
const apiKey = process.env.OPENROUTER_API_KEY;

const prompt = fs.readFileSync("ai/system_prompt.md", "utf8");

async function runAI() {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: issue }
      ]
    })
  });

  const data = await response.json();
  const result = data.choices[0].message.content;

  applyAIChanges(result);
}

runAI();
