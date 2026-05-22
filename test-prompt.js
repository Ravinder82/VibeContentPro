const PromptEngine = require('./lib/prompt-engine.js');

const sys = PromptEngine.buildSystemPrompt('hypeArchitect', 'twitter', 'rephrase');
console.log('--- SYSTEM PROMPT ---');
console.log(sys);

const user = PromptEngine.buildUserPrompt({
  title: 'Test',
  url: 'http://test.com',
  domain: 'test.com',
  content: 'An AI agent that manages your YouTube channel 24/7 without you touching a thing\n\nResearches trends, writes the scripts, generates the thumbnails, optimizes SEO, uploads the videos, and analyzes performance\n\nYou just set it up once...'
}, 'rephrase', 'twitter');
console.log('\n--- USER PROMPT ---');
console.log(user);
