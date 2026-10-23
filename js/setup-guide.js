/**
 * setup-guide.js
 * Comprehensive guide for installing Ollama, setting up Java 21/17, and bootstrapping Spring Boot with Spring AI.
 */

const setupGuideData = {
  title: "Prerequisites & Ollama Local LLM Setup Guide",
  subtitle: "Everything you need before Day 1: Zero Cloud Costs, 100% Local Execution",
  sections: [
    {
      id: "ollama-install",
      title: "Step 1: Install Ollama (Offline Local LLM Engine)",
      icon: "🦙",
      description: "Ollama is the Docker of LLMs. It lets you run models like Llama 3.2, Mistral, and DeepSeek locally on your CPU or GPU with a lightweight C++ engine.",
      osTabs: [
        {
          os: "Windows",
          steps: [
            "Download the installer from <a href='https://ollama.com/download/windows' target='_blank' class='external-link'>ollama.com/download/windows</a> or run via WinGet:",
            "winget install Ollama.Ollama",
            "Once installed, Ollama runs in your system tray automatically.",
            "Verify by opening PowerShell or CMD and typing:",
            "ollama --version"
          ]
        },
        {
          os: "macOS",
          steps: [
            "Download the .zip from <a href='https://ollama.com/download/mac' target='_blank' class='external-link'>ollama.com/download/mac</a> or install via Homebrew:",
            "brew install ollama",
            "Start the background service or run the desktop app:",
            "ollama serve",
            "Verify installation in your terminal:",
            "ollama --version"
          ]
        },
        {
          os: "Linux",
          steps: [
            "Run the official one-line install script:",
            "curl -fsSL https://ollama.com/install.sh | sh",
            "Start the systemd service (if not auto-started):",
            "sudo systemctl start ollama\nsudo systemctl enable ollama",
            "Verify installation:",
            "ollama --version"
          ]
        }
      ],
      pullModels: {
        title: "Pull Required Models for the 30-Day Course",
        intro: "We will use lightweight yet state-of-the-art models that run fast even on 8GB RAM machines without a dedicated GPU:",
        models: [
          {
            name: "llama3.2:3b",
            type: "Chat / Reasoning",
            size: "2.0 GB",
            recommendedFor: "Daily chat, prompt templates, structured output, function calling",
            cmd: "ollama pull llama3.2:3b"
          },
          {
            name: "mistral:7b",
            type: "High Accuracy Chat",
            size: "4.1 GB",
            recommendedFor: "Complex analysis, financial reasoning in Capstone Projects",
            cmd: "ollama pull mistral:7b"
          },
          {
            name: "nomic-embed-text",
            type: "Embeddings / Vector Store",
            size: "274 MB",
            recommendedFor: "RAG, Document search, Vector embeddings",
            cmd: "ollama pull nomic-embed-text"
          }
        ]
      },
      verifyApi: {
        title: "Verify Ollama REST API Endpoint",
        desc: "Ollama exposes a REST API at port 11434 by default. Test it using curl:",
        curlCommand: `curl http://localhost:11434/api/generate -d '{\n  "model": "llama3.2:3b",\n  "prompt": "Hello Spring AI! Say 'Ready to code' in 5 words.",\n  "stream": false\n}'`,
        expectedJson: `{\n  "model": "llama3.2:3b",\n  "response": "Ready to code with Spring!",\n  "done": true\n}`
      }
    },
    {
      id: "java-spring-setup",
      title: "Step 2: Java 21 & Maven Installation",
      icon: "☕",
      description: "Spring Boot 3.3+ and Spring AI require Java 17 or Java 21 (Java 21 LTS is highly recommended for virtual threads support).",
      details: [
        {
          title: "Install JDK 21 (Eclipse Temurin / OpenJDK)",
          code: `# Windows (via Winget or Chocolatey)\nwinget install EclipseAdoptium.Temurin.21.JDK\n\n# macOS (via Homebrew)\nbrew install openjdk@21\n\n# Ubuntu/Debian Linux\nsudo apt update && sudo apt install -y openjdk-21-jdk`
        },
        {
          title: "Verify Java & Maven",
          code: `java -version\n# Expected: openjdk version "21.0.x" ...\n\nmvn -version\n# Expected: Apache Maven 3.9.x ...`
        }
      ]
    },
    {
      id: "spring-initializr",
      title: "Step 3: Create Spring Boot 3.3+ Project with Spring AI",
      icon: "🌱",
      description: "Initialize your project via Spring Initializr (start.spring.io) or using cURL directly from terminal.",
      initializrConfig: {
        project: "Maven",
        language: "Java",
        springBootVersion: "3.3.4 (or 3.4.x)",
        group: "com.learnspringai",
        artifact: "spring-ai-30days",
        packaging: "Jar",
        java: "21",
        dependencies: [
          "Spring Web (spring-boot-starter-web)",
          "Ollama (spring-ai-ollama-spring-boot-starter)",
          "Spring Boot DevTools (optional)",
          "Lombok (optional)"
        ]
      },
      cliCommand: `curl https://start.spring.io/starter.zip \\
  -d dependencies=web,devtools \\
  -d type=maven-project \\
  -d language=java \\
  -d bootVersion=3.3.4 \\
  -d groupId=com.learnspringai \\
  -d artifactId=spring-ai-30days \\
  -d name=spring-ai-30days \\
  -d javaVersion=21 \\
  -o spring-ai-30days.zip
unzip spring-ai-30days.zip
cd spring-ai-30days`,
      pomSnippet: `<!-- Add Spring AI Milestone Repository to pom.xml -->
<repositories>
    <repository>
        <id>spring-milestones</id>
        <name>Spring Milestones</name>
        <url>https://repo.spring.io/milestone</url>
        <snapshots>
            <enabled>false</enabled>
        </snapshots>
    </repository>
</repositories>

<!-- Spring AI Dependency Management BOM -->
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>1.0.0-M4</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Ollama Spring Boot Starter -->
<dependencies>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-ollama-spring-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>`
    },
    {
      id: "app-yml-config",
      title: "Step 4: application.yml Configuration for Ollama",
      icon: "⚙️",
      description: "Connect Spring Boot to your local Ollama instance running on port 11434.",
      ymlContent: `spring:
  application:
    name: spring-ai-30days
  ai:
    ollama:
      base-url: http://localhost:11434
      chat:
        enabled: true
        options:
          model: llama3.2:3b
          temperature: 0.7
          top-p: 0.9
      embedding:
        enabled: true
        options:
          model: nomic-embed-text

server:
  port: 8080`
    },
    {
      id: "smoke-test",
      title: "Step 5: Smoke Test Controller (Verify End-to-End Setup)",
      icon: "🔥",
      description: "Create a simple test controller to ensure Spring Boot successfully speaks to Ollama.",
      javaCode: `package com.learnspringai.controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class SetupVerificationController {

    private final ChatClient chatClient;

    public SetupVerificationController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    @GetMapping("/api/test-ollama")
    public Map<String, Object> testOllama(
            @RequestParam(defaultValue = "Tell me one fun fact about Java") String prompt) {
        
        String response = chatClient.prompt()
                .user(prompt)
                .call()
                .content();

        return Map.of(
            "status", "CONNECTED",
            "model", "llama3.2:3b",
            "prompt", prompt,
            "response", response
        );
    }
}`,
      testCmd: `curl "http://localhost:8080/api/test-ollama?prompt=Why+is+Spring+Boot+awesome"`
    }
  ]
};
