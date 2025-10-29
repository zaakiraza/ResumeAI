# 🚀 Quick Start Guide - Chrome Built-in AI

This guide will help you get Chrome's Built-in AI working for this project.

## ⚡ Quick Setup (5 minutes)

### Step 1: Update Chrome
Download the latest Chrome Canary or Dev channel:
- **Chrome Canary**: https://www.google.com/chrome/canary/
- **Chrome Dev**: https://www.google.com/chrome/dev/

> ⚠️ **Note**: Regular Chrome (Stable) may not have these features yet. Use Canary or Dev!

### Step 2: Enable AI Flags

1. Open Chrome and go to: `chrome://flags`

2. Search for and **enable** these flags:
   ```
   ✅ Prompt API for Gemini Nano
   ✅ Enables optimization guide on device
   ✅ Writer API (if available)
   ✅ Rewriter API (if available)  
   ✅ Summarizer API (if available)
   ```

3. Click **"Relaunch"** at the bottom

### Step 3: Download the AI Model

1. Go to: `chrome://components`

2. Find: **"Optimization Guide On Device Model"**

3. Click **"Check for update"**

4. Wait for download (~22MB)

5. Status should show: **"Up to date"**

### Step 4: Verify Installation

Open Chrome DevTools Console (F12) and run:

```javascript
// Check if AI is available
const available = await window.ai.languageModel.capabilities();
console.log('AI Status:', available.available);
// Should print: "readily" or "after-download"

// Test it!
const session = await window.ai.languageModel.create();
const result = await session.prompt("Say hello!");
console.log(result);
session.destroy();
```

If you see a response, you're all set! 🎉

---

## 🏃 Running the Project

### Backend (Optional - for user management only)
```bash
cd Backend
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

## 🎯 Testing AI Features

### Option 1: AI Demo Page
Navigate to the **AI Demo** page in the app to test all AI features interactively.

### Option 2: Browser Console
```javascript
// Test from console
import AIToolsAPI from './src/services/aiToolsAPI';

// Generate summary
const summary = await AIToolsAPI.generateSummary(
  "Software engineer with 5 years experience in React"
);
console.log(summary.data.content);

// Enhance experience  
const enhanced = await AIToolsAPI.enhanceExperience(
  "Built web applications"
);
console.log(enhanced.data.content);
```

---

## 🐛 Troubleshooting

### ❌ "AI is not available on this device"

**Solutions:**
1. Make sure you're using Chrome Canary/Dev (version 127+)
2. Check that all flags are enabled in `chrome://flags`
3. Restart Chrome completely
4. Try clearing Chrome cache

### ❌ "Cannot read properties of undefined (reading 'languageModel')"

**Solutions:**
1. Ensure you enabled the "Prompt API for Gemini Nano" flag
2. Restart Chrome after enabling flags
3. Update Chrome to the latest version

### ❌ Model download stuck

**Solutions:**
1. Go to `chrome://components`
2. Find "Optimization Guide On Device Model"
3. Click "Check for update"
4. Wait a few minutes (good internet connection required)
5. If stuck, restart Chrome and try again

### ⏳ Slow first response

**This is normal!** 
- First AI call initializes the model (2-5 seconds)
- Subsequent calls are much faster (< 1 second)
- This happens once per session

---

## 📋 System Requirements

### Minimum:
- **Browser**: Chrome 127+ (Canary/Dev)
- **OS**: Windows 10+, macOS 12+, or Linux
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 500MB free space
- **Internet**: For initial model download

### Recommended:
- **Browser**: Latest Chrome Canary
- **RAM**: 8GB+
- **Storage**: 1GB+ free space
- **CPU**: Modern multi-core processor

---

## 🎮 Demo Features

Try these AI features in the app:

### 1. 📝 Professional Summary Generator
Input your experience → Get polished summary

### 2. ⭐ Experience Enhancer  
Input job tasks → Get improved descriptions with action verbs

### 3. 🎯 Skills Analyzer
Input your work → Get suggested relevant skills

### 4. 🎓 Education Formatter
Input education details → Get professionally formatted section

### 5. ✉️ Cover Letter Generator
Input job details → Get customized cover letter

### 6. ✏️ Content Rewriter
Input text → Get rewritten with different tone/length

### 7. ✅ Proofreader
Input text → Get grammar corrections

---

## 🔒 Privacy Note

**All AI processing happens locally in your browser!**
- ✅ Your data NEVER leaves your device
- ✅ No server-side processing
- ✅ No data stored on backend
- ✅ Complete privacy guaranteed

---

## 📚 Additional Resources

- **Chrome AI Docs**: https://developer.chrome.com/docs/ai/built-in
- **Challenge Info**: https://googlechromeai.devpost.com/
- **Early Preview Program**: https://developer.chrome.com/docs/ai/built-in#get-started
- **Prompt API Guide**: https://developer.chrome.com/docs/ai/built-in-apis

---

## 💡 Tips for Best Results

### Writing Good Prompts:
1. **Be specific**: More context = better output
2. **Include details**: Numbers, achievements, technologies
3. **Use examples**: Show what you want
4. **Iterate**: Try different inputs

### Example:
❌ Bad: "I worked on projects"
✅ Good: "Led development of e-commerce platform using React and Node.js, serving 100k+ users, increased conversion rate by 25%"

---

## 🎉 You're Ready!

Start building amazing AI-powered resume features! 🚀

Need help? Check the troubleshooting section or open an issue on GitHub.

---

**Happy Coding! 🤖✨**
