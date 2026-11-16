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
  AlertCircle
} from 'lucide-react';
import { alertNotice, confirmDialog } from '@/lib/dialogs';

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

  const categories = useMemo(() => {
    const list = new Set(['All', 'General', 'Donations', 'Volunteers', 'Trust', 'Support']);
    (aiChatData?.quickPrompts || []).forEach((p) => {
      if (p.category) list.add(p.category);
    });
    return Array.from(list);
  }, [aiChatData?.quickPrompts]);

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
      status: 'warning',
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

  const handleRemoveChip = (chip) => {
    const current = (aiChatData?.quickChips || []).filter((c) => c !== chip);
    updateField('quickChips', current);
  };

  // Test Simulation Execution
  const handleSendTestMessage = (msgToSend) => {
    const text = (msgToSend || testInput).trim();
    if (!text) return;

    const newHistory = [...testMessages, { sender: 'user', text }];
    setTestMessages(newHistory);
    setTestInput('');
    setSimulating(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      const tokens = lower.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter((t) => t.length > 2);

      let matched = null;
      let highestScore = 0;

      for (const p of aiChatData?.quickPrompts || []) {
        let score = 0;
        const pq = (p.question || '').toLowerCase();
        const pkw = (p.keywords || '').toLowerCase();

        if (lower === pq || lower.includes(pq) || pq.includes(lower)) score += 100;
        const kws = pkw.split(/[,;\s]+/).map((k) => k.trim()).filter(Boolean);
        for (const t of tokens) {
          if (kws.includes(t)) score += 25;
          if (pq.includes(t)) score += 15;
        }

        if (score > highestScore) {
          highestScore = score;
          matched = p;
        }
      }

      let reply = '';
      if (matched && highestScore >= 20) {
        reply = matched.answer;
      } else {
        reply =
          aiChatData?.fallbackMessage ||
          "I'm sorry, I don't have enough details on that topic yet. Please contact our support team at info@khudii.com or explore our verified welfare organizations.";
      }

      setTestMessages([...newHistory, { sender: 'bot', text: reply }]);
      setSimulating(false);
    }, 400);
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
          <h2 className="text-xl font-extrabold text-[#02236E] flex items-center gap-2 m-0">
            <span className="p-2 rounded-xl bg-sky-100 text-[#00a2d3]">
              <Sparkles size={18} />
            </span>
            Ask Khudii (AI Chat Support)
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-0">
            Configure prompt-based autonomous support without requiring any external AI API keys.
            Instant responses, knowledge matcher, and intelligent database context.
          </p>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 rounded-full bg-[#02236E] px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-900 shadow-sm disabled:opacity-50 transition cursor-pointer self-start sm:self-auto"
        >
          <Save size={14} />
          {saving ? 'Saving...' : 'Save AI Chat Settings'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Columns: Settings & Knowledge Prompts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Core Configuration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-[#02236E] m-0">General AI Chat Controls</h3>
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
                    aiChatData?.enabled !== false ? 'bg-[#00a2d3]' : 'bg-slate-200'
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00a2d3]"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00a2d3]"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00a2d3]"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00a2d3]"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00a2d3]"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#00a2d3]"
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
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#00a2d3]"
              />
            </div>
          </div>

          {/* Card 2: System Prompt & Business Knowledge Base Context */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Bot size={18} className="text-[#02236E]" />
              <h3 className="text-sm font-extrabold text-[#02236E] m-0">
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
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-[#00a2d3]"
            />
          </div>

          {/* Card 3: Quick Suggested Prompt Chips */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-[#02236E]" />
                <h3 className="text-sm font-extrabold text-[#02236E] m-0">
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
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#00a2d3]"
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
                <h3 className="text-sm font-extrabold text-[#02236E] m-0">
                  Knowledge Base Q&amp;A Prompts (Rule Matcher)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-0">
                  Define targeted trigger questions, keywords, and exact answers for instant offline intelligence.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartAddPrompt}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00a2d3] text-white text-xs font-bold hover:bg-sky-600 transition cursor-pointer"
              >
                <Plus size={14} /> Add Prompt
              </button>
            </div>

            {/* Category Filter Pills */}
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

            {/* Inline Add / Edit Prompt Form */}
            {isAddingPrompt && (
              <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-[#02236E] uppercase tracking-wider m-0">
                    {editingPromptId ? 'Edit Knowledge Prompt' : 'New Knowledge Prompt'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingPrompt(false);
                      setEditingPromptId(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Trigger Question / User Query *
                    </label>
                    <input
                      type="text"
                      value={promptForm.question}
                      onChange={(e) =>
                        setPromptForm((p) => ({ ...p, question: e.target.value }))
                      }
                      placeholder="e.g. How can I donate?"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#00a2d3]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={promptForm.category}
                      onChange={(e) =>
                        setPromptForm((p) => ({ ...p, category: e.target.value }))
                      }
                      placeholder="General"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-[#00a2d3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Matching Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={promptForm.keywords}
                    onChange={(e) =>
                      setPromptForm((p) => ({ ...p, keywords: e.target.value }))
                    }
                    placeholder="donate, payment, money, contribution, bank, sadqah, zakat"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-[#00a2d3]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    AI Response / Answer *
                  </label>
                  <textarea
                    rows={3}
                    value={promptForm.answer}
                    onChange={(e) =>
                      setPromptForm((p) => ({ ...p, answer: e.target.value }))
                    }
                    placeholder="Enter the full, helpful response for this prompt..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-[#00a2d3]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSavePromptItem}
                    className="px-4 py-2 rounded-lg bg-[#02236E] text-white text-xs font-bold hover:bg-blue-900 transition"
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
                          onClick={() => handleStartEditPrompt(item)}
                          className="p-1.5 text-slate-400 hover:text-[#02236E] hover:bg-slate-100 rounded-lg transition"
                          title="Edit prompt"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePromptItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                        m.sender === 'user'
                          ? 'bg-[#00a2d3] text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs whitespace-pre-wrap'
                      }`}
                    >
                      {m.text}
                    </div>
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
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a2d3]"
              />
              <button
                type="button"
                onClick={() => handleSendTestMessage()}
                className="w-9 h-9 rounded-xl bg-[#00a2d3] text-white flex items-center justify-center hover:bg-sky-600 transition shadow-sm"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* Launcher Pill Preview */}
          <div className="mt-4 p-3 bg-slate-100 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">Frontend Launcher Preview:</span>
            {/* Floating button matching user Image 2 */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#00a2d3] text-white shadow-md">
              <svg
                className="w-5 h-5 text-white shrink-0 animate-spin-slow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
              </svg>
              <div className="text-left leading-tight">
                <div className="text-xs font-extrabold text-white">
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
    </div>
  );
}
