'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Bot,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Save,
  Check,
  RotateCcw,
  Send,
  HelpCircle,
  Tag,
  Sliders,
  CheckCircle2,
  MessageCircleMore,
  AlertCircle,
  Database,
  ExternalLink,
  X
} from 'lucide-react';
import { alertNotice, confirmDialog } from '@/lib/dialogs';

function parseChatMessageLines(text) {
  if (!text) return [];
  if (text.includes('\n')) {
    return text.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  const listMatch = text.match(
    /(.*?(?:in|by|submitting|covering|features|across|including|areas|for|through|via:?)\s*)([a-zA-Z0-9\s'’/&-]+(?:,\s*[a-zA-Z0-9\s'’/&-]+)+(?:,?\s+and\s+[a-zA-Z0-9\s'’/&-]+))(\.?\s*.*)/i
  );
  if (listMatch) {
    const intro = listMatch[1].trim();
    const rawList = listMatch[2].trim();
    const outro = listMatch[3].trim();

    const items = rawList
      .split(/,\s*(?:and\s+)?|\s+and\s+/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (items.length >= 2) {
      const result = [];
      if (intro) result.push(intro.endsWith(':') ? intro : `${intro}:`);
      items.forEach((item) => {
        const formatted = item.charAt(0).toUpperCase() + item.slice(1);
        result.push(`• ${formatted}`);
      });
      if (outro && outro !== '.') result.push(outro.replace(/^\.?\s*/, ''));
      return result;
    }
  }

  return [text];
}

export default function AiChatSettingsTab({
  aiChatData,
  setAiChatData,
  onSave,
  saving,
  dirty,
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [promptForm, setPromptForm] = useState({
    id: '',
    question: '',
    answer: '',
    category: 'General',
    keywords: '',
  });
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);
  const [newChipInput, setNewChipInput] = useState('');

  // Live Database Analyzer State
  const [analyzing, setAnalyzing] = useState(false);
  const [deepAnalyzing, setDeepAnalyzing] = useState(false);
  const [analyzerModal, setAnalyzerModal] = useState({
    open: false,
    loading: false,
    targetPromptId: null,
    targetForm: false,
    targetSection: null,
    data: null,
  });

  const runAnalysis = async ({ category, question, keywords, promptId, mode = 'standard' }) => {
    if (mode === 'deep') setDeepAnalyzing(true);
    else setAnalyzing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/ai-chat/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'x-khudii-surface': 'admin',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, question, keywords, promptId, mode }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || `Analysis failed (${res.status})`);
      }
      return json.data;
    } catch (e) {
      alertNotice({ title: 'Analysis Error', text: e.message || 'Could not fetch database records', status: 'error' });
      return null;
    } finally {
      setAnalyzing(false);
      setDeepAnalyzing(false);
    }
  };

  const handleAnalyzeSection = async (category) => {
    const cat = category === 'All' ? 'Organizations' : category;
    const result = await runAnalysis({ category: cat });
    if (!result) return;
    setAnalyzerModal({
      open: true,
      loading: false,
      targetPromptId: null,
      targetForm: false,
      targetSection: cat,
      data: result,
    });
  };

  const handleAnalyzePrompt = async (item) => {
    const result = await runAnalysis({
      category: item.category || 'General',
      question: item.question || '',
      keywords: item.keywords || '',
      promptId: item.id,
    });
    if (!result) return;
    setAnalyzerModal({
      open: true,
      loading: false,
      targetPromptId: item.id,
      targetForm: false,
      targetSection: item.category,
      data: result,
    });
  };

  const handleAnalyzeFormTarget = async (field) => {
    const isDeep = field === 'deep-answer';
    const result = await runAnalysis({
      category: promptForm.category || (activeCategory !== 'All' ? activeCategory : 'General'),
      question: promptForm.question || '',
      keywords: promptForm.keywords || '',
      mode: isDeep ? 'deep' : 'standard',
    });
    if (!result) return;

    if (field === 'question') {
      setPromptForm((p) => ({ ...p, question: result.generatedQuestion }));
      alertNotice({ title: 'Question Generated', text: 'Updated trigger question from live database analysis', status: 'success' });
    } else if (field === 'keywords') {
      setPromptForm((p) => ({ ...p, keywords: result.generatedKeywords }));
      alertNotice({ title: 'Keywords Generated', text: 'Suggested matching keywords from live database', status: 'success' });
    } else if (field === 'answer') {
      setPromptForm((p) => ({ ...p, answer: result.generatedAnswer }));
      alertNotice({ title: 'Answer Generated', text: 'Generated answer with live database records and bullet points', status: 'success' });
    } else if (field === 'deep-answer') {
      setPromptForm((p) => ({ ...p, answer: result.generatedAnswer }));
      alertNotice({
        title: 'Deep Analysis Complete',
        text: `Extracted content from frontend (${result.frontendExtracted || 'Frontend Page'}) on the basis of question`,
        status: 'success',
      });
    } else {
      setAnalyzerModal({
        open: true,
        loading: false,
        targetPromptId: null,
        targetForm: true,
        targetSection: promptForm.category,
        data: result,
      });
    }
  };

  const handleDeepAnalysisOnAnswer = async () => {
    if (!analyzerModal.data) return;
    const targetQ = analyzerModal.data.generatedQuestion || promptForm.question || '';
    const result = await runAnalysis({
      category: analyzerModal.data.category || 'General',
      question: targetQ,
      keywords: analyzerModal.data.generatedKeywords || '',
      mode: 'deep',
    });
    if (result) {
      setAnalyzerModal((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          generatedAnswer: result.generatedAnswer,
          frontendExtracted: result.frontendExtracted,
          isDeepAnalysis: true,
          collectedData: result.collectedData || prev.data.collectedData,
        },
      }));
      alertNotice({
        title: 'Deep Analysis Complete',
        text: `Extracted content from frontend (${result.frontendExtracted || 'Frontend Page'}) on the basis of question`,
        status: 'success',
      });
    }
  };

  const applyModalQuestionOnly = () => {
    if (!analyzerModal.data?.generatedQuestion) return;
    if (analyzerModal.targetForm) {
      setPromptForm((p) => ({ ...p, question: analyzerModal.data.generatedQuestion }));
    } else if (analyzerModal.targetPromptId) {
      const currentList = Array.isArray(aiChatData?.quickPrompts) ? [...aiChatData.quickPrompts] : [];
      const idx = currentList.findIndex((p) => p.id === analyzerModal.targetPromptId);
      if (idx >= 0) {
        currentList[idx] = { ...currentList[idx], question: analyzerModal.data.generatedQuestion };
        updateField('quickPrompts', currentList);
      }
    } else {
      setPromptForm({
        id: `prompt_${Date.now()}`,
        question: analyzerModal.data.generatedQuestion,
        answer: '',
        category: analyzerModal.data.category || 'General',
        keywords: '',
      });
      setEditingPromptId(null);
      setIsAddingPrompt(true);
    }
    alertNotice({ title: 'Applied Question', text: 'Generated question applied successfully', status: 'success' });
  };

  const applyModalKeywordsOnly = () => {
    if (!analyzerModal.data?.generatedKeywords) return;
    if (analyzerModal.targetForm) {
      setPromptForm((p) => ({ ...p, keywords: analyzerModal.data.generatedKeywords }));
    } else if (analyzerModal.targetPromptId) {
      const currentList = Array.isArray(aiChatData?.quickPrompts) ? [...aiChatData.quickPrompts] : [];
      const idx = currentList.findIndex((p) => p.id === analyzerModal.targetPromptId);
      if (idx >= 0) {
        currentList[idx] = { ...currentList[idx], keywords: analyzerModal.data.generatedKeywords };
        updateField('quickPrompts', currentList);
      }
    } else {
      setPromptForm((p) => ({ ...p, keywords: analyzerModal.data.generatedKeywords }));
    }
    alertNotice({ title: 'Applied Keywords', text: 'Generated keywords applied successfully', status: 'success' });
  };

  const applyModalAnswerOnly = () => {
    if (!analyzerModal.data?.generatedAnswer) return;
    if (analyzerModal.targetForm) {
      setPromptForm((p) => ({ ...p, answer: analyzerModal.data.generatedAnswer }));
    } else if (analyzerModal.targetPromptId) {
      const currentList = Array.isArray(aiChatData?.quickPrompts) ? [...aiChatData.quickPrompts] : [];
      const idx = currentList.findIndex((p) => p.id === analyzerModal.targetPromptId);
      if (idx >= 0) {
        currentList[idx] = { ...currentList[idx], answer: analyzerModal.data.generatedAnswer };
        updateField('quickPrompts', currentList);
      }
    } else {
      setPromptForm({
        id: `prompt_${Date.now()}`,
        question: '',
        answer: analyzerModal.data.generatedAnswer,
        category: analyzerModal.data.category || 'General',
        keywords: '',
      });
      setEditingPromptId(null);
      setIsAddingPrompt(true);
    }
    alertNotice({ title: 'Applied Answer', text: 'Generated answer applied with live records & bullet points', status: 'success' });
  };

  const applyModalAll = () => {
    if (!analyzerModal.data) return;
    const { generatedQuestion, generatedKeywords, generatedAnswer, category } = analyzerModal.data;

    if (analyzerModal.targetForm) {
      setPromptForm((p) => ({
        ...p,
        question: generatedQuestion || p.question,
        keywords: generatedKeywords || p.keywords,
        answer: generatedAnswer || p.answer,
        category: category || p.category,
      }));
    } else if (analyzerModal.targetPromptId) {
      const currentList = Array.isArray(aiChatData?.quickPrompts) ? [...aiChatData.quickPrompts] : [];
      const idx = currentList.findIndex((p) => p.id === analyzerModal.targetPromptId);
      if (idx >= 0) {
        currentList[idx] = {
          ...currentList[idx],
          question: generatedQuestion || currentList[idx].question,
          keywords: generatedKeywords || currentList[idx].keywords,
          answer: generatedAnswer || currentList[idx].answer,
          category: category || currentList[idx].category,
        };
        updateField('quickPrompts', currentList);
      }
    } else {
      const newPrompt = {
        id: `prompt_${Date.now()}`,
        question: generatedQuestion,
        keywords: generatedKeywords,
        answer: generatedAnswer,
        category: category || 'General',
      };
      const currentList = Array.isArray(aiChatData?.quickPrompts) ? [...aiChatData.quickPrompts] : [];
      currentList.push(newPrompt);
      updateField('quickPrompts', currentList);
    }

    setAnalyzerModal((prev) => ({ ...prev, open: false }));
    alertNotice({ title: 'Applied All Q&A', text: 'Live Question, Keywords and Answer applied to Knowledge Base', status: 'success' });
  };

  // Simulator state
  const [testInput, setTestInput] = useState('');
  const [testMessages, setTestMessages] = useState([
    {
      sender: 'bot',
      text:
        aiChatData?.welcomeMessage ||
        'Hello! Welcome to Khudii. How can I help you today?',
    },
  ]);
  const [simulating, setSimulating] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const categories = useMemo(() => {
    const list = new Set([
      'All',
      'General',
      'Organizations',
      'Podcasts',
      'Blogs',
      'FAQs',
      'Donations',
      'Volunteers',
      'Success Stories',
      'Trust',
      'Support',
    ]);
    (aiChatData?.quickPrompts || []).forEach((p) => {
      if (p.category) list.add(p.category);
    });
    return Array.from(list);
  }, [aiChatData?.quickPrompts]);

  const selectableCategories = useMemo(() => {
    const defaultList = [
      'General',
      'Organizations',
      'Podcasts',
      'Blogs',
      'FAQs',
      'Donations',
      'Volunteers',
      'Success Stories',
      'Trust',
      'Support',
    ];
    const set = new Set(defaultList);
    (aiChatData?.quickPrompts || []).forEach((p) => {
      if (p.category && p.category !== 'All') set.add(p.category);
    });
    if (promptForm.category && promptForm.category !== 'All') {
      set.add(promptForm.category);
    }
    return Array.from(set);
  }, [aiChatData?.quickPrompts, promptForm.category]);

  const filteredPrompts = useMemo(() => {
    const list = aiChatData?.quickPrompts || [];
    if (activeCategory === 'All') return list;
    return list.filter((p) => p.category === activeCategory);
  }, [aiChatData?.quickPrompts, activeCategory]);

  const updateField = (field, val) => {
    setAiChatData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleStartAddPrompt = () => {
    setIsCustomCategory(false);
    setPromptForm({
      id: `prompt_${Date.now()}`,
      question: '',
      answer: '',
      category: activeCategory !== 'All' ? activeCategory : 'General',
      keywords: '',
    });
    setEditingPromptId(null);
    setIsAddingPrompt(true);
  };

  const handleStartEditPrompt = (item) => {
    setIsCustomCategory(false);
    setPromptForm({ ...item });
    setEditingPromptId(item.id);
    setIsAddingPrompt(true);
  };

  const handleSavePromptItem = () => {
    if (!promptForm.question.trim() || !promptForm.answer.trim()) {
      alertNotice({ title: 'Validation error', text: 'Question and answer are required', status: 'error' });
      return;
    }

    const currentList = Array.isArray(aiChatData?.quickPrompts) ? [...aiChatData.quickPrompts] : [];
    if (editingPromptId) {
      const idx = currentList.findIndex((p) => p.id === editingPromptId);
      if (idx >= 0) currentList[idx] = { ...promptForm };
    } else {
      currentList.push({ ...promptForm, id: promptForm.id || `prompt_${Date.now()}` });
    }

    updateField('quickPrompts', currentList);
    setIsAddingPrompt(false);
    setEditingPromptId(null);
    alertNotice({ title: 'Saved', text: 'Knowledge base prompt updated', status: 'success' });
  };

  const handleDeletePromptItem = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Remove prompt?',
      text: 'Are you sure you want to delete this prompt from the knowledge base?',
      status: 'error',
      confirmText: 'Delete Prompt',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    const currentList = (aiChatData?.quickPrompts || []).filter((p) => p.id !== id);
    updateField('quickPrompts', currentList);
  };

  const handleAddChip = () => {
    const trimmed = newChipInput.trim();
    if (!trimmed) return;
    const current = Array.isArray(aiChatData?.quickChips) ? [...aiChatData.quickChips] : [];
    if (!current.includes(trimmed)) {
      current.push(trimmed);
      updateField('quickChips', current);
    }
    setNewChipInput('');
  };

  const handleRemoveChip = async (chip) => {
    const ok = await confirmDialog({
      title: `Remove quick chip "${chip}"?`,
      text: 'This removes the suggestion pill from the Ask Khudii chat bar.',
      status: 'error',
      confirmText: 'Remove',
      cancelText: 'Cancel',
    });
    if (!ok) return;
    const current = (aiChatData?.quickChips || []).filter((c) => c !== chip);
    updateField('quickChips', current);
  };

  const [syncingFullKb, setSyncingFullKb] = useState(false);

  const handleSyncFullSiteKnowledge = async () => {
    const ok = await confirmDialog({
      title: 'Sync Entire Frontend & Live Database into Ask Khudii?',
      text: 'This scans all Khudii pages, organizations, blogs, podcasts, videos, success stories, FAQs, certifications, testimonials, bank details, team, and images/URLs to populate deep multi-question Q&A knowledge.',
      status: 'info',
      confirmText: 'Sync Full Knowledge Base',
      cancelText: 'Cancel',
    });
    if (!ok) return;

    setSyncingFullKb(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/admin/ai-chat/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'x-khudii-surface': 'admin' },
        body: JSON.stringify({ mode: 'full_sync' }),
      });
      const json = await res.json();
      if (!res.ok || !json.success || !json.data?.prompts) {
        throw new Error(json.message || 'Full knowledge sync failed');
      }
      setAiChatData((prev) => ({
        ...prev,
        quickPrompts: json.data.prompts,
        quickChips: json.data.quickChips || prev.quickChips,
      }));
      alertNotice({
        title: 'Full-Site Knowledge Synced!',
        text: `${json.data.summary} Click "Save AI Chat Settings" to persist.`,
        status: 'success',
      });
    } catch (err) {
      alertNotice({ title: 'Sync Failed', text: err.message, status: 'error' });
    } finally {
      setSyncingFullKb(false);
    }
  };

  // Live Backend Test Simulation Execution (calls real /cms/ai-chat/query!)
  const handleSendTestMessage = async (msgToSend) => {
    const text = (msgToSend || testInput).trim();
    if (!text) return;

    const newHistory = [...testMessages, { sender: 'user', text }];
    setTestMessages(newHistory);
    setTestInput('');
    setSimulating(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app'}/cms/ai-chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: testMessages.slice(-6) }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.answer) {
        const cardLinks = Array.isArray(data.cards) && data.cards.length
          ? `\n\n[Cards: ${data.cards.map((c) => `${c.title} (${c.url})`).join(' · ')}]`
          : '';
        setTestMessages([
          ...newHistory,
          { sender: 'bot', text: `${data.answer}${cardLinks}\n\n(Source: ${data.source || 'live'})` },
        ]);
        setSimulating(false);
        return;
      }
    } catch { /* fallback below */ }

    setTestMessages([
      ...newHistory,
      {
        sender: 'bot',
        text:
          aiChatData?.fallbackMessage ||
          "I'm sorry, I don't have enough details on that topic yet. Please contact our support team at info@khudii.com.",
      },
    ]);
    setSimulating(false);
  };

  const handleResetSimulator = () => {
    setTestMessages([
      {
        sender: 'bot',
        text:
          aiChatData?.welcomeMessage ||
          'Hello! Welcome to Khudii. How can I help you today?',
      },
    ]);
    setTestInput('');
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#02236E] flex items-center gap-2 m-0">
            <span className="p-2 rounded-xl bg-[#02236E]/10 text-[#02236E] flex items-center justify-center">
              <Sparkles size={18} />
            </span>
            Ask Khudii (AI Chat Support)
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-0">
            Configure prompt-based autonomous support without requiring any external AI API keys.
            Instant responses, knowledge matcher, and intelligent database context.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSyncFullSiteKnowledge}
            disabled={syncingFullKb}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 shadow-xs disabled:opacity-50 transition cursor-pointer"
          >
            <Sparkles size={14} className={syncingFullKb ? 'animate-spin' : ''} />
            {syncingFullKb ? 'Syncing Site Data...' : 'Sync Full Frontend & DB Knowledge'}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 rounded-full bg-[#02236E] px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-900 shadow-sm disabled:opacity-50 transition cursor-pointer"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save AI Chat Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Settings & Knowledge Prompts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Core Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#02236E] m-0">General AI Chat Controls</h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-0">Enable widget on public pages and configure labels</p>
              </div>

              {/* Enable Toggle Switch */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {aiChatData?.enabled !== false ? 'Enabled' : 'Disabled'}
                </span>
                <input
                  type="checkbox"
                  checked={aiChatData?.enabled !== false}
                  onChange={(e) => updateField('enabled', e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    aiChatData?.enabled !== false ? 'bg-[#02236E]' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      aiChatData?.enabled !== false ? 'translate-x-5' : ''
                    }`}
                  />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Launcher Button Title
                </label>
                <input
                  type="text"
                  value={aiChatData?.title ?? 'Ask Khudii'}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Ask Khudii"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Launcher Subtitle / Badge
                </label>
                <input
                  type="text"
                  value={aiChatData?.subtitle ?? '24/7 Support'}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="24/7 Support"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chat Window Header Title
                </label>
                <input
                  type="text"
                  value={aiChatData?.headerTitle ?? 'AI Assistant'}
                  onChange={(e) => updateField('headerTitle', e.target.value)}
                  placeholder="AI Assistant"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chat Window Subtitle
                </label>
                <input
                  type="text"
                  value={aiChatData?.headerSubtitle ?? 'Type a message below'}
                  onChange={(e) => updateField('headerSubtitle', e.target.value)}
                  placeholder="Type a message below"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Input Field Placeholder
                </label>
                <input
                  type="text"
                  value={aiChatData?.inputPlaceholder ?? 'How can I help you today?'}
                  onChange={(e) => updateField('inputPlaceholder', e.target.value)}
                  placeholder="How can I help you today?"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Welcome Message (Greeting)
              </label>
              <textarea
                rows={2}
                value={aiChatData?.welcomeMessage ?? ''}
                onChange={(e) => updateField('welcomeMessage', e.target.value)}
                placeholder="Hello! Welcome to Khudii. How can I help you today?"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#02236E]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fallback Message (When no match found)
              </label>
              <textarea
                rows={2}
                value={aiChatData?.fallbackMessage ?? ''}
                onChange={(e) => updateField('fallbackMessage', e.target.value)}
                placeholder="I'm sorry, I don't have enough information on that topic yet..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#02236E]"
              />
            </div>
          </div>

          {/* Card 2: System Prompt & Business Knowledge Base Context */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bot size={18} className="text-[#02236E]" />
              <h3 className="text-sm font-bold text-[#02236E] m-0">
                System Prompt &amp; Brand Context
              </h3>
            </div>
            <p className="text-xs text-slate-500 m-0">
              Provide foundational facts about Khudii: welfare missions, donation policies, NGO verification, contact information, and volunteer guidelines.
            </p>
            <textarea
              rows={5}
              value={aiChatData?.systemPrompt ?? ''}
              onChange={(e) => updateField('systemPrompt', e.target.value)}
              placeholder="Khudii is Pakistan's premier digital welfare platform uniting donors, volunteers, and welfare organizations..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-[#02236E]"
            />
          </div>

          {/* Card 3: Quick Suggested Prompt Chips */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#02236E]" />
                <h3 className="text-sm font-bold text-[#02236E] m-0">
                  Quick Suggested Prompt Chips
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {(aiChatData?.quickChips || []).length} chips
              </span>
            </div>

            <p className="text-xs text-slate-500 m-0">
              These clickable question pills appear in the chat empty state, allowing visitors to start asking with one click.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {(aiChatData?.quickChips || []).map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold"
                >
                  <span>{chip}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChip(chip)}
                    className="hover:text-red-600 transition"
                    title="Remove chip"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newChipInput}
                onChange={(e) => setNewChipInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChip();
                  }
                }}
                placeholder="e.g. How to volunteer?"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#02236E]"
              />
              <button
                type="button"
                onClick={handleAddChip}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition"
              >
                + Add Chip
              </button>
            </div>
          </div>

          {/* Card 4: Knowledge Base Prompts & Answers (Prompt Matcher) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-[#02236E] m-0">
                  Knowledge Base Q&amp;A Prompts (Rule Matcher)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-0">
                  Define targeted trigger questions, keywords, and exact answers for instant offline intelligence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAnalyzeSection(activeCategory !== 'All' ? activeCategory : 'Organizations')}
                  disabled={analyzing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer shadow-xs"
                  title="Fetch and collect exact data from database & frontend for this section"
                >
                  <Sparkles size={14} className="text-emerald-600" />
                  <span>{analyzing ? 'Analyzing...' : `Analyze ${activeCategory !== 'All' ? activeCategory : 'Live DB'} Section`}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartAddPrompt}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#02236E] text-white text-xs font-bold hover:bg-sky-600 transition cursor-pointer"
                >
                  <Plus size={14} /> Add Prompt
                </button>
              </div>
            </div>

            {/* Category Filter Pills & Section Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#02236E] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {activeCategory !== 'All' && (
                <button
                  type="button"
                  onClick={() => handleAnalyzeSection(activeCategory)}
                  disabled={analyzing}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer"
                  title={`Analyze live database records for ${activeCategory}`}
                >
                  <Sparkles size={12} />
                  Analyze &quot;{activeCategory}&quot; Data
                </button>
              )}
            </div>

            {/* Inline Add / Edit Prompt Form */}
            {isAddingPrompt && (
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#02236E] uppercase tracking-wider m-0">
                    {editingPromptId ? 'Edit Knowledge Prompt' : 'New Knowledge Prompt'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPrompt(false);
                      setEditingPromptId(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                {/* Live Data Analysis Action Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                      <Sparkles size={12} />
                    </span>
                    <span className="text-[11px] font-bold text-emerald-950">
                      Live Data Analyzer: Fetch exact records from database &amp; frontend to generate Question and Answer separately.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAnalyzeFormTarget('all')}
                    disabled={analyzing}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-800 transition cursor-pointer"
                  >
                    <Sparkles size={11} />
                    {analyzing ? 'Analyzing...' : 'Run Full Live Analysis'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700">
                        Trigger Question / User Query *
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAnalyzeFormTarget('question')}
                        disabled={analyzing}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800 hover:bg-sky-200 transition cursor-pointer"
                        title="Analyze and generate question from live database and frontend"
                      >
                        <Sparkles size={11} />
                        Analyze Question
                      </button>
                    </div>
                    <input
                      type="text"
                      value={promptForm.question}
                      onChange={(e) =>
                        setPromptForm((p) => ({ ...p, question: e.target.value }))
                      }
                      placeholder="e.g. Which organizations are listed on Khudii?"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#02236E]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={isCustomCategory ? '__custom__' : (promptForm.category || 'General')}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') {
                          setIsCustomCategory(true);
                          setPromptForm((p) => ({ ...p, category: '' }));
                        } else {
                          setIsCustomCategory(false);
                          setPromptForm((p) => ({ ...p, category: val }));
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E] cursor-pointer"
                    >
                      {selectableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">+ Custom Category...</option>
                    </select>

                    {isCustomCategory && (
                      <div className="mt-2">
                        <input
                          type="text"
                          autoFocus
                          value={promptForm.category}
                          onChange={(e) => setPromptForm((p) => ({ ...p, category: e.target.value }))}
                          placeholder="Type custom category name..."
                          className="w-full px-3 py-1.5 rounded-lg border border-sky-300 bg-sky-50/50 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#02236E]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Matching Keywords (comma separated)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAnalyzeFormTarget('keywords')}
                      disabled={analyzing}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition cursor-pointer"
                      title="Generate keywords from live database"
                    >
                      <Tag size={11} />
                      Suggest Keywords
                    </button>
                  </div>
                  <input
                    type="text"
                    value={promptForm.keywords}
                    onChange={(e) =>
                      setPromptForm((p) => ({ ...p, keywords: e.target.value }))
                    }
                    placeholder="organizations, ngos, list, verified, charity, foundations, directory, partners"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-[#02236E]"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      AI Response / Answer *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAnalyzeFormTarget('deep-answer')}
                        disabled={analyzing || deepAnalyzing}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer shadow-xs"
                        title="Extract Content data from frontend on the basis of Question"
                      >
                        <Sparkles size={11} className={deepAnalyzing ? "animate-spin text-indigo-600" : "text-indigo-600"} />
                        Deep Analysis
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAnalyzeFormTarget('answer')}
                        disabled={analyzing || deepAnalyzing}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
                        title="Analyze and generate answer formatted with bullet points from live database"
                      >
                        <Sparkles size={11} />
                        Analyze Answer
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    value={promptForm.answer}
                    onChange={(e) =>
                      setPromptForm((p) => ({ ...p, answer: e.target.value }))
                    }
                    placeholder="Enter the full, helpful response for this prompt (bullet points supported)..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-[#02236E]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSavePromptItem}
                    className="px-4 py-2 rounded-lg bg-[#02236E] text-white text-xs font-bold hover:bg-blue-900 transition cursor-pointer"
                  >
                    Save Prompt Rule
                  </button>
                </div>
              </div>
            )}

            {/* Prompt List */}
            <div className="space-y-3">
              {filteredPrompts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No knowledge prompts in this category. Click &quot;Add Prompt&quot; to create one.
                </div>
              ) : (
                filteredPrompts.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300 transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#02236E]">
                            {item.question}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {item.category || 'General'}
                          </span>
                        </div>
                        {item.keywords && (
                          <div className="text-[11px] text-slate-400">
                            Keywords: <span className="font-mono text-slate-600">{item.keywords}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAnalyzePrompt(item)}
                          disabled={analyzing}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                          title="Analyze Question & Answer from Live DB"
                        >
                          <Sparkles size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartEditPrompt(item)}
                          className="p-1.5 text-[#02236E] hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Edit prompt"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePromptItem(item.id)}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete prompt"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">
                      {item.answer}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Chat Simulator Preview */}
        <div className="sticky top-6">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden flex flex-col h-[580px]">
            {/* Simulator Window Header (Matching user Image 1) */}
            <div className="px-4 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Radial circular dashed spinner icon */}
                <svg
                  className="w-6 h-6 text-[#02236E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
                </svg>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 m-0 leading-tight">
                    {aiChatData?.headerTitle || 'AI Assistant'}
                  </h4>
                  <p className="text-[11px] text-slate-400 m-0">
                    {aiChatData?.headerSubtitle || 'Type a message below'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSimulator}
                  className="text-xs font-bold text-red-500 hover:text-red-700 transition"
                  title="Reset conversation"
                >
                  End Chat
                </button>
                <button
                  type="button"
                  onClick={handleResetSimulator}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full transition"
                  title="Reset"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            {/* Chat Simulator Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {testMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <MessageSquare size={22} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Type a message to start chatting</p>
                </div>
              ) : (
                testMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.sender === 'user' ? (
                      <div className="max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs bg-[#02236E] text-white rounded-tr-xs font-medium">
                        {m.text}
                      </div>
                    ) : (
                      <div className="max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs space-y-1.5 font-normal">
                        {parseChatMessageLines(m.text).map((line, lIdx) => {
                          if (/^[•\-\*]\s*/.test(line)) {
                            return (
                              <div key={lIdx} className="flex items-start gap-1.5 pl-1 my-0.5">
                                <span className="text-[#02236E] font-bold text-xs shrink-0 select-none mt-0.5">•</span>
                                <span className="flex-1 font-semibold text-slate-800">{line.replace(/^[•\-\*]\s*/, '')}</span>
                              </div>
                            );
                          }
                          return (
                            <p key={lIdx} className="m-0 leading-relaxed text-slate-700">
                              {line}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}

              {simulating && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chips in Simulator */}
            {(aiChatData?.quickChips || []).length > 0 && (
              <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
                {(aiChatData?.quickChips || []).map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendTestMessage(chip)}
                    className="shrink-0 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 hover:bg-sky-100 text-[10px] font-bold border border-sky-200/80 transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Simulator Footer Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendTestMessage();
                  }
                }}
                placeholder={aiChatData?.inputPlaceholder || 'How can I help you today?'}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#02236E]"
              />
              <button
                type="button"
                onClick={() => handleSendTestMessage()}
                className="w-9 h-9 rounded-xl bg-[#02236E] text-white flex items-center justify-center hover:bg-sky-600 transition shadow-sm"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* Launcher Pill Preview */}
          <div className="mt-4 p-3 bg-slate-100 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Frontend Launcher Preview:</span>
            {/* Floating button matching user Image 2 */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#02236E] text-white shadow-md">
              <MessageCircleMore className="w-5 h-5 text-white shrink-0 animate-spin-slow" />
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-white">
                  {aiChatData?.title || 'Ask Khudii'}
                </div>
                <div className="text-[10px] text-sky-100 font-medium">
                  {aiChatData?.subtitle || '24/7 Support'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Analyzer Modal */}
      {analyzerModal.open && analyzerModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#02236E] m-0 flex items-center gap-2">
                    Knowledge Base Live Data Analyzer
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Live DB
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 m-0">
                    Fetched exact records from database &amp; frontend. Generate Question and Answer separately.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAnalyzerModal((prev) => ({ ...prev, open: false }))}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
                title="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Step 1: Collected Data Info Box */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">
                      Exact Database &amp; Frontend Data Collected
                    </span>
                  </div>
                  {analyzerModal.data.collectedData?.frontendRoute && (
                    <a
                      href={analyzerModal.data.collectedData.frontendRoute}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      <span>Live Route: {analyzerModal.data.collectedData.frontendRoute}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <p className="text-xs text-emerald-900 leading-relaxed m-0 font-medium">
                  {analyzerModal.data.collectedData?.summary || 'Connected to live database records.'}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-[11px] font-bold text-emerald-800 shadow-xs">
                    Table: <span className="font-mono text-emerald-900">{analyzerModal.data.collectedData?.sourceTable || 'MySQL'}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-[11px] font-bold text-emerald-800 shadow-xs">
                    Live Records: <span className="font-bold text-emerald-900">{String(analyzerModal.data.collectedData?.totalRecords ?? 0)}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-white border border-emerald-200 text-[11px] font-bold text-emerald-800 shadow-xs">
                    Category: <span className="text-[#02236E]">{analyzerModal.data.category}</span>
                  </span>
                </div>
              </div>

              {/* Step 2: Generated Question (Separately generated) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Generated Question (Query Trigger)
                  </span>
                  <button
                    type="button"
                    onClick={applyModalQuestionOnly}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold hover:bg-sky-100 transition cursor-pointer"
                  >
                    <Check size={12} />
                    Apply Question Only
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-[#02236E]">
                  {analyzerModal.data.generatedQuestion}
                </div>
              </div>

              {/* Step 3: Generated Keywords */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag size={12} className="text-slate-500" />
                    Generated Matching Keywords
                  </span>
                  <button
                    type="button"
                    onClick={applyModalKeywordsOnly}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    <Check size={12} />
                    Apply Keywords Only
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono text-slate-700 break-all">
                  {analyzerModal.data.generatedKeywords}
                </div>
              </div>

              {/* Step 4: Generated Answer (Separately generated with bullets) */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Generated Answer (Formatted with Live Bullets)
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Deep Analysis Button on Answer */}
                    <button
                      type="button"
                      onClick={handleDeepAnalysisOnAnswer}
                      disabled={deepAnalyzing}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition cursor-pointer shadow-xs"
                      title="Extract Content data from frontend on the basis of Question"
                    >
                      <Sparkles size={12} className={deepAnalyzing ? "animate-spin text-indigo-600" : "text-indigo-600"} />
                      {deepAnalyzing ? 'Deep Analyzing...' : 'Deep Analysis'}
                    </button>

                    <button
                      type="button"
                      onClick={applyModalAnswerOnly}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <Check size={12} />
                      Apply Answer Only
                    </button>
                  </div>
                </div>

                {analyzerModal.data?.frontendExtracted && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-900 bg-indigo-50/80 px-3 py-1.5 rounded-lg border border-indigo-200">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    <span>Extracted from frontend: <strong>{analyzerModal.data.frontendExtracted}</strong></span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {analyzerModal.data.generatedAnswer}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setAnalyzerModal((prev) => ({ ...prev, open: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={applyModalAll}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#02236E] text-white text-xs font-bold hover:bg-blue-900 transition shadow-sm cursor-pointer"
              >
                <CheckCircle2 size={14} />
                Apply All (Question, Keywords &amp; Answer)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
