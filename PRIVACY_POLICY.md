# Privacy Policy for VibeContent Pro

**Last Updated:** June 2026

VibeContent Pro ("the Extension") is committed to protecting your privacy. This Privacy Policy outlines our data handling practices and demonstrates our strict adherence to the Chrome Web Store Developer Program Policies.

## 1. Information Collection and Use

VibeContent Pro operates on a strict **"Bring Your Own Key" (BYOK)** and **local-first** architecture.

- **API Keys**: When you input your API keys (e.g., for Groq, Google Gemini, or xAI) into the Extension's settings, these keys are stored **strictly locally** within your browser using Chrome's `chrome.storage.local` API. They are never transmitted to our servers, logged, or shared with any third party.
- **Webpage Content**: When you click "Extract Page Content", the Extension reads the text of the currently active webpage. This text is sent directly from your browser to the AI API provider (Groq, Gemini, or xAI) that you have configured. We do not intercept, store, or analyze this data.
- **Generated Content (Vault)**: Any content you generate and choose to save is stored entirely locally on your device within the Extension's Content Vault.

## 2. No Data Collection or Tracking

VibeContent Pro **does not collect, track, or transmit any personally identifiable information (PII)** or browsing history.
- We do not use analytics trackers (e.g., Google Analytics).
- We do not use crash reporters.
- We do not run any remote code.

## 3. Third-Party Services

The Extension communicates directly with third-party Large Language Model (LLM) APIs based on the provider you select and the API key you provide. By using the Extension, you are subject to the privacy policies of the respective AI providers:
- [Groq Privacy Policy](https://groq.com/privacy-policy/)
- [Google Privacy Policy (Gemini)](https://policies.google.com/privacy)
- [xAI Privacy Policy](https://x.ai/privacy-policy/)

*Note: Data sent to these APIs via your personal API keys is subject to their specific API data usage policies.*

## 4. Required Permissions

The Extension requests the following minimum permissions to function, in compliance with Manifest V3:
- **`activeTab`**: Used strictly to temporarily access the text of the webpage you are currently viewing *only* when you explicitly request content extraction.
- **`scripting`**: Required to inject the local text-extraction script into the active tab.
- **`storage`**: Necessary to securely save your settings, Custom Prompts, API keys, and Content Vault locally on your device.
- **`sidePanel`**: Required to render the extension's user interface.

## 5. Contact Information

If you have any questions or concerns about this Privacy Policy, please contact the developer via the GitHub repository issue tracker at: `https://github.com/ravinderpoonia/VibeContentPro`.

---
*By installing and using VibeContent Pro, you agree to the terms outlined in this Privacy Policy.*
