const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const issue = process.env.ISSUE_BODY;
const apiKey = process.env.OPENROUTER_API_KEY;

const ROOT = process.cwd();
const BACKUP_DIR = path.join(ROOT, "backup");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = path.join(
      BACKUP_DIR,
      path.basename(filePath) + "." + Date.now() + ".bak"
    );
    fs.copyFileSync(filePath, backupPath);
    console.log("Backup created:", backupPath);
  }
}

function patchInsideMarker(original, newContent) {
  const startMarker = "// AI_START";
  const endMarker = "// AI_END";

  const start = original.indexOf(startMarker);
  const end = original.indexOf(endMarker);

  if (start === -1 || end === -1) {
    throw new Error("AI markers not found.");
  }

  const before = original.slice(0, start + startMarker.length);
  const after = original.slice(end);

  return before + "\n\n" + newContent + "\n\n" + after;
}

async function runAI() {
  const prompt = fs.readFileSync("ai/system_prompt.md", "utf8");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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

  if (!data.choices || !data.choices[0]) {
    throw new Error("AI response invalid.");
  }

  let parsed;
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch (err) {
    throw new Error("AI returned invalid JSON.");
  }

  for (const file of parsed.files) {
    const filePath = path.join(ROOT, file.path);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${file.path}`);
    }

    backupFile(filePath);

    const original = fs.readFileSync(filePath, "utf8");

    if (file.action === "patch") {
      const updated = patchInsideMarker(original, file.content);
      fs.writeFileSync(filePath, updated);
      console.log("Patched:", file.path);
    } else {
      throw new Error("Only 'patch' action allowed.");
    }
  }

  console.log("AI modifications complete.");
}

function validateSyntax() {
  try {
    execSync("node --check src/main.js");
    execSync("node --check src/scenes/GameScene.js");
    console.log("Syntax OK");
  } catch (err) {
    throw new Error("Syntax error detected.");
  }
}

function buildTest() {
  try {
    execSync("npm run build", { stdio: "inherit" });
    console.log("Build successful");
  } catch (err) {
    throw new Error("Build failed.");
  }
}

async function main() {
  try {
    await runAI();
    validateSyntax();
    buildTest();
  } catch (err) {
    console.error("ERROR:", err.message);
    process.exit(1);
  }
}

main();