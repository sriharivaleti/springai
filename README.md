# 🌱 Spring AI in 30 Days: Learn by Doing with Ollama

> A comprehensive, interactive developer learning portal built with **pure HTML5, CSS3, and Vanilla JavaScript** (Zero frameworks, zero dependencies).
> Designed to be hosted on **GitHub Pages** for free.

---

## 🌟 What This Website Contains

1. **30 Days Curriculum (30 Mins / Day)**:
   - Every single day has a **practical hands-on lab** ("learn by doing").
   - Includes **Spring Boot 3.3+ Java code**, `application.yml` configs, `pom.xml` dependencies, runnable `cURL` commands, expected Ollama outputs, and a 10-minute daily challenge.
   - Categorized across: *Fundamentals, Prompt Engineering, Structured Data (POJOs/Records), Streaming & Memory, Vector Stores & RAG, Function Calling / Tools, Multimodal Vision, and DevOps/Production*.

2. **Ollama & Local LLM Installation Guide**:
   - 100% offline local AI execution (Zero API keys, zero cloud costs).
   - Step-by-step installation for **Windows (WinGet)**, **macOS (Homebrew)**, and **Linux**.
   - Model pulling commands for `llama3.2:3b`, `mistral:7b`, and `nomic-embed-text`.
   - cURL verification tests for Ollama's REST API at `http://localhost:11434`.

3. **Spring Boot Prerequisite Setup**:
   - JDK 21 LTS & Apache Maven installation and verification.
   - Spring Initializr command-line setup with `spring-ai-bom` and `spring-ai-ollama-spring-boot-starter`.
   - `application.yml` setup and a verification Smoke Test Controller.

4. **3 Production-Grade Capstone Projects**:
   - **Project 1: Screener.in AI Clone (Equity Financial Screener & Annual Report Analyst)**
     - Fundamental financial ratios (P/E, ROCE, Debt/Equity, FCF).
     - Spring AI `BeanOutputConverter` for structured investment health cards.
     - RAG for 10-K & Annual Report Q&A.
     - **100% Step-by-Step 1-Month Free Cloud Deployment Guide** (Oracle Cloud Always-Free Tier or Render.com with Docker).
   - **Project 2: AI Business Analyst & Enterprise Risk Management System**
     - Automated BRD breakdown into INVEST User Stories & Gherkin Acceptance Criteria.
     - 5x5 Risk Assessment Matrix (Likelihood vs Impact, Mitigations).
     - Spring AI Function Calling for regulatory compliance verification (GDPR, SOC2, PCI-DSS).
   - **Project 3: Upcoming Tech Trends Radar & AI Forecasting Platform**
     - Trend signal aggregator (GitHub trends, ArXiv, Tech Radar).
     - Spring AI Semantic clustering & Trend Momentum Index.
     - Dynamic 4-Quadrant Tech Radar (ADOPT, TRIAL, ASSESS, HOLD) with executive briefings.

5. **Interactive Utilities**:
   - **Live Ollama Configurator**: Adjust temperature, top-p, and models with real-time `application.yml` and `ChatClient` Java generation.
   - **Progress Tracker**: Check off days as you complete them; persists in browser `localStorage` with a live progress bar.
   - **Search & Filter**: Instant filtering across all 30 days by topic or difficulty.
   - **One-Click Code Copy**: Copy snippets with visual toast feedback.
   - **Dark & Light Mode**: Seamless theme toggle.

---

## 🚀 How to Deploy on GitHub Pages (60 Seconds)

Because this website uses **Vanilla HTML, CSS, and JavaScript** with no build steps:

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Spring AI in 30 Days portal"
   ```

2. **Push to Your GitHub Repository**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click on **Settings** (top tab).
   - In the left sidebar, click **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select **Branch: `main`** and folder **`/ (root)`**.
   - Click **Save**.

4. **Your Site is Live**:
   Within 1 minute, your site will be available at:
   `https://<YOUR_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/`

---

## 💻 How to Run Locally

You can open `index.html` directly in any web browser, or serve it using any lightweight static server:

```bash
# Option 1: Python HTTP Server
python -m http.server 3000

# Option 2: Node.js npx serve
npx serve .

# Option 3: VS Code / Cursor
# Right-click index.html -> "Open with Live Server"
```
Open `http://localhost:3000` in your browser.

---

## 📁 Repository Structure

```
├── index.html              # Main single-page web portal
├── css/
│   └── styles.css          # Design system, glassmorphism, responsive styles
├── js/
│   ├── app.js              # State manager, search, tabs, modal, configurator
│   ├── curriculum.js       # Complete 30-day practical labs dataset with code
│   ├── projects.js         # 3 Capstone project guides + cloud deployment
│   └── setup-guide.js      # Ollama, JDK 21, and Spring Boot setup guides
└── README.md               # Documentation & deployment guide
```

---

## 📄 License
MIT License. Free for developers, students, and educators.
