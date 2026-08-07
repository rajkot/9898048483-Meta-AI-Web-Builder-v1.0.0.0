import { DomainAnswers, MasterSpec, StrategyOption, TargetStackOption } from '../types';
import { parseAIResponse, extractAndParseJSON as parseJSON } from './aiResponseParser';
import { DEFAULT_TARGET_STACK } from './targetStacks';

export const extractAndParseJSON = parseJSON;
export { parseAIResponse };

/**
 * Stage 1: Prompt for Gemini Web (gemini.google.com/app)
 */
export function generateStage1GeminiPrompt(
  userPrompt: string,
  targetStack: TargetStackOption = DEFAULT_TARGET_STACK
): string {
  return `You are acting as a Principal Software Architect for Gemini Web AI.
Analyze the following web app idea and generate 3 distinct strategic architectural build options tailored specifically for the target technology stack: "${targetStack.name} (${targetStack.description})".

USER IDEA:
"${userPrompt}"

TARGET TECH STACK PRESET:
${targetStack.name}
Default Tech: ${targetStack.defaultTech.join(', ')}

REQUIREMENTS:
1. Provide 3 strategic options with distinct tradeoffs tailored for ${targetStack.name}.
2. Format your response strictly as valid JSON matching this schema:

\`\`\`json
{
  "overallAnalysis": "Executive architectural overview and tech strategy for ${targetStack.name}",
  "primaryRecommendation": "Option A - High-Speed ${targetStack.name} Architecture",
  "options": [
    {
      "id": "opt-1",
      "name": "High-Speed ${targetStack.name} Architecture",
      "tag": "Fastest Time-to-Market",
      "description": "Streamlined architecture optimized for ${targetStack.name}.",
      "architecture": "Optimized stack with responsive UI & clean state management",
      "techStack": [${targetStack.defaultTech.map((t) => `"${t}"`).join(', ')}],
      "keyFeatures": [
        "Instant responsive dashboard and controls",
        "Client-side search and state persistence",
        "Automated Google Drive cloud export"
      ],
      "uxApproach": "Clean modern layout with high-contrast theme",
      "targetAudience": "Developers and early adopters",
      "prosCons": {
        "pros": ["Zero backend latency", "Ultra fast time-to-market"],
        "cons": ["Targeted to ${targetStack.name}"]
      }
    },
    {
      "id": "opt-2",
      "name": "Enterprise Multi-Module ${targetStack.name}",
      "tag": "Maximum Scalability",
      "description": "Modular structure with comprehensive analytics and cloud sync.",
      "architecture": "Full modular architecture with persistent state and sync APIs",
      "techStack": [${targetStack.defaultTech.map((t) => `"${t}"`).join(', ')}],
      "keyFeatures": [
        "Multi-role user dashboard and workflow management",
        "Automated Google Drive cloud sync with permissions API",
        "Comprehensive analytics and reporting widgets"
      ],
      "uxApproach": "Enterprise dark neon aesthetic with sidebar navigation",
      "targetAudience": "Product teams and corporate enterprises",
      "prosCons": {
        "pros": ["Highly scalable", "Robust cloud persistence"],
        "cons": ["Slightly higher architectural complexity"]
      }
    },
    {
      "id": "opt-3",
      "name": "AI-Native ${targetStack.name} Portal",
      "tag": "Next-Gen AI First",
      "description": "Autonomous prompt-driven portal with interactive execution.",
      "architecture": "Event-driven reactive frontend with local LLM prompt bridge",
      "techStack": [${targetStack.defaultTech.map((t) => `"${t}"`).join(', ')}],
      "keyFeatures": [
        "Automated prompt bridge and response extractor",
        "Live interactive sandbox execution environment",
        "Direct export to ZIP and Google Drive"
      ],
      "uxApproach": "Cyberpunk dark theme with live code execution logs",
      "targetAudience": "AI engineers and prompt architects",
      "prosCons": {
        "pros": ["Cutting edge AI workflow", "Zero backend overhead"],
        "cons": ["Requires prompt interaction"]
      }
    }
  ]
}
\`\`\`

Respond ONLY with valid JSON. Do not add introductory or conversational filler outside the JSON code block.`;
}

/**
 * Stage 2: Prompt for DeepSeek Web (chat.deepseek.com)
 */
export function generateStage2DeepSeekPrompt(
  userPrompt: string,
  selectedStrategy: StrategyOption,
  targetStack: TargetStackOption = DEFAULT_TARGET_STACK
): string {
  return `You are acting as DeepSeek-R1 Domain Logic Collector for DeepSeek Web AI.
Given the user's project idea, target tech stack (${targetStack.name}), and chosen strategy option, generate exactly 4 deep domain collector questions to refine business requirements before writing the Master Specification contract.

PROJECT IDEA:
"${userPrompt}"

TARGET STACK:
${targetStack.name} (${targetStack.description})

CHOSEN STRATEGY:
Name: ${selectedStrategy.name}
Architecture: ${selectedStrategy.architecture}
Tech Stack: ${selectedStrategy.techStack.join(', ')}

REQUIREMENTS:
1. Provide 4 targeted domain questions covering 4 distinct categories: "User Persona", "Data & Workflow", "UX / Visual Branding", and "Integrations & Cloud Sync".
2. Include 2-3 quick suggested answer options for each question.
3. Respond strictly in valid JSON matching this schema:

\`\`\`json
{
  "questions": [
    {
      "id": "q1",
      "category": "User Persona",
      "question": "Who is the primary end-user persona and what is their key objective?",
      "fieldKey": "targetPersona",
      "hint": "Define the target user role or workflow context",
      "suggestedAnswers": [
        "Developers and engineers looking for fast workflow automation",
        "Product managers generating executive spec reports",
        "Creators and designers organizing digital asset pipelines"
      ]
    },
    {
      "id": "q2",
      "category": "Data & Workflow",
      "question": "What primary data entities and workflows require tracking and state management?",
      "fieldKey": "dataEntities",
      "hint": "Identify key records, state models, or file outputs",
      "suggestedAnswers": [
        "Projects, File Trees, and Code Artifacts",
        "User Profiles, Settings, and Token Configurations",
        "Workflow Automation Steps and Event Logs"
      ]
    },
    {
      "id": "q3",
      "category": "UX / Visual Branding",
      "question": "What is the preferred visual design system and color theme?",
      "fieldKey": "visualTheme",
      "hint": "Select color palette and layout density",
      "suggestedAnswers": [
        "Futuristic Dark Slate (Indigo & Cyan Accents)",
        "Clean Minimalist SaaS Light (Emerald & Gray Accents)",
        "High-Density Command Grid (Dark Monospace Terminal)"
      ]
    },
    {
      "id": "q4",
      "category": "Integrations & Cloud Sync",
      "question": "How should generated project artifacts be exported and persisted in the cloud?",
      "fieldKey": "cloudIntegrations",
      "hint": "Define cloud permissions and file export targets",
      "suggestedAnswers": [
        "Google Drive Auto-Sync with Editor Permissions to target user",
        "Standalone ZIP file download for local offline development",
        "Chrome Extension auto-bridge for seamless web AI tab sync"
      ]
    }
  ]
}
\`\`\`

Respond ONLY with valid JSON.`;
}

/**
 * Stage 3: Prompt for Claude Web (claude.ai/chat)
 */
export function generateStage3ClaudePrompt(
  userPrompt: string,
  selectedStrategy: StrategyOption,
  domainAnswers: DomainAnswers,
  targetStack: TargetStackOption = DEFAULT_TARGET_STACK
): string {
  return `You are acting as Master Spec Architect (Claude 3.7 / GPT-4o Persona) for Claude Web AI.
Synthesize the user's project request, target tech stack (${targetStack.name}), chosen strategy, and domain collector answers into a comprehensive MASTER_PROMPT.md technical contract and JSON spec.

USER REQUEST:
"${userPrompt}"

TARGET TECH STACK:
${targetStack.name} (${targetStack.defaultTech.join(', ')})

CHOSEN STRATEGY:
${selectedStrategy.name} (${selectedStrategy.architecture})

DOMAIN SPECIFICATIONS:
${JSON.stringify(domainAnswers, null, 2)}

REQUIREMENTS:
Provide a single valid JSON object containing:
1. \`title\`: Title of the master spec
2. \`version\`: "1.0.0-PROD"
3. \`overview\`: Summary of the system
4. \`targetAudience\`: Defined persona
5. \`techStackSummary\`: ${targetStack.name}
6. \`masterPromptMarkdown\`: Comprehensive markdown specification ready for code generation
7. \`technicalJsonSpec\`: JSON breakdown of app structure, components, data models, and design tokens.

Schema:
\`\`\`json
{
  "title": "Master Specification: ${selectedStrategy.name}",
  "version": "1.0.0-PROD",
  "overview": "Complete architectural specification for ${userPrompt} built with ${targetStack.name}",
  "targetAudience": "${domainAnswers.targetPersona || 'Developers & Product Builders'}",
  "techStackSummary": "${targetStack.name} (${targetStack.defaultTech.join(', ')})",
  "masterPromptMarkdown": "# MASTER_PROMPT.md\\n\\n## 1. System Goal\\nBuild a ${targetStack.name} web application for: ${userPrompt}...\\n\\n## 2. Architecture\\n...",
  "technicalJsonSpec": {
    "appStructure": [${targetStack.sampleFiles.map((f) => `"${f}"`).join(', ')}],
    "coreComponents": [
      { "name": "App", "purpose": "Main stage coordinator", "stateKeys": ["activeTab", "data"] }
    ],
    "apiEndpoints": [],
    "dataModels": [
      { "entity": "Project", "fields": ["id", "name", "files"] }
    ],
    "designTokens": {
      "colorPalette": ["#020617", "#0f172a", "#6366f1"],
      "typography": "Inter / System UI",
      "layoutGrid": "Responsive Grid Layout"
    }
  }
}
\`\`\`

Respond ONLY with valid JSON.`;
}

/**
 * Stage 4: Prompt for ChatGPT / Builder Web (chatgpt.com or v0.dev)
 */
export function generateStage4ChatGPTCodePrompt(
  userPrompt: string,
  selectedStrategy: StrategyOption,
  masterSpec: MasterSpec,
  targetStack: TargetStackOption = DEFAULT_TARGET_STACK
): string {
  return `You are acting as a Senior Principal Web Code Engine for ChatGPT / Builder Web AI.
Synthesize a complete, fully functional, multi-file codebase based on the following Master Specification and Target Stack (${targetStack.name}).

USER REQUEST:
"${userPrompt}"

TARGET TECH STACK:
${targetStack.name} (${targetStack.description})

STRATEGY:
${selectedStrategy.name}

MASTER SPEC OVERVIEW:
${masterSpec.overview}

REQUIREMENTS:
1. Generate a valid JSON object where the "files" key maps exact relative file paths to complete executable code strings.
2. File paths must match the target stack conventions (${targetStack.sampleFiles.join(', ')}).
3. Every file must be complete code without truncation or placeholders.

Schema:
\`\`\`json
{
  "projectName": "meta-ai-app-${Date.now().toString(36)}",
  "description": "Full-stack ${targetStack.name} codebase generated by Meta-AI Builder",
  "strategyName": "${selectedStrategy.name}",
  "files": {
    "${targetStack.sampleFiles[0] || 'src/App.tsx'}": "// Complete production source code here",
    "${targetStack.sampleFiles[1] || 'README.md'}": "# Generated Project\\nCreated via Meta-AI Zero-API Builder"
  }
}
\`\`\`

Respond ONLY with valid JSON or raw code blocks with clear file path headings (e.g. \`// File: src/App.tsx\`).`;
}
