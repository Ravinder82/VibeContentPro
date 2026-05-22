# Chrome Web Store Metadata & Assets - VibeContent Pro

Use this document as your single source of truth when submitting the extension to the Chrome Web Store. Copy and paste the text exactly as provided.

## 1. Store Listing Details

**Extension Name:** (Max 45 chars)
VibeContent Pro

**Short Description:** (Max 132 chars)
Create content on every webpage free with BYOK. AI-powered generator that turns any webpage into viral, human-like content instantly.

**Detailed Description:**
VibeContent Pro is the ultimate AI-powered content engine designed to live right inside your browser. 

Create Content on every webpage free with BYOK (Bring Your Own Key). Simply open the side panel, and VibeContent Pro instantly reads and analyzes the webpage you are on. With a single click, it transforms the core ideas, articles, or data into viral, engaging, and human-sounding content tailored for multiple platforms.

**Core Features:**
*   **One-Click Extraction:** Instantly pull the context of any webpage or article without copying and pasting.
*   **Multiple Personas:** Write in the voice of "The Storyteller", "The Insider", "The Contrarian", and more.
*   **Platform Specific:** Generate perfectly formatted content for Articles, TikTok scripts, YouTube Shorts, and Slideshows.
*   **Advanced Content Modes:** Need a summary? Key points? An expert opinion? Or a simple mental model explainer? VibeContent Pro handles it all.
*   **Anti-AI Fingerprinting:** Engineered to produce human-sounding text with natural cadence, messy structures, and unpredictable formatting that bypasses AI detectors.
*   **Secure BYOK Architecture:** Bring Your Own Key. Your OpenAI API key is stored locally and securely on your device. We don't track you, we don't store your data, and we don't charge subscription fees.
*   **Local Vault:** Save your best generations directly in the extension to access or copy later.

Stop struggling with blank pages and generic AI responses. Turn the web into your personal content inspiration engine with VibeContent Pro!

---

## 2. Permissions Justifications

The Chrome Web Store review team strictly requires explanations for every permission requested in your `manifest.json`. Copy these exact justifications into the Developer Dashboard:

*   **`sidePanel`**: Required to host the main user interface of the extension. VibeContent Pro operates within the browser's side panel so users can read the webpage and interact with the AI content generator simultaneously.
*   **`activeTab`**: Required so the extension can inject the extraction script to read the text of the currently active webpage when the user explicitly clicks the "Extract Page Content" button in the side panel.
*   **`storage`**: Required to save the user's API key securely on their local device, store user preferences (selected persona, platform), and save generated content locally in the user's personal Vault.
*   **`scripting`**: Required to execute the `content.js` script inside the active tab. This script extracts the clean textual content from the webpage's DOM and sends it back to the side panel for AI processing.
*   **`tabs`**: Required to allow the side panel to dynamically query the ID of the currently active tab in the window, ensuring the extraction script is executed on the correct page the user is viewing.
*   **Host Permission (`https://*/*`, `http://*/*`)**: Required because users can invoke the extension to extract and analyze textual content from any arbitrary webpage they are currently browsing across the entire internet. 

---

## 3. Privacy Practices (Dashboard Form)

When filling out the **Privacy Practices** tab in the Developer Dashboard:
1.  **Single Purpose:** State that the single purpose is to "Analyze the active webpage and generate human-like content using a user-provided AI API key."
2.  **Data Usage:** Check the boxes to confirm you **do not** collect, sell, or transfer user data.
3.  **Privacy Policy URL:** Paste your GitHub Pages URL here: `https://ravinder82.github.io/VibeContentPro/PRIVACY_POLICY.html`

---

## 4. Visual Assets & AI Prompts

You will need specific images for the Chrome Store. Use these AI Prompts (Midjourney, DALL-E, or Veo) to generate them.

### Store Icon (128x128 PNG)
*   **Requirement:** Must be a clear, square PNG.
*   **Prompt Idea:** *A minimalist, sleek icon featuring a glowing white geometric shape (like a spark or a simplified pen nib) on a deep, shiny black glass background. Premium UI aesthetic, frosted glass texture, sharp contrast, hyper-modern, scalable vector style --v 6.0*

### Promotional Marquee (1280x800 PNG/JPEG)
*   **Requirement:** The main banner that appears in the Chrome Web Store.
*   **Prompt Idea:** *A wide, ultra-modern promotional banner. The background is a sleek, dark frosted glass gradient with subtle shimmering silver accents. In the center, large elegant typography that says "VibeContent Pro" glowing softly. A futuristic abstract representation of digital content flowing into a sleek black interface. High-end software aesthetic, cinematic lighting, ultra-detailed --ar 16:10 --v 6.0*
*   **Post-processing:** Open the image in Canva/Photoshop and add your main text hook in bold, clean font: "Create Content on every webpage free with BYOK."

### Screenshots (640x400 or 1280x800 PNG/JPEG)
*   **Requirement:** At least 1-3 screenshots of the extension in action.
*   **How to create:** Do not use AI for these. Instead:
    1. Open the extension in your browser side panel.
    2. Extract a page and generate some text.
    3. Take a screenshot of your entire browser window showing the sleek black UI of the side panel next to a webpage.
    4. Crop it exactly to 1280x800 pixels.
