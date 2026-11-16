'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  RotateCcw,
  Send,
  Sparkles
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

export default function AskKhudiiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    title: 'Ask Khudii',
    subtitle: '24/7 Support',
    headerTitle: 'AI Assistant',
    headerSubtitle: 'Type a message below',
    inputPlaceholder: 'How can I help you today?',
    welcomeMessage: 'Hello! Welcome to Khudii. How can I help you today?',
    fallbackMessage: "I'm sorry, I don't have enough information on that topic yet. Please contact our support team at info@khudii.com or explore our verified welfare organizations.",
    quickChips: ['What is Khudii?', 'How can I donate?', 'How to volunteer?', 'Verified NGOs', 'Contact Support'],
    quickPrompts: [],
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const messagesEndRef = useRef(null);

  const categories = ['All', 'Organizations', 'Blogs', 'Podcasts', 'FAQs', 'Donations'];

  const categoryQuestions = {
    All: [
      'What is Khudii?',
      'Which organizations are listed?',
      'How to register an NGO?',
      'Khudii Podcast series',
      'Topics in Khudii Blogs',
      'Does Khudii charge commission?',
      'How do I volunteer?'
    ],
    Organizations: [
      'Which organizations are listed on Khudii?',
      'How can an NGO register on Khudii?',
      'How are organizations verified?',
      'Can I search organizations by city or cause?'
    ],
    Blogs: [
      'What topics do Khudii Blogs cover?',
      'How can I publish or submit a blog?',
      'What are the latest articles on Khudii?'
    ],
    Podcasts: [
      'What is the Khudii Podcast series?',
      'Where can I watch or listen to the Podcast?',
      'Can I be a guest on the Khudii Podcast?'
    ],
    FAQs: [
      'Does Khudii charge commission on donations?',
      'How do I donate directly to welfare causes?',
      'How do I become a volunteer?',
      'How can I contact Khudii support?'
    ],
    Donations: [
      'How do I donate directly to welfare causes?',
      'Does Khudii charge commission on donations?',
      'Are donations tax deductible?'
    ]
  };

  const displayedQueries = categoryQuestions[activeCategory] || categoryQuestions.All;

  // Load public AI Chat settings
  useEffect(() => {
    let isMounted = true;
    fetch(`${API}/cms/public-ai-chat`, { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!isMounted || !json?.data) return;
        setConfig((prev) => ({
          ...prev,
          ...json.data,
        }));
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  if (config.enabled === false) {
    return null;
  }

  const handleOpenChat = () => {
    setIsOpen(true);
    if (!hasStarted && messages.length === 0 && config.welcomeMessage) {
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: config.welcomeMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setHasStarted(true);
    }
  };

  const handleResetChat = () => {
    setMessages(
      config.welcomeMessage
        ? [
            {
              id: `welcome_${Date.now()}`,
              sender: 'bot',
              text: config.welcomeMessage,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]
        : []
    );
    setInput('');
    setHasStarted(false);
  };

  const handleEndChat = () => {
    setMessages([]);
    setInput('');
    setHasStarted(false);
    setIsOpen(false);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setHasStarted(true);

    try {
      // 1. Try server-side query endpoint
      const res = await fetch(`${API}/cms/ai-chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.answer) {
          setMessages((prev) => [
            ...prev,
            {
              id: `bot_${Date.now()}`,
              sender: 'bot',
              text: data.answer,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // 2. Client-side Prompt Rule Matcher Fallback (Offline / Zero-latency)
    setTimeout(() => {
      const lower = text.toLowerCase();
      const tokens = lower.replace(/[^a-z0-9\s]/gi, ' ').split(/\s+/).filter((t) => t.length > 2);

      let matched = null;
      let highestScore = 0;

      for (const p of config.quickPrompts || []) {
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

      const answer =
        matched && highestScore >= 20
          ? matched.answer
          : config.fallbackMessage ||
            "I'm sorry, I don't have enough details on that topic yet. Please contact our support team at info@khudii.com or explore our verified welfare organizations.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setLoading(false);
    }, 450);
  };

  return (
    <>
      {/* Floating Pill Launcher Button (User Image 2: Cyan #00a2d3 with sun-like radial dashes icon) */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#00a2d3] text-white shadow-xl hover:bg-[#0092bf] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-none"
          aria-label="Open Ask Khudii Chat"
        >
          {/* Radial circular dashed spinner icon */}
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
            <div className="text-xs font-bold text-white tracking-wide">
              {config.title || 'Ask Khudii'}
            </div>
            <div className="text-[10px] text-sky-100 font-medium">
              {config.subtitle || '24/7 Support'}
            </div>
          </div>
        </button>
      )}

      {/* Chat Window Dialog (User Image 1) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {/* Radial spinner icon */}
              <svg
                className="w-5 h-5 text-[#02236E]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-slate-900 m-0 leading-tight">
                  {config.headerTitle || 'AI Assistant'}
                </h3>
                <p className="text-[11px] text-slate-400 m-0">
                  {config.headerSubtitle || 'Type a message below'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEndChat}
                className="text-xs font-bold text-red-500 hover:text-red-700 transition"
              >
                End Chat
              </button>
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full transition"
                title="Restart chat"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full transition"
                title="Close window"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-between p-2">
                <div className="flex flex-col items-center justify-center text-center my-auto space-y-2">
                  <div className="w-12 h-12 rounded-full bg-sky-50 flex items-center justify-center text-[#00a2d3]">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-800 m-0">Ask Khudii Anything</h4>
                  <p className="text-xs text-slate-500 max-w-[260px]">
                    Tap a suggested query tab below or type your question about NGOs, blogs, podcasts, or donations.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Suggested Queries ({activeCategory})
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {displayedQueries.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(q)}
                        className="text-left px-3 py-2 rounded-xl bg-slate-50 hover:bg-sky-50 hover:border-sky-300 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-sky-900 transition-colors shadow-2xs cursor-pointer"
                      >
                        • {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-[#00a2d3] text-white rounded-tr-xs font-medium'
                        : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs whitespace-pre-wrap font-normal'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Query Category Tabs Bar */}
          <div className="px-3 pt-2 pb-1 bg-slate-50 border-t border-slate-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#02236E] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Suggested Query Chips for Active Category */}
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {displayedQueries.map((queryText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(queryText)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white text-sky-800 hover:bg-sky-50 text-[10px] font-bold border border-sky-200 shadow-2xs transition cursor-pointer"
              >
                {queryText}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={config.inputPlaceholder || 'How can I help you today?'}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a2d3]"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-[#00a2d3] text-white flex items-center justify-center hover:bg-[#0092bf] transition disabled:opacity-40 shadow-sm shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
