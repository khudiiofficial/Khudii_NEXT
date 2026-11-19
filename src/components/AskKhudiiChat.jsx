'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  X,
  RotateCcw,
  Send,
  MessageCircleMore,
  Sparkles,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_BACKEND_PATH || '/api-app';

function renderInlineMarkdown(text, onNavigate) {
  if (!text) return null;
  const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\((?:\/[^)\s]*|https?:\/\/[^)\s]+)\)|`[^`]+`)/g;
  const parts = String(text).split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {renderInlineMarkdown(part.slice(2, -2), onNavigate)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#02236E]">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const href = linkMatch[2];
      const isExternal = /^https?:\/\//i.test(href);
      if (isExternal) {
        return (
          <a
            key={i}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-bold text-[#02236E] underline decoration-[#02236E]/40 underline-offset-2 hover:text-[#ed0026]"
          >
            {label}
            <ExternalLink size={10} />
          </a>
        );
      }
      return (
        <Link
          key={i}
          href={href}
          onClick={onNavigate}
          className="font-bold text-[#02236E] underline decoration-[#02236E]/40 underline-offset-2 hover:text-[#ed0026]"
        >
          {label}
        </Link>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function ChatMessageBubble({ message, onNavigate, onChipClick }) {
  const { text, sender, cards = [], suggestedChips = [] } = message;
  const isUser = sender === 'user';

  if (isUser) {
    return (
      <div className="max-w-[85%] rounded-2xl rounded-tr-xs px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs bg-[#02236e] text-white font-medium">
        {text}
      </div>
    );
  }

  const lines = String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="max-w-[92%] space-y-2">
      <div className="rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs bg-white text-slate-800 border border-slate-200/90 space-y-1.5">
        {lines.map((line, idx) => {
          if (/^[•\-\*]\s*/.test(line)) {
            const itemText = line.replace(/^[•\-\*]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
                <span className="text-[#ed0026] font-bold text-xs shrink-0 select-none mt-0.5">•</span>
                <span className="flex-1 text-slate-700">{renderInlineMarkdown(itemText, onNavigate)}</span>
              </div>
            );
          }
          return (
            <p key={idx} className="m-0 leading-relaxed text-slate-700">
              {renderInlineMarkdown(line, onNavigate)}
            </p>
          );
        })}
      </div>

      {/* Rich Visual Cards (Pages, Organizations, Blogs, Podcasts, Stories with Images & URLs) */}
      {Array.isArray(cards) && cards.length > 0 && (
        <div className="space-y-1.5">
          {cards.slice(0, 4).map((card, idx) => {
            const isExternal = /^https?:\/\//i.test(card.url || '');
            const inner = (
              <div className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2 shadow-2xs transition hover:border-[#02236E]/40 hover:bg-blue-50/40">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-12 w-12 shrink-0 rounded-lg border border-slate-100 bg-slate-50 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {card.badge && (
                      <span className="rounded bg-[#02236E]/10 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#02236E]">
                        {card.badge}
                      </span>
                    )}
                    {card.subtitle && (
                      <span className="truncate text-[10px] font-semibold text-slate-400">
                        {card.subtitle}
                      </span>
                    )}
                  </div>
                  <p className="m-0 mt-0.5 truncate text-xs font-bold text-slate-900 group-hover:text-[#02236E]">
                    {card.title}
                  </p>
                  {card.description && (
                    <p className="m-0 line-clamp-1 text-[10px] text-slate-500">{card.description}</p>
                  )}
                </div>
                <ArrowUpRight size={14} className="shrink-0 text-slate-400 group-hover:text-[#02236E]" />
              </div>
            );

            if (!card.url) return <div key={idx}>{inner}</div>;
            return isExternal ? (
              <a key={idx} href={card.url} target="_blank" rel="noopener noreferrer" className="block no-underline">
                {inner}
              </a>
            ) : (
              <Link key={idx} href={card.url} onClick={onNavigate} className="block no-underline">
                {inner}
              </Link>
            );
          })}
        </div>
      )}

      {/* Contextual Follow-up Chips */}
      {Array.isArray(suggestedChips) && suggestedChips.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {suggestedChips.slice(0, 4).map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChipClick(chip)}
              className="rounded-full border border-[#02236E]/20 bg-blue-50/60 px-2.5 py-1 text-[10px] font-bold text-[#02236E] transition hover:bg-[#02236E] hover:text-white cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const CATEGORIES = [
  'All',
  'Organizations',
  'Donate & Bank',
  'Blogs & Stories',
  'Podcasts & Videos',
  'About & Team',
  'Get Involved',
  'Support & FAQs',
];

const CATEGORY_QUESTIONS = {
  All: [
    'What is Khudii?',
    'Explore Verified Organizations',
    'How can I donate & bank details?',
    'Latest Khudii Podcasts',
    'Read latest Khudii Blogs',
    'How to volunteer?',
    'All Khudii Pages',
  ],
  Organizations: [
    'Which verified organizations are listed on Khudii?',
    'What welfare sectors and categories do you cover?',
    'How can I register my NGO on Khudii?',
    'Are organizations verified and certified?',
  ],
  'Donate & Bank': [
    'How can I donate and what are the official bank details?',
    'Does Khudii charge commission on donations?',
    'Can I give Zakat and Sadqah directly to NGOs?',
  ],
  'Blogs & Stories': [
    'What are the latest blogs and articles on Khudii?',
    'Where can I read real Khudii success stories?',
    'How can I contribute my own story?',
  ],
  'Podcasts & Videos': [
    'What episodes are on the Khudii Podcast?',
    'Where can I watch Khudii videos and documentaries?',
    'How can I suggest a podcast guest?',
  ],
  'About & Team': [
    'Who is the CEO and team behind Khudii?',
    'What is Khudii vision and mission?',
    'What are Golden People and Tribute?',
    'What do testimonials say about Khudii?',
  ],
  'Get Involved': [
    'How can I volunteer with Khudii?',
    'Are there job or career opportunities at Khudii?',
    'How can I register my organization?',
    'Latest community news & events',
  ],
  'Support & FAQs': [
    'How can I contact Khudii support & social media?',
    'View Khudii official certifications',
    'Frequently Asked Questions',
    'Show me all Khudii pages',
  ],
};

export default function AskKhudiiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    title: 'Ask Khudii',
    subtitle: '24/7 Support',
    headerTitle: 'Ask Khudii (AI)',
    headerSubtitle: 'Explore NGOs, Blogs, Podcasts, Donate & More',
    inputPlaceholder: 'Ask about NGOs, bank details, blogs, podcasts, jobs...',
    welcomeMessage:
      'Assalam-o-Alaikum! Welcome to **Khudii**. Ask me anything about verified NGOs, official donation bank details, blogs, podcasts, videos, success stories, volunteering, jobs, or contact information!',
    fallbackMessage:
      "I couldn't find an exact match for that yet. Reach us via [Contact Us](/contact) or email info@khudii.com.",
    quickChips: [],
    quickPrompts: [],
  });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const messagesEndRef = useRef(null);

  const displayedQueries =
    activeCategory === 'All' && Array.isArray(config.quickChips) && config.quickChips.length > 0
      ? [...new Set([...config.quickChips, ...CATEGORY_QUESTIONS.All])].slice(0, 10)
      : CATEGORY_QUESTIONS[activeCategory] || CATEGORY_QUESTIONS.All;

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
          cards: [],
          suggestedChips: displayedQueries.slice(0, 4),
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
              cards: [],
              suggestedChips: displayedQueries.slice(0, 4),
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]
        : [],
    );
    setInput('');
    setHasStarted(false);
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

    const history = messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setHasStarted(true);

    try {
      const res = await fetch(`${API}/cms/ai-chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
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
              cards: Array.isArray(data.cards) ? data.cards : [],
              suggestedChips: Array.isArray(data.suggestedChips) ? data.suggestedChips : [],
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
          setLoading(false);
          return;
        }
      }
    } catch {
      // fall through to offline prompt matcher
    }

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
            'Please contact our support team at info@khudii.com or visit [Contact Us](/contact).';

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: answer,
          cards: matched?.url ? [{ title: matched.question, url: matched.url, image: matched.image || '/Khudii.webp', badge: matched.category || 'Khudii' }] : [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setLoading(false);
    }, 350);
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpenChat}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#02236E] text-white shadow-xl hover:bg-[#ed0026] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border-none"
          aria-label="Open Ask Khudii Chat"
        >
          <MessageCircleMore className="w-5 h-5 text-white shrink-0" />
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

      {isOpen && (
        <div
          role="dialog"
          aria-label="Ask Khudii AI Assistant"
          className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[410px] h-[560px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-[#02236E] to-[#0b3a9c] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white m-0 leading-tight">
                  {config.headerTitle || 'Ask Khudii (AI)'}
                </h3>
                <p className="text-[11px] text-blue-100 m-0">
                  {config.headerSubtitle || 'Live Khudii Knowledge Assistant'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetChat}
                className="cursor-pointer p-1.5 text-blue-100 hover:text-white hover:bg-white/15 rounded-full transition"
                title="Restart chat"
                aria-label="Restart chat"
              >
                <RotateCcw size={14} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer p-1.5 text-white bg-[#ed0026] hover:bg-red-700 rounded-full transition"
                title="Close chat"
                aria-label="Close chat"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <ChatMessageBubble
                  message={m}
                  onNavigate={() => setIsOpen(false)}
                  onChipClick={(chip) => handleSendMessage(chip)}
                />
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-xs flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#02236E] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#02236E] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#02236E] animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Category Tabs */}
          <div className="px-3 py-2 bg-white border-t border-slate-200/80 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#02236E] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200/70 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Suggested Query Chips */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {displayedQueries.map((queryText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(queryText)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white text-[#02236e] hover:bg-[#02236E] hover:text-white text-[10px] font-bold border border-[#02236e]/20 shadow-2xs transition cursor-pointer"
              >
                {queryText}
              </button>
            ))}
          </div>

          {/* Input Bar */}
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
              placeholder={config.inputPlaceholder || 'Ask anything about Khudii...'}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#02236e]"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="cursor-pointer w-9 h-9 rounded-xl bg-[#02236e] text-white flex items-center justify-center hover:bg-[#ed0026] disabled:opacity-50 transition shadow-sm shrink-0"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
