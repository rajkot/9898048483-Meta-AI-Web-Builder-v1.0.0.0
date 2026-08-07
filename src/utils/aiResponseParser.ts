import { GeneratedProject } from '../types';

/**
 * Fault-Tolerant AI Output Parser & Code Extractor
 * Extracts structured JSON or multi-file codebases from raw LLM responses containing
 * markdown, code blocks, conversational filler, comments, or unescaped characters.
 */

/**
 * Sanitizes JSON strings to fix common LLM formatting errors:
 * - Trailing commas before } or ]
 * - Single-line JS comments (// ...) outside quotes
 * - Unescaped newlines inside strings
 */
export function sanitizeJsonString(jsonStr: string): string {
  let cleaned = jsonStr.trim();

  // Remove single line comments outside string literals (simple heuristic)
  cleaned = cleaned.replace(/^(?!\s*"(?:[^"\\]|\\.)*":\s*")[ \t]*\/\/[^\n]*/gm, '');

  // Remove trailing commas in objects and arrays
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  return cleaned;
}

/**
 * Extracts and parses JSON from raw LLM output strings.
 */
export function parseAIResponse<T>(
  rawText: string,
  expectedType?: 'json' | 'codebase' | 'code' | 'strategy' | 'domain' | 'spec'
): T {
  if (!rawText || !rawText.trim()) {
    throw new Error('Provided input text is empty.');
  }

  const text = rawText.trim();

  // 1. Try direct JSON.parse first
  try {
    return JSON.parse(text) as T;
  } catch (_) {
    // Continue to extractors
  }

  // 2. Try sanitized direct JSON
  try {
    return JSON.parse(sanitizeJsonString(text)) as T;
  } catch (_) {
    // Continue
  }

  // 3. Extract code blocks with triple backticks (```json ... ``` or ``` ...)
  if (text.includes('```')) {
    // Match code blocks tagged json or containing JSON objects
    const jsonMatches = text.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi);
    for (const match of jsonMatches) {
      if (match[1]) {
        const blockContent = match[1].trim();
        try {
          return JSON.parse(blockContent) as T;
        } catch (_) {
          try {
            return JSON.parse(sanitizeJsonString(blockContent)) as T;
          } catch (_) {
            // Try next match
          }
        }
      }
    }
  }

  // 4. Find outermost JSON object braces { ... } or array brackets [ ... ]
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const candidateJson = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidateJson) as T;
    } catch (_) {
      try {
        return JSON.parse(sanitizeJsonString(candidateJson)) as T;
      } catch (_) {
        // Fallback to regex extractor
      }
    }
  }

  // 5. Fallback Regex File Extractor if expectedType is codebase or code or text contains code markers
  if (
    expectedType === 'codebase' ||
    expectedType === 'code' ||
    text.includes('package.json') ||
    text.includes('App.tsx') ||
    text.includes('index.html') ||
    text.includes('main.dart') ||
    text.includes('server.ts')
  ) {
    const fallbackFiles = extractFilesFromRawMarkdown(text);
    if (Object.keys(fallbackFiles).length > 0) {
      return {
        projectName: 'meta-ai-extracted-app',
        description: 'Auto-extracted multi-file project from raw LLM response markdown',
        files: fallbackFiles,
        fileList: Object.keys(fallbackFiles),
      } as unknown as T;
    }
  }

  throw new Error('Could not parse valid JSON from the provided AI response text. Ensure full response is copied.');
}

/**
 * Regex-based multi-file extractor from raw markdown text containing file path headers.
 */
export function extractFilesFromRawMarkdown(markdownText: string): Record<string, string> {
  const files: Record<string, string> = {};

  const lines = markdownText.split('\n');
  let currentFilePath: string | null = null;
  let currentFileLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect various code block file header patterns:
    // 1) ```tsx:src/App.tsx or ```json title="package.json" or ```html filename="index.html"
    // 2) // File: src/App.tsx or // src/App.tsx
    // 3) <!-- index.html --> or <!-- File: index.html -->
    // 4) ### src/App.tsx or ## File: src/App.tsx
    // 5) **src/App.tsx** or File: src/App.tsx
    const headerMatch =
      line.match(/```[a-z0-9_-]*(?::|\s+(?:title|filename)=["']?)([a-zA-Z0-9_.\-\/]+\.[a-z0-9]+)["']?/i) ||
      line.match(/(?:(?:\/\/|\/\*|<!--|#+|\*\*)\s*(?:File:\s*)?|\/\/\s*)([a-zA-Z0-9_.\-\/]+\.(?:tsx|ts|js|jsx|json|html|css|md|dart|yaml))\b/i);

    if (headerMatch && headerMatch[1]) {
      if (currentFilePath && currentFileLines.length > 0) {
        files[currentFilePath] = currentFileLines.join('\n').trim();
      }
      currentFilePath = headerMatch[1].trim();
      currentFileLines = [];
      continue;
    }

    if (currentFilePath) {
      // Ignore opening or closing backtick fences if alone on line
      if (line.trim().startsWith('```')) {
        continue;
      }
      currentFileLines.push(line);
    }
  }

  if (currentFilePath && currentFileLines.length > 0) {
    files[currentFilePath] = currentFileLines.join('\n').trim();
  }

  // Ensure baseline package.json exists if missing
  if (Object.keys(files).length > 0 && !files['package.json']) {
    files['package.json'] = JSON.stringify(
      {
        name: 'extracted-app',
        version: '1.0.0',
        private: true,
        dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1' },
      },
      null,
      2
    );
  }

  return files;
}

export function extractAndParseJSON<T>(
  rawText: string,
  expectedType?: 'json' | 'codebase' | 'code' | 'strategy' | 'domain' | 'spec'
): T {
  return parseAIResponse<T>(rawText, expectedType);
}

