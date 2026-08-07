import { ProjectDraft, StageId, TargetStackOption } from '../types';
import { DEFAULT_TARGET_STACK } from './targetStacks';

const STORAGE_KEY_DRAFTS = 'meta_ai_builder_drafts_v1';
const STORAGE_KEY_ACTIVE_ID = 'meta_ai_builder_active_draft_id';

export function loadDrafts(): ProjectDraft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DRAFTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load drafts from LocalStorage:', err);
    return [];
  }
}

export const loadSavedDrafts = loadDrafts;

export function saveDraft(draft: ProjectDraft): void {
  try {
    const drafts = loadDrafts();
    const existingIndex = drafts.findIndex((d) => d.id === draft.id);
    const updatedDraft = { ...draft, updatedAt: Date.now() };

    if (existingIndex !== -1) {
      drafts[existingIndex] = updatedDraft;
    } else {
      drafts.unshift(updatedDraft);
    }

    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, draft.id);
  } catch (err) {
    console.error('Failed to save draft to LocalStorage:', err);
  }
}

export const saveProjectDraft = saveDraft;

export function getDraft(id: string): ProjectDraft | null {
  const drafts = loadDrafts();
  return drafts.find((d) => d.id === id) || null;
}

export function deleteDraft(id: string): void {
  try {
    const drafts = loadDrafts().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY_DRAFTS, JSON.stringify(drafts));
    if (getActiveDraftId() === id) {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
    }
  } catch (err) {
    console.error('Failed to delete draft from LocalStorage:', err);
  }
}

export const deleteProjectDraft = deleteDraft;

export function clearAllDrafts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_DRAFTS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
  } catch (err) {
    console.error('Failed to clear drafts:', err);
  }
}

export function getActiveDraftId(): string | null {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
}

export function setActiveDraftId(id: string): void {
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
}

export function createNewDraft(
  userPrompt?: string,
  targetStack?: TargetStackOption
): ProjectDraft {
  const newId = `draft_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
  return {
    id: newId,
    title: userPrompt ? userPrompt.substring(0, 35) + '...' : 'New SaaS Meta-AI Project',
    updatedAt: Date.now(),
    currentStage: 'strategy' as StageId,
    userPrompt: userPrompt || 'A SaaS platform that lets users input app prompts, generates multi-stage architectural options, domain questions, Master Specs, code trees, and auto-syncs to Google Drive with permissions granted to athanu000@gmail.com.',
    targetStack: targetStack || DEFAULT_TARGET_STACK,
    completedStages: {
      prompt: true,
      strategy: false,
      domain: false,
      spec: false,
      code: false,
      drive: false,
    },
    strategyBreakdown: null,
    selectedStrategy: null,
    domainQuestions: [],
    domainAnswers: {},
    masterSpec: null,
    project: null,
    syncResult: null,
  };
}
