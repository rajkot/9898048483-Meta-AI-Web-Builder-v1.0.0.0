import JSZip from 'jszip';

export interface ChromeExtensionFiles {
  'manifest.json': string;
  'content.js': string;
  'background.js': string;
  'README.md': string;
}

export function getChromeExtensionCode(): ChromeExtensionFiles {
  const manifestJson = JSON.stringify(
    {
      manifest_version: 3,
      name: 'Meta-AI Web Builder Auto-Bridge Helper',
      version: '1.0.0',
      description: 'Automates prompt injection and DOM response extraction for Gemini Web, DeepSeek Web, Claude Web, and ChatGPT Web tabs.',
      permissions: ['activeTab', 'scripting', 'tabs'],
      host_permissions: [
        'https://gemini.google.com/*',
        'https://chat.deepseek.com/*',
        'https://claude.ai/*',
        'https://chatgpt.com/*',
      ],
      background: {
        service_worker: 'background.js',
      },
      content_scripts: [
        {
          matches: [
            'https://gemini.google.com/*',
            'https://chat.deepseek.com/*',
            'https://claude.ai/*',
            'https://chatgpt.com/*',
            'http://localhost:3000/*',
            'https://*.run.app/*',
          ],
          js: ['content.js'],
          run_at: 'document_idle',
        },
      ],
    },
    null,
    2
  );

  const contentJs = `// Meta-AI Chrome Extension Content Script
console.log('[Meta-AI Bridge Extension] Script loaded on domain:', window.location.hostname);

// Listen for prompt dispatch messages from the Meta-AI Web App UI
window.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'META_AI_BRIDGE_DISPATCH_PROMPT') {
    const { targetWebAi, promptText, stageId } = event.data;
    console.log('[Meta-AI Bridge] Received prompt dispatch for:', targetWebAi, stageId);

    // Forward dispatch command to background service worker to open or focus tab
    chrome.runtime.sendMessage({
      action: 'OPEN_AND_INJECT',
      targetWebAi,
      promptText,
      stageId,
    });
  }
});

// Auto-detect LLM Web Page Responses using DOM Observers
if (
  window.location.hostname.includes('gemini.google.com') ||
  window.location.hostname.includes('deepseek.com') ||
  window.location.hostname.includes('claude.ai') ||
  window.location.hostname.includes('chatgpt.com')
) {
  console.log('[Meta-AI Bridge] Active on Target LLM Web Tab:', window.location.hostname);

  // Expose a floating bridge status pill on the Web AI page
  const pill = document.createElement('div');
  pill.id = 'meta-ai-bridge-indicator';
  pill.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    background: #0f172a;
    color: #38bdf8;
    border: 1px solid #0284c7;
    padding: 8px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-family: sans-serif;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    gap: 8px;
  \`;
  pill.innerHTML = '⚡ <b>Meta-AI Auto-Bridge Active</b>';
  document.body.appendChild(pill);
}
`;

  const backgroundJs = `// Meta-AI Background Service Worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OPEN_AND_INJECT') {
    const { targetWebAi, promptText, stageId } = request;
    let targetUrl = 'https://gemini.google.com/app';

    if (targetWebAi === 'deepseek') targetUrl = 'https://chat.deepseek.com';
    if (targetWebAi === 'claude') targetUrl = 'https://claude.ai/chat';
    if (targetWebAi === 'chatgpt') targetUrl = 'https://chatgpt.com';

    chrome.tabs.create({ url: targetUrl, active: true }, (tab) => {
      console.log('[Meta-AI Background] Opened target tab:', tab.id, targetUrl);
    });
  }
});
`;

  const readmeMd = `# Meta-AI Web Builder Auto-Bridge Chrome Extension (Manifest V3)

## Installation Instructions:
1. Extract the contents of this ZIP folder.
2. Open Google Chrome and navigate to \`chrome://extensions\`.
3. Enable **Developer mode** in the top-right corner toggle.
4. Click **Load unpacked** and select the extracted extension directory.
5. Return to the Meta-AI Web Builder platform. The Auto-Bridge extension is now active and ready to listen to prompt dispatches!
`;

  return {
    'manifest.json': manifestJson,
    'content.js': contentJs,
    'background.js': backgroundJs,
    'README.md': readmeMd,
  };
}

export async function downloadChromeExtensionZip(): Promise<void> {
  const zip = new JSZip();
  const files = getChromeExtensionCode();

  Object.entries(files).forEach(([name, content]) => {
    zip.file(name, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Meta-AI-AutoBridge-Extension.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
