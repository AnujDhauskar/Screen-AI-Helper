# Screen AI Helper – VS Code Extension

Screen AI Helper is a powerful Visual Studio Code extension that helps developers **instantly understand coding errors** without switching between apps or pasting code into ChatGPT.

It highlights the exact error, analyses diagnostics, and (optionally) uses AI to explain the problem in simple language — improving the debugging experience and reducing context switching.

---

## 🚀 Features

### 🔍 1. Automatic Error Detection
- Detects VS Code diagnostics (errors & warnings)
- Finds the exact line and column where the error occurs
- Highlights the problematic code snippet automatically

### 🤖 2. AI-Powered Error Explanation (Optional)
If an OpenAI API key is configured, the extension:
- Generates human-friendly explanations
- Explains why the error occurred  
- Suggests how to fix it  
- Provides corrected code examples  
- Helps beginners debug faster  

(*AI features work after adding API credits — completely optional*)

### 🖥️ 3. Non-AI Mode (Free to use)
Even without an API key:
- Error highlighting works  
- Error extraction works  
- You still get a clean diagnostics viewer  

### 🪟 4. Interactive Side Panel
The extension displays results in a custom Webview panel:
- Shows error snippet
- Shows file name, language, and error message
- Shows AI explanation (if enabled)
- Clean UI for debugging

---

## 📦 Installation (Developer Mode)

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/screen-ai-helper.git
cd screen-ai-helper
