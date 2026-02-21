const fs = require("fs");
const path = require("path");

const issue = process.env.ISSUE_BODY;
const apiKey = process.env.OPENROUTER_API_KEY;

async function runAI() {
  const prompt = fs.readFileSync("ai/system_prompt.md", "utf8");

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
  const content = data.choices[0].message.content;

  const parsed = JSON.parse(content);

  for (const file of parsed.files) {
    const filePath = path.join(process.cwd(), file.path);

    if (file.action === "replace") {
      fs.writeFileSync(filePath, file.content);
      console.log("Updated:", file.path);
    }
  }

  console.log("AI modifications complete.");
}

runAI();