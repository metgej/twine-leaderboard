import fs from "fs";
import path from "path";

const dataFile = path.resolve("./data/scores.json");

function readScores() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, "utf8"));
  } catch {
    return [];
  }
}

function writeScores(scores) {
  fs.writeFileSync(dataFile, JSON.stringify(scores, null, 2));
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    const { name, score, scenario } = req.body;
    if (!name || score == null || !scenario) {
      res.status(400).json({ error: "Missing fields" });
      return;
    }

    const scores = readScores();
    scores.push({ name, score, scenario });
    writeScores(scores);

    res.json({ status: "ok" });
  } else if (req.method === "GET") {
    const scenario = req.query.scenario;
    if (!scenario) {
      res.status(400).json({ error: "Missing scenario" });
      return;
    }

    const scores = readScores()
      .filter(s => s.scenario === scenario)
      .sort((a,b) => b.score - a.score)
      .slice(0, 10);

    res.json(scores);
  } else {
    res.status(405).end();
  }
}
