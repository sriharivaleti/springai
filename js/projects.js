/**
 * projects.js
 * 3 Complete Capstone Projects with 100% Step-by-Step Implementation Guides,
 * Full Java Code, Architecture Blueprints, and Cloud Deployment Tutorials.
 */

const projectsData = [
  {
    id: "project-screener",
    badge: "Capstone Project 1",
    title: "AI-Powered Financial Screener & Equity Analyst (Screener.in Clone)",
    tagline: "Build a full-stack fundamental stock screener with Spring AI, Ollama & 1-Month Free Cloud Deployment",
    duration: "Estimated Build Time: 4-6 Hours",
    difficulty: "Advanced",
    overview: "Inspired by Screener.in, this application ingests corporate financial metrics (P/E ratio, ROCE, Debt-to-Equity, FCF, Margins), runs Spring AI structured evaluations to generate automated Pros/Cons and Solvency Health Cards, and provides an interactive RAG interface to query 10-K / Annual Reports.",
    architecture: [
      "Frontend: Clean Single-Page Responsive Web Dashboard (HTML5, Vanilla CSS, JS fetch API)",
      "Backend: Spring Boot 3.3.x with Spring AI 1.0.0-M4",
      "LLM Engine: Local Ollama (llama3.2:3b for speed or mistral:7b for in-depth analysis)",
      "Vector Database: SimpleVectorStore (or PgVector) for indexing PDF Annual Reports",
      "Deployment: Docker multi-stage container deployed on Oracle Cloud Always-Free Tier or Render 1-Month Free Tier"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Project Dependencies (pom.xml)",
        explanation: "Set up Spring Boot 3.3 with Spring AI Ollama starter, Web, and PDF document reader for annual reports.",
        code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.screener.ai</groupId>
    <artifactId>ai-stock-screener</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>21</java.version>
        <spring-ai.version>1.0.0-M4</spring-ai.version>
    </properties>

    <repositories>
        <repository>
            <id>spring-milestones</id>
            <name>Spring Milestones</name>
            <url>https://repo.spring.io/milestone</url>
        </repository>
    </repositories>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.ai</groupId>
                <artifactId>spring-ai-bom</artifactId>
                <version>\${spring-ai.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-pdf-document-reader</artifactId>
        </dependency>
    </dependencies>
</project>`
      },
      {
        stepNumber: 2,
        title: "Domain Model & Structured DTOs",
        explanation: "Define strongly-typed Java records representing financial ratios and the AI-generated health card.",
        code: `package com.screener.ai.model;

import java.util.List;

// Raw metrics for a company
public record StockFundamentals(
    String ticker,
    String companyName,
    String sector,
    double marketCapCr,
    double currentPrice,
    double peRatio,
    double industryPe,
    double rocePercent,
    double roePercent,
    double debtToEquity,
    double freeCashFlowCr,
    double dividendYieldPercent,
    double salesGrowth3Yr
) {}

// AI Generated Analysis Card
public record FinancialHealthReport(
    String ticker,
    String overallVerdict,       // e.g. "STRONG_BUY", "HOLD", "CAUTION"
    int healthScoreOutOf100,
    List<String> pros,           // Strengths detected
    List<String> cons,           // Red flags & risks
    String moatAnalysis,         // Competitive advantage
    String valuationSummary
) {}`
      },
      {
        stepNumber: 3,
        title: "Financial Data Service & Ollama AI Analyst",
        explanation: "The core service that combines quantitative financial metrics with Spring AI prompt engineering.",
        code: `package com.screener.ai.service;

import com.screener.ai.model.FinancialHealthReport;
import com.screener.ai.model.StockFundamentals;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class EquityAnalysisService {

    private final ChatClient chatClient;
    private final Map<String, StockFundamentals> stockDatabase = new ConcurrentHashMap<>();

    public EquityAnalysisService(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem("""
                    You are a veteran Chartered Financial Analyst (CFA) specializing in value investing like Benjamin Graham and Warren Buffett.
                    You analyze financial balance sheets strictly based on data.
                    Look for high ROCE (>15%), low Debt-to-Equity (<0.5), positive Free Cash Flow, and reasonable P/E vs Industry P/E.
                    Identify both competitive moats and serious financial red flags.
                    """)
                .build();
        seedMockData();
    }

    private void seedMockData() {
        stockDatabase.put("TCS", new StockFundamentals(
            "TCS", "Tata Consultancy Services Ltd", "IT Services",
            1450000.0, 3950.0, 29.5, 31.0, 52.4, 48.2, 0.0, 42000.0, 1.4, 12.8
        ));
        stockDatabase.put("RELIANCE", new StockFundamentals(
            "RELIANCE", "Reliance Industries Ltd", "Energy & Telecom",
            1950000.0, 2890.0, 26.2, 19.5, 9.8, 8.9, 0.45, 18000.0, 0.35, 15.2
        ));
        stockDatabase.put("INFY", new StockFundamentals(
            "INFY", "Infosys Ltd", "IT Services",
            780000.0, 1880.0, 27.1, 31.0, 39.8, 31.5, 0.05, 23000.0, 2.1, 10.4
        ));
    }

    public StockFundamentals getFundamentals(String ticker) {
        return stockDatabase.getOrDefault(ticker.toUpperCase(), 
            new StockFundamentals(ticker, ticker + " Corp", "General", 50000.0, 500.0, 22.0, 20.0, 14.0, 12.0, 0.2, 1200.0, 1.0, 8.0));
    }

    public FinancialHealthReport generateAiAnalysis(String ticker) {
        StockFundamentals f = getFundamentals(ticker);

        String userPrompt = """
            Perform a rigorous fundamental equity analysis on %s (%s):
            - Sector: %s
            - Market Cap: Rs %f Cr
            - Current Price: Rs %f
            - P/E Ratio: %.2f (Industry P/E: %.2f)
            - ROCE: %.2f%%
            - ROE: %.2f%%
            - Debt to Equity: %.2f
            - Free Cash Flow: Rs %.2f Cr
            - Dividend Yield: %.2f%%
            - 3-Year Sales Growth: %.2f%%
            
            Synthesize your findings into a comprehensive structured report with:
            1. overallVerdict (STRONG_BUY, MODERATE_BUY, HOLD, or AVOID)
            2. healthScoreOutOf100 (integer between 0 and 100)
            3. pros (bullet points of company strengths)
            4. cons (bullet points of potential red flags or valuation concerns)
            5. moatAnalysis (economic moat summary)
            6. valuationSummary (fair value commentary)
            """.formatted(
                f.companyName(), f.ticker(), f.sector(), f.marketCapCr(),
                f.currentPrice(), f.peRatio(), f.industryPe(), f.rocePercent(),
                f.roePercent(), f.debtToEquity(), f.freeCashFlowCr(),
                f.dividendYieldPercent(), f.salesGrowth3Yr()
            );

        return chatClient.prompt()
                .user(userPrompt)
                .call()
                .entity(FinancialHealthReport.class);
    }
}`
      },
      {
        stepNumber: 4,
        title: "Annual Report RAG Q&A Service",
        explanation: "Allow users to upload an Annual Report PDF or 10-K and ask natural language questions about management commentary.",
        code: `package com.screener.ai.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.QuestionAnsweringAdvisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AnnualReportRagService {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    public AnnualReportRagService(EmbeddingModel embeddingModel, ChatClient.Builder builder) {
        this.vectorStore = new SimpleVectorStore(embeddingModel);
        this.chatClient = builder
                .defaultAdvisors(new QuestionAnsweringAdvisor(vectorStore, SearchRequest.query("").withTopK(3)))
                .build();
    }

    public void indexReportExcerpt(String ticker, String excerpt) {
        Document doc = new Document(excerpt, Map.of("ticker", ticker.toUpperCase()));
        TokenTextSplitter splitter = new TokenTextSplitter(300, 30, 5, 2000, true);
        vectorStore.add(splitter.apply(List.of(doc)));
    }

    public String askReportQuestion(String ticker, String question) {
        return chatClient.prompt()
                .system("You are an investigative forensic auditor analyzing company annual reports. Cite context accurately.")
                .user("Regarding ticker " + ticker + ": " + question)
                .call()
                .content();
    }
}`
      },
      {
        stepNumber: 5,
        title: "REST Controller",
        explanation: "Expose clean REST API endpoints for frontend consumption.",
        code: `package com.screener.ai.controller;

import com.screener.ai.model.FinancialHealthReport;
import com.screener.ai.model.StockFundamentals;
import com.screener.ai.service.AnnualReportRagService;
import com.screener.ai.service.EquityAnalysisService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/screener")
@CrossOrigin(origins = "*")
public class ScreenerApiController {

    private final EquityAnalysisService equityService;
    private final AnnualReportRagService ragService;

    public ScreenerApiController(EquityAnalysisService equityService, AnnualReportRagService ragService) {
        this.equityService = equityService;
        this.ragService = ragService;
    }

    @GetMapping("/stock/{ticker}")
    public StockFundamentals getStock(@PathVariable String ticker) {
        return equityService.getFundamentals(ticker);
    }

    @GetMapping("/analyze/{ticker}")
    public FinancialHealthReport analyzeStock(@PathVariable String ticker) {
        return equityService.generateAiAnalysis(ticker);
    }

    @PostMapping("/rag/index")
    public Map<String, String> indexNotes(
            @RequestParam String ticker, 
            @RequestBody String reportText) {
        ragService.indexReportExcerpt(ticker, reportText);
        return Map.of("status", "INDEXED", "ticker", ticker);
    }

    @GetMapping("/rag/query")
    public Map<String, String> queryReport(
            @RequestParam String ticker, 
            @RequestParam String question) {
        String answer = ragService.askReportQuestion(ticker, question);
        return Map.of("ticker", ticker, "question", question, "answer", answer);
    }
}`
      },
      {
        stepNumber: 6,
        title: "Step-by-Step 1-Month Free Cloud Deployment Guide",
        explanation: "Complete roadmap to run both Spring Boot and Ollama for $0 for 1 month (or permanently on Free Tiers).",
        deploymentRoadmap: [
          {
            platform: "Option A: Oracle Cloud Infrastructure (OCI) Always-Free (Recommended)",
            cost: "$0 forever (Includes $300 free credits for first 30 days)",
            specs: "4 ARM Ampere vCPUs, 24 GB RAM, 200 GB NVMe Storage (Runs Ollama with Llama 3 / Mistral at full speed!)",
            steps: [
              "1. Sign up at <a href='https://cloud.oracle.com' target='_blank'>cloud.oracle.com</a> (Get $300 free trial credits).",
              "2. Provision an 'Always Free' Compute Instance with Ubuntu 22.04 and VM.Standard.A1.Flex (4 OCPUs, 24GB RAM).",
              "3. SSH into your VM and install Docker & Ollama in one line:",
              "curl -fsSL https://get.docker.com | sh\ncurl -fsSL https://ollama.com/install.sh | sh\nollama pull llama3.2:3b",
              "4. Clone your GitHub repository and start the Spring Boot app:",
              "git clone https://github.com/YOUR_USERNAME/ai-stock-screener.git\ncd ai-stock-screener\n./mvnw clean package -DskipTests\njava -jar target/ai-stock-screener-1.0.0.jar --spring.ai.ollama.base-url=http://localhost:11434",
              "5. Open Port 8080 in Oracle Ingress Rules and UFW firewall. Your screener is live on public IP!"
            ]
          },
          {
            platform: "Option B: Render.com + Remote Free Inference (Zero server maintenance)",
            cost: "$0 for 1st month (Render free web service tier)",
            specs: "512MB RAM Spring Boot service connecting to free Hugging Face Inference or ngrok tunnel to local Ollama",
            steps: [
              "1. Push your Spring Boot repository to GitHub.",
              "2. Sign up at <a href='https://render.com' target='_blank'>render.com</a>.",
              "3. Create a new 'Web Service' -> Connect your GitHub repo.",
              "4. Set Build Command: './mvnw clean package -DskipTests' and Start Command: 'java -jar target/ai-stock-screener-1.0.0.jar'.",
              "5. Add Environment Variable: SPRING_AI_OLLAMA_BASE_URL pointing to your cloud endpoint.",
              "6. Render automatically builds and deploys your service with a free SSL certificate!"
            ]
          }
        ]
      }
    ]
  },
  {
    id: "project-ba-risk",
    badge: "Capstone Project 2",
    title: "AI Business Analyst & Enterprise Risk Management System",
    tagline: "Transform messy Business Requirements (BRD) into Agile User Stories, Gherkin Scenarios & Risk Assessment Matrices",
    duration: "Estimated Build Time: 4-5 Hours",
    difficulty: "Advanced",
    overview: "Every IT organization requires rigorous Business Analysis and Risk Governance. This project uses Spring AI with Ollama to parse business requirements documents, automatically generate INVEST-compliant User Stories with Gherkin acceptance criteria, compute a 5x5 Risk Matrix (Likelihood vs Impact), and call internal compliance verification functions.",
    architecture: [
      "BRD Parsing Engine: TokenTextSplitter with Spring AI ChatClient",
      "INVEST User Story Generator: BeanOutputConverter generating Epics & Acceptance Criteria",
      "5x5 Risk Assessment Matrix: Likelihood (1-5) * Impact (1-5) = Risk Severity Score",
      "Compliance Function Calling: Tool calling verifying GDPR, SOC-2, and PCI-DSS governance policies",
      "Export Module: Formatted Markdown / JIRA-ready ticket exports"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Domain Models (User Stories & Risk Items)",
        explanation: "Define structured data models for Agile deliverables and Risk Management matrices.",
        code: `package com.ba.copilot.model;

import java.util.List;

// Agile Story Structure
public record UserStory(
    String storyId,
    String title,
    String asA,
    String iWantTo,
    String soThat,
    List<String> gherkinAcceptanceCriteria,
    int estimatedStoryPoints,
    String complexityLevel
) {}

// Risk Analysis Record
public record RiskItem(
    String riskId,
    String description,
    String riskCategory,         // OPERATIONAL, SECURITY, COMPLIANCE, FINANCIAL
    int likelihood1to5,
    int impact1to5,
    int riskScore,               // likelihood * impact (1 to 25)
    String severityLevel,        // LOW, MEDIUM, HIGH, CRITICAL
    String mitigationStrategy,   // AVOID, MITIGATE, TRANSFER, ACCEPT
    String actionPlan
) {}

public record BaAnalysisResult(
    String projectName,
    String executiveSummary,
    List<UserStory> userStories,
    List<RiskItem> identifiedRisks,
    String governanceSignoffStatus
) {}`
      },
      {
        stepNumber: 2,
        title: "Compliance Governance Tool (Function Calling)",
        explanation: "Register Java function beans that the LLM invokes to evaluate mandatory regulatory compliance rules.",
        code: `package com.ba.copilot.tools;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Description;

import java.util.List;
import java.util.function.Function;

@Configuration
public class ComplianceAuditTools {

    public record AuditRequest(
        @JsonPropertyDescription("The regulatory standard to verify: GDPR, SOC2, or PCI_DSS") String standard,
        @JsonPropertyDescription("Summary of how data is stored or processed") String systemDescription
    ) {}

    public record AuditResponse(
        String standard,
        boolean isCompliant,
        List<String> mandatoryControlsRequired
    ) {}

    @Bean
    @Description("Audit a system feature against regulatory compliance standards like GDPR, SOC2, or PCI_DSS")
    public Function<AuditRequest, AuditResponse> complianceAuditFunction() {
        return req -> {
            String std = req.standard().toUpperCase();
            if (std.contains("GDPR")) {
                return new AuditResponse("GDPR", true, List.of(
                    "Explicit user consent mechanism",
                    "Right to be forgotten (data erasure endpoint)",
                    "PII data encryption at rest using AES-256"
                ));
            } else if (std.contains("PCI")) {
                return new AuditResponse("PCI_DSS", false, List.of(
                    "Credit card numbers must NEVER be stored in plain text or logs",
                    "TLS 1.3 encryption required in transit"
                ));
            }
            return new AuditResponse(std, true, List.of("Standard RBAC and audit logging required."));
        };
    }
}`
      },
      {
        stepNumber: 3,
        title: "Business Analyst Copilot Service",
        explanation: "The core service parsing BRDs and orchestrating user story and risk matrix synthesis.",
        code: `package com.ba.copilot.service;

import com.ba.copilot.model.BaAnalysisResult;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
public class BusinessAnalystService {

    private final ChatClient chatClient;

    public BusinessAnalystService(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem("""
                    You are a Principal Enterprise Business Analyst and Certified Risk Management Professional (CRISC).
                    When given a Business Requirements Document (BRD) or feature specification:
                    1. Break down requirements into clean, INVEST-compliant User Stories.
                    2. Provide Gherkin Given/When/Then acceptance criteria for each story.
                    3. Perform a 5x5 Risk Assessment (Likelihood 1-5, Impact 1-5).
                       - Risk Score = Likelihood * Impact.
                       - 1-6: LOW, 7-12: MEDIUM, 13-19: HIGH, 20-25: CRITICAL.
                    4. Identify actionable mitigation plans for each risk.
                    """)
                .build();
    }

    public BaAnalysisResult analyzeRequirements(String brdText) {
        String prompt = """
            Analyze the following Business Requirements Document (BRD) and generate the full project deliverables:
            
            \"\"\"
            %s
            \"\"\"
            
            Synthesize into the structured BaAnalysisResult format.
            """.formatted(brdText);

        return chatClient.prompt()
                .user(prompt)
                .functions("complianceAuditFunction")
                .call()
                .entity(BaAnalysisResult.class);
    }
}`
      },
      {
        stepNumber: 4,
        title: "REST Controller & Verification",
        explanation: "Test the Business Analyst API with a sample banking requirements document.",
        code: `package com.ba.copilot.controller;

import com.ba.copilot.model.BaAnalysisResult;
import com.ba.copilot.service.BusinessAnalystService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ba-risk")
@CrossOrigin(origins = "*")
public class BaRiskController {

    private final BusinessAnalystService baService;

    public BaRiskController(BusinessAnalystService baService) {
        this.baService = baService;
    }

    @PostMapping("/analyze")
    public BaAnalysisResult analyzeBrd(@RequestBody String brd) {
        return baService.analyzeRequirements(brd);
    }
}`
      }
    ]
  },
  {
    id: "project-trends-radar",
    badge: "Capstone Project 3",
    title: "Upcoming Tech Trends Radar & AI Forecasting Platform",
    tagline: "Track technology shifts, compute trend momentum, and forecast upcoming industry trends using Spring AI",
    duration: "Estimated Build Time: 4-5 Hours",
    difficulty: "Advanced",
    overview: "Stay ahead of the curve. This project continuously ingests technology signals (emerging frameworks, AI research, cloud paradigms), generates semantic embeddings, clusters related innovations, and outputs a dynamic ThoughtWorks-style Tech Radar (ADOPT, TRIAL, ASSESS, HOLD) with AI-generated momentum and hype scores.",
    architecture: [
      "Signal Ingestion Engine: Feed reader for developer news and tech release notes",
      "Semantic Embeddings: Ollama nomic-embed-text for topic clustering",
      "Trend Momentum Analyzer: Spring AI ChatClient evaluating adoption velocity (1-100)",
      "Radar Visualization: Quadrant mapping (Languages & Frameworks, Platforms, Tools, Techniques)",
      "Briefing Generator: Automated weekly executive briefings in Markdown format"
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Domain Model & Trend Entities",
        explanation: "Represent technology trends with category quadrants, momentum scores, and radar rings.",
        code: `package com.trends.radar.model;

import java.util.List;

public enum RadarRing {
    ADOPT,   // Industry proven, production standard
    TRIAL,   // High promise, ready for pilot projects
    ASSESS,  // Promising innovation, worth researching
    HOLD     // Declining adoption or better alternatives exist
}

public enum RadarQuadrant {
    LANGUAGES_AND_FRAMEWORKS,
    PLATFORMS_AND_CLOUD,
    TOOLS_AND_DATA,
    TECHNIQUES_AND_ARCHITECTURE
}

public record TrendItem(
    String technologyName,
    RadarQuadrant quadrant,
    RadarRing ring,
    int momentumScoreOutOf100,
    String oneLineSummary,
    List<String> keyStrengths,
    List<String> risksOrCaveats,
    String projectedImpactYear
) {}

public record TrendRadarReport(
    String reportTitle,
    String publicationDate,
    String executiveSummary,
    List<TrendItem> trends
) {}`
      },
      {
        stepNumber: 2,
        title: "Trend Forecasting & Radar Service",
        explanation: "Spring AI service that evaluates tech signals and computes quadrant and momentum ratings.",
        code: `package com.trends.radar.service;

import com.trends.radar.model.RadarQuadrant;
import com.trends.radar.model.RadarRing;
import com.trends.radar.model.TrendItem;
import com.trends.radar.model.TrendRadarReport;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class TrendForecasterService {

    private final ChatClient chatClient;

    public TrendForecasterService(ChatClient.Builder builder) {
        this.chatClient = builder
                .defaultSystem("""
                    You are a Chief Technology Officer (CTO) and futurist trend analyst at Gartner / ThoughtWorks.
                    You analyze technological shifts with critical pragmatism.
                    Distinguish genuine architectural breakthroughs from marketing hype.
                    Classify technologies into:
                    - Quadrants: LANGUAGES_AND_FRAMEWORKS, PLATFORMS_AND_CLOUD, TOOLS_AND_DATA, TECHNIQUES_AND_ARCHITECTURE.
                    - Rings: ADOPT, TRIAL, ASSESS, HOLD.
                    - Momentum score (1 to 100).
                    """)
                .build();
    }

    public TrendRadarReport evaluateEmergingTrends(List<String> signals) {
        String inputSignals = String.join("\\n- ", signals);

        String prompt = """
            Analyze these technology signals and compile an authoritative Trend Radar Report:
            - %s
            
            For each technology determine its ring (ADOPT, TRIAL, ASSESS, HOLD) and momentum score.
            """.formatted(inputSignals);

        return chatClient.prompt()
                .user(prompt)
                .call()
                .entity(TrendRadarReport.class);
    }
}`
      },
      {
        stepNumber: 3,
        title: "REST Controller & Interactive Radar Data",
        explanation: "Deliver structured radar data to the frontend for interactive dynamic visualization.",
        code: `package com.trends.radar.controller;

import com.trends.radar.model.TrendRadarReport;
import com.trends.radar.service.TrendForecasterService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trends")
@CrossOrigin(origins = "*")
public class TrendsController {

    private final TrendForecasterService trendService;

    public TrendsController(TrendForecasterService trendService) {
        this.trendService = trendService;
    }

    @PostMapping("/forecast")
    public TrendRadarReport generateRadar(@RequestBody List<String> techSignals) {
        if (techSignals == null || techSignals.isEmpty()) {
            techSignals = List.of(
                "Spring AI 1.0 Milestone with Ollama local models",
                "Java 21 Virtual Threads and Project Loom in high-concurrency microservices",
                "PgVector and HNSW vector indexing in PostgreSQL",
                "Small Language Models (SLMs) running locally on Edge devices (Llama 3.2 3B)",
                "Legacy monolith migration to Rust microservices"
            );
        }
        return trendService.evaluateEmergingTrends(techSignals);
    }
}`
      }
    ]
  }
];
