# 🤖 ResumeAI - AI-Powered Resume Builder

> **Chrome Built-in AI Challenge 2025 Submission**  
> Privacy-first resume creation powered by Gemini Nano

[![Chrome Built-in AI](https://img.shields.io/badge/Chrome-Built--in%20AI-4285F4?logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/ai/built-in)
[![Gemini Nano](https://img.shields.io/badge/Gemini-Nano-8E75B2?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/nano/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 Overview

ResumeAI is an intelligent resume builder that leverages **Chrome's Built-in AI** to help job seekers create professional resumes. All AI processing happens **completely on your device** using Gemini Nano - ensuring privacy, zero costs, and offline capability.

### ✨ Key Features

- 📝 **Professional Summary Generator** - Create compelling career summaries
- ⭐ **Experience Enhancer** - Transform job descriptions with powerful action verbs
- 🎯 **Skills Analyzer** - Get AI-suggested relevant technical and soft skills
- 🎓 **Education Formatter** - Format education sections professionally
- ✉️ **Cover Letter Generator** - Create tailored, personalized cover letters
- ✏️ **Content Rewriter** - Adjust tone (formal/casual) and length
- ✅ **Proofreader** - Automatic grammar and spelling correction

### 🚀 Why Chrome Built-in AI?

Traditional AI tools have limitations:
- 💸 Expensive API costs
- 🔓 Privacy concerns with cloud processing
- 🐌 Network latency
- 📵 Requires internet connection

**Our Solution:**
- 💰 **Zero Cost** - No API charges, unlimited usage
- 🔒 **Complete Privacy** - Data never leaves your device
- ⚡ **Lightning Fast** - No network delays
- 📴 **Offline Ready** - Works without internet

---

## 🎥 Demo

> **[Watch Demo Video]** (< 3 minutes)

![Demo Screenshot](path/to/screenshot.png)
*AI-powered resume generation in action*

**Live Demo:** [Your Deployed URL]

---

## 🛠️ Chrome AI APIs Used

This project showcases the full suite of Chrome's Built-in AI capabilities:

| API | Purpose | Usage |
|-----|---------|-------|
| **Prompt API** | Core text generation | Summary, experience, skills, education |
| **Writer API** | Original content creation | Cover letters, creative content |
| **Rewriter API** | Text improvement | Tone adjustment, length modification |
| **Summarizer API** | Text condensation | Long content summarization |
| **Proofreader API** | Grammar correction | Error fixing, polish |

All powered by **Gemini Nano** running locally on your device.

---

## 📋 Prerequisites

### Browser Requirements
- **Chrome Canary** or **Chrome Dev** (Version 127+)
- Download: [Chrome Canary](https://www.google.com/chrome/canary/)

### System Requirements
- **OS:** Windows 10+, macOS 12+, or Linux
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 500MB free space
- **Internet:** For initial model download (~22MB)

---

## 🚀 Quick Start

### 1. Enable Chrome Built-in AI

**Step 1:** Open Chrome Canary and go to `chrome://flags`

**Step 2:** Enable these flags:
- ✅ `Prompt API for Gemini Nano`
- ✅ `Enables optimization guide on device`
- ✅ `Writer API` (if available)
- ✅ `Rewriter API` (if available)
- ✅ `Summarizer API` (if available)

**Step 3:** Click "Relaunch" to restart Chrome

**Step 4:** Download the AI model
- Go to `chrome://components`
- Find "Optimization Guide On Device Model"
- Click "Check for update"
- Wait for download to complete

**Detailed Setup Guide:** See [CHROME_AI_SETUP.md](CHROME_AI_SETUP.md)

### 2. Install & Run

```bash
# Clone repository
git clone https://github.com/yourusername/ResumeAI.git
cd ResumeAI

# Install backend dependencies
cd Backend
npm install

# Start backend (optional - for user management)
npm start

# In a new terminal, install frontend dependencies
cd ../frontend
npm install

# Start frontend
npm run dev
```

Visit: `http://localhost:5173`

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **AI Integration:** Chrome Built-in AI APIs
- **Styling:** Custom CSS with responsive design
- **State Management:** React Hooks

### Backend (Hybrid Architecture)
- **Runtime:** Node.js with Express
- **Database:** MongoDB
- **Authentication:** JWT tokens
- **File Storage:** Cloud-based (Cloudinary)

### AI Processing
- **Model:** Gemini Nano (local, on-device)
- **APIs:** Prompt, Writer, Rewriter, Summarizer, Proofreader
- **Processing:** 100% client-side

---

## 🏗️ Architecture

### Hybrid AI Design

```
┌─────────────────────────────────────────────┐
│            User's Browser                    │
│  ┌────────────────────────────────────────┐ │
│  │   React Frontend                       │ │
│  │                                        │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │  Chrome Built-in AI (Gemini Nano)│ │ │
│  │  │  • Prompt API                     │ │ │
│  │  │  • Writer API                     │ │ │
│  │  │  • Rewriter API                   │ │ │
│  │  │  • Summarizer API                 │ │ │
│  │  │  • Proofreader API                │ │ │
│  │  └──────────────────────────────────┘ │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    ↕ HTTP (User data only)
┌─────────────────────────────────────────────┐
│         Backend Server (Node.js)             │
│  • User authentication                       │
│  • Resume storage                            │
│  • User preferences                          │
│  • No AI processing                          │
└─────────────────────────────────────────────┘
```

**Key Design Decisions:**
- AI runs client-side for privacy and performance
- Backend handles only user data (not AI content)
- Hybrid approach optimizes for both security and functionality

---

## 📚 Documentation

- 📖 [Chrome AI Implementation Guide](CHROME_AI_IMPLEMENTATION.md) - Technical deep dive
- 🚀 [Setup Guide](CHROME_AI_SETUP.md) - User-friendly installation
- ✅ [Challenge Submission Checklist](CHALLENGE_SUBMISSION_CHECKLIST.md) - Contest preparation
- 📝 [Migration Summary](MIGRATION_SUMMARY.md) - Project evolution

---

## 🎮 Usage Examples

### Generate Professional Summary
```javascript
import AIToolsAPI from './services/aiToolsAPI';

const input = "Software engineer with 5 years experience in React and Node.js";
const result = await AIToolsAPI.generateSummary(input);
console.log(result.data.content);
// Output: "Results-driven Software Engineer with 5+ years of expertise..."
```

### Enhance Work Experience
```javascript
const experience = "Built web applications";
const enhanced = await AIToolsAPI.enhanceExperience(experience);
console.log(enhanced.data.content);
// Output: "Architected and deployed scalable web applications..."
```

### Check AI Availability
```javascript
const status = await AIToolsAPI.checkAvailability();
console.log(status.available); // 'readily', 'after-download', or 'no'
```

---

## 🧪 Testing

### Verify Chrome AI
```javascript
// In browser console (F12)
const capabilities = await window.ai.languageModel.capabilities();
console.log('AI Status:', capabilities.available);

// Test generation
const session = await window.ai.languageModel.create();
const result = await session.prompt("Say hello!");
console.log(result);
session.destroy();
```

### Run Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd Backend
npm test
```

---

## 🎯 Project Highlights

### For Users
- ✅ Free, unlimited AI-powered resume assistance
- ✅ Complete privacy - data never uploaded
- ✅ Professional-quality output
- ✅ Works offline after setup
- ✅ No account required for basic features

### For Developers
- ✅ Clean, well-documented code
- ✅ Modular architecture
- ✅ Comprehensive error handling
- ✅ Easy to extend and customize
- ✅ Production-ready

### For Challenge
- ✅ Novel use of Chrome Built-in AI
- ✅ Real-world practical application
- ✅ Multiple APIs integrated
- ✅ Hybrid architecture
- ✅ Privacy-first design

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Chrome Team for the Built-in AI APIs
- Chrome AI Challenge organizers
- Gemini Nano model team
- Open source community

---

## 📞 Contact & Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/yourusername/ResumeAI/issues)
- **Email:** your.email@example.com
- **Challenge Page:** [Devpost Submission](your-devpost-link)

---

## 🏆 Challenge Submission

This project is submitted to the **Google Chrome Built-in AI Challenge 2025**.

### Categories
- **Primary:** Most Helpful - Web Application
- **Secondary:** Best Hybrid AI Application

### Why This Project Deserves to Win
1. **Real Impact:** Helps job seekers create professional resumes
2. **Technical Excellence:** Showcases multiple Chrome AI APIs
3. **Privacy-First:** 100% client-side AI processing
4. **Production Ready:** Polished UI, error handling, documentation
5. **Innovative Architecture:** Smart hybrid approach
6. **Accessibility:** Free and available to all

---

## 🌟 Star History

If you find this project helpful, please consider giving it a star ⭐

---

## 📊 Stats

- **AI APIs Used:** 5 (Prompt, Writer, Rewriter, Summarizer, Proofreader)
- **Lines of Code:** [Your count]
- **Features:** 7+ AI-powered tools
- **Setup Time:** < 5 minutes
- **Model Size:** 22MB (one-time download)

---

**Built with ❤️ for the Chrome Built-in AI Challenge 2025**

---

<p align="center">
  <img src="path/to/logo.png" alt="ResumeAI Logo" width="200"/>
</p>

<p align="center">
  <strong>Privacy • Performance • Powered by AI</strong>
</p>
