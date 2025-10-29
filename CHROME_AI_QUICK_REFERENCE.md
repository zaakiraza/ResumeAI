# 🚀 Chrome Built-in AI - Developer Quick Reference

## 📌 Quick Access

### Check AI Availability
```javascript
const status = await window.ai.languageModel.capabilities();
// Returns: { available: 'readily' | 'after-download' | 'no' }
```

### Create AI Session
```javascript
const session = await window.ai.languageModel.create({
  systemPrompt: "You are a helpful assistant",
  temperature: 0.7,  // 0.0 to 1.0
  topK: 3            // Number of tokens to consider
});
```

### Generate Text
```javascript
const result = await session.prompt("Your prompt here");
console.log(result);
session.destroy(); // Always clean up!
```

---

## 🛠️ API Reference

### Prompt API (Primary)
```javascript
// Full example
const session = await window.ai.languageModel.create({
  systemPrompt: "You are a professional resume writer.",
  temperature: 0.7,
  topK: 3
});

const summary = await session.prompt(
  "Generate a summary for: Software engineer with 5 years experience"
);

console.log(summary);
session.destroy();
```

### Writer API
```javascript
// Check availability
const writerAvailable = await window.ai.writer.capabilities();

// Create writer
const writer = await window.ai.writer.create({
  sharedContext: "Context for the writer"
});

// Generate content
const content = await writer.write("Write a professional summary");
writer.destroy();
```

### Rewriter API
```javascript
// Check availability
const rewriterAvailable = await window.ai.rewriter.capabilities();

// Create rewriter
const rewriter = await window.ai.rewriter.create({
  tone: 'more-formal',  // 'more-formal' | 'more-casual' | 'as-is'
  length: 'shorter'      // 'shorter' | 'longer' | 'as-is'
});

// Rewrite text
const rewritten = await rewriter.rewrite("I am good at coding");
rewriter.destroy();
```

### Summarizer API
```javascript
// Check availability
const summarizerAvailable = await window.ai.summarizer.capabilities();

// Create summarizer
const summarizer = await window.ai.summarizer.create({
  type: 'tl;dr',      // 'tl;dr' | 'key-points' | 'teaser' | 'headline'
  length: 'short'     // 'short' | 'medium' | 'long'
});

// Summarize
const summary = await summarizer.summarize("Long text here...");
summarizer.destroy();
```

### Proofreader API
```javascript
// Check availability
const proofreaderAvailable = await window.ai.proofreader.capabilities();

// Create proofreader
const proofreader = await window.ai.proofreader.create();

// Proofread
const corrected = await proofreader.proofread("I has been working hear");
proofreader.destroy();
```

### Translator API
```javascript
// Check availability
const translatorCapabilities = await window.ai.translator.capabilities();

// Create translator
const translator = await window.ai.translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es'  // Spanish
});

// Translate
const translated = await translator.translate("Hello, world!");
translator.destroy();
```

---

## 💡 Best Practices

### 1. Always Check Availability First
```javascript
async function safeAICall() {
  const status = await window.ai.languageModel.capabilities();
  
  if (status.available === 'no') {
    throw new Error('AI not available');
  }
  
  if (status.available === 'after-download') {
    console.log('Model will download on first use');
  }
  
  // Proceed with AI call
}
```

### 2. Always Destroy Sessions
```javascript
let session;
try {
  session = await window.ai.languageModel.create();
  const result = await session.prompt("Hello");
  return result;
} catch (error) {
  console.error(error);
  throw error;
} finally {
  if (session) session.destroy();
}
```

### 3. Handle Errors Gracefully
```javascript
async function generateWithFallback(input) {
  try {
    return await chromeAI.generateSummary(input);
  } catch (error) {
    console.error('AI Error:', error);
    // Fallback to manual mode or backend
    return manualGeneration(input);
  }
}
```

### 4. Provide User Feedback
```javascript
async function generateContent(input) {
  setLoading(true);
  setError(null);
  
  try {
    const result = await AIToolsAPI.generateSummary(input);
    setContent(result.data.content);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}
```

---

## 🎯 Common Use Cases

### Resume Summary
```javascript
const session = await window.ai.languageModel.create({
  systemPrompt: "Generate a 3-5 sentence professional summary."
});
const summary = await session.prompt(userExperience);
session.destroy();
```

### Job Description Enhancement
```javascript
const session = await window.ai.languageModel.create({
  systemPrompt: "Enhance with action verbs and quantifiable results."
});
const enhanced = await session.prompt(jobDescription);
session.destroy();
```

### Skills Extraction
```javascript
const session = await window.ai.languageModel.create({
  systemPrompt: "List relevant technical and soft skills as bullet points."
});
const skills = await session.prompt(experience);
session.destroy();
```

---

## 🔧 Troubleshooting

### Error: "AI is not available"
```javascript
// Solution: Check browser and flags
console.log('Browser:', navigator.userAgent);
const caps = await window.ai.languageModel.capabilities();
console.log('AI Status:', caps);
// Ensure Chrome Canary 127+ and flags enabled
```

### Error: "languageModel is undefined"
```javascript
// Solution: Verify API exists
if (!('ai' in window)) {
  console.error('Chrome AI not available');
  // Show setup instructions
}

if (!('languageModel' in window.ai)) {
  console.error('Prompt API not enabled');
  // Guide user to enable flags
}
```

### Slow First Response
```javascript
// This is normal - model initialization takes 2-5 seconds
// Show loading indicator
setLoading(true);
setStatus('Initializing AI model...');

const session = await window.ai.languageModel.create();
const result = await session.prompt(input);

// Subsequent calls are fast (< 1 second)
```

---

## 📊 Performance Tips

### 1. Reuse Sessions (When Possible)
```javascript
// ❌ Bad: Create new session for each call
for (const item of items) {
  const session = await window.ai.languageModel.create();
  await session.prompt(item);
  session.destroy();
}

// ✅ Good: Reuse session
const session = await window.ai.languageModel.create();
for (const item of items) {
  await session.prompt(item);
}
session.destroy();
```

### 2. Batch Similar Requests
```javascript
// Process multiple items with same context
const session = await window.ai.languageModel.create({
  systemPrompt: "Format job descriptions professionally"
});

const results = await Promise.all(
  jobs.map(job => session.prompt(job))
);

session.destroy();
```

### 3. Cancel Long Operations
```javascript
const controller = new AbortController();

// Start generation
const promise = session.prompt(input, {
  signal: controller.signal
});

// Cancel if needed
setTimeout(() => controller.abort(), 5000);

try {
  const result = await promise;
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Operation cancelled');
  }
}
```

---

## 🎨 UI/UX Guidelines

### Show AI Status
```jsx
<AIAvailabilityCheck 
  onAvailabilityChange={(status) => {
    if (status.available === 'readily') {
      setAIReady(true);
    }
  }}
/>
```

### Loading States
```jsx
{loading && (
  <div className="loading">
    <Spinner />
    <p>AI is thinking...</p>
  </div>
)}
```

### Error Messages
```jsx
{error && (
  <div className="error">
    <p>⚠️ {error}</p>
    <button onClick={retry}>Try Again</button>
  </div>
)}
```

### Progressive Enhancement
```jsx
function AIFeature({ fallback }) {
  const [aiAvailable, setAIAvailable] = useState(false);
  
  useEffect(() => {
    checkAIAvailability().then(setAIAvailable);
  }, []);
  
  if (!aiAvailable) {
    return fallback; // Show manual mode
  }
  
  return <AIEnhancedFeature />;
}
```

---

## 📦 Project Structure

```
src/
├── services/
│   ├── chromeAIService.js      # Core AI service
│   └── aiToolsAPI.js            # API wrapper
├── components/
│   └── AIAvailabilityCheck/     # Status checker
├── hooks/
│   └── useAITools.js            # React hook
└── pages/
    └── AIDemo/                   # Demo page
```

---

## 🧪 Testing in Console

### Quick Test
```javascript
// Paste in browser console (F12)
(async () => {
  const session = await window.ai.languageModel.create();
  const result = await session.prompt("Say hello!");
  console.log('✅ AI Working:', result);
  session.destroy();
})();
```

### Full Feature Test
```javascript
// Test all APIs
(async () => {
  // Prompt API
  const prompt = await window.ai.languageModel.create();
  console.log('Prompt:', await prompt.prompt("Hello"));
  prompt.destroy();
  
  // Writer API (if available)
  if (window.ai.writer) {
    const writer = await window.ai.writer.create();
    console.log('Writer:', await writer.write("Write hello"));
    writer.destroy();
  }
  
  // Rewriter API (if available)
  if (window.ai.rewriter) {
    const rewriter = await window.ai.rewriter.create();
    console.log('Rewriter:', await rewriter.rewrite("hello world"));
    rewriter.destroy();
  }
})();
```

---

## 🔗 Useful Links

- **Chrome AI Docs**: https://developer.chrome.com/docs/ai/built-in
- **Prompt API**: https://developer.chrome.com/docs/ai/built-in-apis
- **Early Preview**: https://developer.chrome.com/docs/ai/built-in#get-started
- **Challenge**: https://googlechromeai.devpost.com/

---

## 💻 Code Snippets

### React Hook for AI
```javascript
import { useState, useEffect } from 'react';

export function useAI() {
  const [available, setAvailable] = useState(false);
  
  useEffect(() => {
    window.ai?.languageModel?.capabilities().then(caps => {
      setAvailable(caps.available !== 'no');
    });
  }, []);
  
  return { available };
}
```

### Context Provider
```javascript
const AIContext = createContext();

export function AIProvider({ children }) {
  const [aiReady, setAIReady] = useState(false);
  
  useEffect(() => {
    checkAvailability();
  }, []);
  
  return (
    <AIContext.Provider value={{ aiReady }}>
      {children}
    </AIContext.Provider>
  );
}
```

---

**Quick Reference v1.0 | Chrome Built-in AI Challenge 2025**
