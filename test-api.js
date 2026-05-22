const PromptEngine = require('./lib/prompt-engine.js');

const sys = PromptEngine.buildSystemPrompt('hypeArchitect', 'twitter', 'rephrase');
const user = PromptEngine.buildUserPrompt({
  title: 'Test',
  url: 'http://test.com',
  domain: 'test.com',
  content: 'An AI agent that manages your YouTube channel 24/7 without you touching a thing\n\nResearches trends, writes the scripts, generates the thumbnails, optimizes SEO, uploads the videos, and analyzes performance\n\nYou just set it up once...'
}, 'rephrase', 'twitter');

const payload = {
  contents: [{
    parts: [{
      text: `${sys}\n\n${user}`
    }]
  }],
  generationConfig: {
    temperature: 0.85,
    maxOutputTokens: 2500,
    topP: 0.92
  }
};

const apiKey = 'AIzaSyBG2zsXsFmVc7_amAcKJa08O8nqUbWvu7k'; // User's key from the prompt
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => {
  if (data.candidates && data.candidates[0].content.parts[0].text) {
    console.log("SUCCESS. Output:\n" + data.candidates[0].content.parts[0].text);
  } else {
    console.log("FAILED to get valid text:", JSON.stringify(data));
  }
})
.catch(err => console.error("Error:", err));
