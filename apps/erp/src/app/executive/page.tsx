'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Send,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  BarChart3,
  RefreshCw,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Clock,
  Printer,
  History,
  Plus,
  Trash2,
  Search,
  X,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

interface KpiCardItem {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  iconType?: string;
}

interface ChartDataItem {
  title: string;
  type?: 'bar' | 'line' | 'pie';
  labels: string[];
  data: number[];
}

interface ProductCardItem {
  id?: number | string;
  name: string;
  brand?: string;
  price?: string | number;
  stock?: number;
  image?: string;
  badge?: string;
  reason?: string;
}

interface AiMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  kpiCards?: KpiCardItem[];
  productCards?: ProductCardItem[];
  chartData?: ChartDataItem | null;
  recommendations?: string[];
  suggestedQuestions?: string[];
  timestamp: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: AiMessage[];
}

const QUICK_PROMPTS = [
  {
    title: 'Maliyyə və gəlir icmalı',
    desc: 'Son 30 günün ümumi dövriyyəsi və xalis mənfəət göstəriciləri',
    query: 'TechnoMania-nın son 30 günlük ümumi dövriyyəsi, xalis gəliri və ən çox qazandıran məhsulları hansılardır?',
  },
  {
    title: 'Kritik anbar qalıqları',
    desc: 'Anbarda 5 ədəddən az qalan və tələbatı yüksək modellər',
    query: 'Anbarda 5 ədəddən az qalan və təcili təchizatçıdan sifariş verilməli olan məhsulların siyahısını çıxar.',
  },
  {
    title: 'Ən yaxşı satıcılar',
    desc: 'Ən çox nağd və kredit satışı bağlayan əməkdaşlar',
    query: 'Filiallar üzrə ən çox satış edən və kredit bağlayan top əməkdaşlarımız kimlərdir?',
  },
  {
    title: 'Filial satış müqayisəsi',
    desc: 'Xırdalan və digər filialların kassa və satış nisbəti',
    query: 'Bütün filiallar üzrə kassa dövriyyəsini və satış saylarını müqayisə et.',
  },
  {
    title: 'Kredit risk təhlili',
    desc: 'Kredit ödənişlərində riskli müştərilər və portfel vəziyyəti',
    query: 'Kredit müraciətlərində təsdiq/imtina nisbəti və gecikmə riski olan müştərilərin vəziyyəti necədir?',
  },
  {
    title: 'Gələn ay üçün tələbat proqnozu',
    desc: 'Satış trendlərinə əsasən ehtiyat sifariş tövsiyələri',
    query: 'Satış trendlərinə baxaraq gələn ay üçün hansı kateqoriyalardan nə qədər sifariş verməliyik?',
  },
];

const INITIAL_GREETING: AiMessage = {
  id: 'welcome-msg',
  sender: 'ai',
  text: `Salam, Hörmətli Rəhbər!\n\nMən **Techno AI** — TechnoMania Şirkətlər Qrupunun Rəhbər Analitika və Strateji İdarəetmə Müşaviriyəm.\n\nSistemdəki bütün satışlar, kassa dövriyyələri, anbar qalıqları, kredit müraciətləri və müştəri statistikaları canlı nəzarətimdədir. İstədiyiniz maliyyə və idarəetmə sualını sərbəst şəkildə verə bilərsiniz.`,
  kpiCards: [
    { title: 'Sistem Statusu', value: 'Aktiv', change: 'Canlı Əlaqə', isPositive: true, iconType: 'chart' },
    { title: 'Məlumat İnteqrasiyası', value: 'Bütün Filiallar', change: 'Tam Sinxron', isPositive: true, iconType: 'users' },
  ],
  recommendations: [
    'Aşağıdakı hazır analitik kartlardan birinə klikləyərək dərhal icmal ala bilərsiniz.',
    'Və ya istənilən filial, məhsul və ya maliyyə sualınızı aşağıdakı sahəyə yazın.',
  ],
  suggestedQuestions: [
    'Son 30 günün ən çox satılan 5 məhsulu hansıdır?',
    'Kritik qalıqda olan məhsulların hesabatı',
    'Filiallar üzrə dövriyyə müqayisəsi',
  ],
  timestamp: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
};

function formatDotDate(date = new Date()) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

function formatDotDateTime(date = new Date()) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const hr = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${d}.${m}.${y}, ${hr}:${min}`;
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
          const headingText = trimmed.replace(/^#+\s*/, '');
          return (
            <h3 key={idx} className="text-sm font-semibold text-slate-900 pt-2 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <span>{headingText}</span>
            </h3>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const bulletText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 py-0.5 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
              <div className="flex-1 text-slate-700">{renderInlineFormatting(bulletText)}</div>
            </div>
          );
        }

        if (/^\d+\.\s/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-2 py-0.5 pl-1">
                <span className="w-4 h-4 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200">
                  {numMatch[1]}
                </span>
                <div className="flex-1 text-slate-700">{renderInlineFormatting(numMatch[2])}</div>
              </div>
            );
          }
        }

        return (
          <p key={idx} className="text-slate-700 leading-relaxed">
            {renderInlineFormatting(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function ExecutiveCommandCenterPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => `sess_${Date.now()}`);
  const [messages, setMessages] = useState<AiMessage[]>([INITIAL_GREETING]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [siteLogo, setSiteLogo] = useState<string | null>(null);

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dailyBriefing, setDailyBriefing] = useState<{
    greeting: string;
    summary: string;
    priorities?: string[];
    metrics?: any;
  } | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('technomania_site_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.logoUrl || parsed.erpLogoUrl) {
            setSiteLogo(parsed.logoUrl || parsed.erpLogoUrl);
          }
        }
      } catch (e) {}

      try {
        const savedSessions = localStorage.getItem('techno_ai_chat_sessions');
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions));
        }
      } catch (e) {}
    }

    fetch('/api/catalog/settings')
      .then(r => r.json())
      .then(d => {
        if (d?.logoUrl || d?.erpLogoUrl) {
          setSiteLogo(d.logoUrl || d.erpLogoUrl);
        }
      })
      .catch(() => {});

    fetchDailyBriefing();
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      const userFirstMsg = messages.find(m => m.sender === 'user');
      const title = userFirstMsg ? userFirstMsg.text.slice(0, 45) + '...' : 'Söhbət Sessiyası';

      setSessions(prev => {
        const existingIdx = prev.findIndex(s => s.id === currentSessionId);
        const updatedSession: ChatSession = {
          id: currentSessionId,
          title,
          createdAt: formatDotDateTime(),
          messages,
        };

        let nextSessions: ChatSession[];
        if (existingIdx >= 0) {
          nextSessions = [...prev];
          nextSessions[existingIdx] = updatedSession;
        } else {
          nextSessions = [updatedSession, ...prev];
        }

        try {
          localStorage.setItem('techno_ai_chat_sessions', JSON.stringify(nextSessions));
        } catch (e) {}

        return nextSessions;
      });
    }
  }, [messages, currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const fetchDailyBriefing = async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch('/api/ai/daily-briefing', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        setDailyBriefing(data);
      }
    } catch (e) {
      console.error('Failed to fetch daily briefing:', e);
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleStartNewChat = () => {
    const newId = `sess_${Date.now()}`;
    setCurrentSessionId(newId);
    setMessages([INITIAL_GREETING]);
    setIsHistoryOpen(false);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setIsHistoryOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      try {
        localStorage.setItem('techno_ai_chat_sessions', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });

    if (currentSessionId === sessionId) {
      handleStartNewChat();
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const time = new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' });
    const userMsg: AiMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: time,
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputValue('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/boss-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: AiMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.answer || 'Məlumatlar təhlil olundu.',
          kpiCards: data.kpiCards || [],
          productCards: data.productCards || [],
          chartData: data.chartData || null,
          recommendations: data.recommendations || [],
          suggestedQuestions: data.suggestedQuestions || [],
          timestamp: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error('API cavab vermədi');
      }
    } catch (err: any) {
      const errorMsg: AiMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Hörmətli Rəhbər, təhlil zamanı kiçik ləngimə oldu. Zəhmət olmasa təkrar sorğu göndərin.`,
        timestamp: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredSessions = useMemo(() => {
    if (!historySearch.trim()) return sessions;
    return sessions.filter(s => s.title.toLowerCase().includes(historySearch.toLowerCase()));
  }, [sessions, historySearch]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6 relative">
      {/* ═══ 1. Minimal Stripe Header ══════════════════════════════════════ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center flex-shrink-0 bg-transparent">
            {siteLogo ? (
              <img
                src={siteLogo}
                alt="TechnoMania"
                className="h-8 max-h-8 w-auto object-contain bg-transparent border-0 outline-none shadow-none"
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center text-slate-800">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                Techno AI
              </h1>
              <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                Rəhbər Analitika Mərkəzi
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Canlı satış, kassa və anbar göstəricilərinin rəhbər müşaviri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition active:scale-95 cursor-pointer shadow-xs"
            title="Keçmiş söhbət tarixçəsi"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Köhnə söhbətlər</span>
            {sessions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                {sessions.length}
              </span>
            )}
          </button>

          <button
            onClick={fetchDailyBriefing}
            disabled={briefingLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition active:scale-95 cursor-pointer shadow-xs"
            title="Səhər icmalını yenilə"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${briefingLoading ? 'animate-spin text-slate-600' : 'text-slate-500'}`} />
            İcmalı yenilə
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Çap / PDF
          </button>

          <button
            onClick={handleStartNewChat}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-900 transition active:scale-95 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni söhbət
          </button>
        </div>
      </div>

      {/* ═══ 2. History Sidebar / Drawer ═══════════════════════════════════ */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-5 space-y-4 border-l border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-semibold text-slate-900">Köhnə söhbətlər</h2>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={historySearch}
                onChange={e => setHistorySearch(e.target.value)}
                placeholder="Söhbətlərdə axtar..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-slate-400 transition"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-normal">
                  <MessageSquare className="w-7 h-7 mx-auto mb-2 opacity-40" />
                  Hələ ki saxlanılmış köhnə söhbət tapılmadı.
                </div>
              ) : (
                filteredSessions.map(sess => (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      sess.id === currentSessionId
                        ? 'bg-slate-50 border-slate-300 text-slate-900 shadow-2xs'
                        : 'bg-white hover:bg-slate-50/70 border-slate-200/80 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium truncate">{sess.title}</div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{sess.createdAt}</span>
                        <span>•</span>
                        <span>{sess.messages.length} mesaj</span>
                      </div>
                    </div>

                    <button
                      onClick={e => handleDeleteSession(e, sess.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Söhbəti sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleStartNewChat}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni söhbətə başla
            </button>
          </div>
        </div>
      )}

      {/* ═══ 3. Minimal Daily Executive Briefing ═══════════════════════════ */}
      {dailyBriefing && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">
                Günün rəhbər icmalı (Daily Briefing)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {formatDotDate()}
              </span>
            </div>
            {dailyBriefing.metrics && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-slate-500">
                  30 günlük gəlir: <strong className="text-slate-900 font-mono font-semibold">{Number(dailyBriefing.metrics?.sales?.total_revenue || 0).toLocaleString()} ₼</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  Kritik qalıq: <strong className="text-slate-900 font-mono font-semibold">{dailyBriefing.metrics?.products?.low_stock_count || 0} məhsul</strong>
                </span>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
            {dailyBriefing.summary}
          </p>

          {dailyBriefing.priorities && dailyBriefing.priorities.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {dailyBriefing.priorities.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 text-xs font-normal bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/80"
                >
                  <CheckCircle2 className="w-3 h-3 text-slate-500" />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ 4. Quick Action Prompts Grid ══════════════════════════════════ */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 px-1">
          <span>Rəhbərlik üçün sürətli analitik sorğular:</span>
          <span className="text-[11px] text-slate-400">Tək kliklə dərhal cavab alın</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt.query)}
              disabled={isLoading}
              className="bg-white hover:bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 rounded-xl p-3.5 text-left transition-all shadow-2xs group flex flex-col justify-between cursor-pointer"
            >
              <div>
                <div className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 flex items-center justify-between">
                  <span>{prompt.title}</span>
                  <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug font-normal">
                  {prompt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ 5. Conversation Stream ════════════════════════════════════════ */}
      <div className="space-y-4 pt-1">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 mt-1 bg-transparent border-0 shadow-none">
                {siteLogo ? (
                  <img src={siteLogo} alt="Techno AI" className="w-full h-full object-contain bg-transparent border-0 shadow-none" />
                ) : (
                  <Sparkles className="w-4 h-4 text-slate-700" />
                )}
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-br-xs ml-12'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs mr-4'
              }`}
            >
              {/* Sender Header */}
              <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100/15">
                <span className={`text-xs font-semibold ${msg.sender === 'user' ? 'text-slate-200' : 'text-slate-900'}`}>
                  {msg.sender === 'user' ? 'Müdir / Rəhbərlik' : 'Techno AI Müşaviri'}
                </span>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className={msg.sender === 'user' ? 'text-slate-300' : 'text-slate-400'}>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="hover:text-slate-700 transition cursor-pointer p-0.5"
                      title="Hesabatı kopyala"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Body */}
              {msg.sender === 'user' ? (
                <div className="text-xs sm:text-sm leading-relaxed text-white font-normal whitespace-pre-wrap">
                  {msg.text}
                </div>
              ) : (
                <MarkdownRenderer content={msg.text} />
              )}

              {/* Live KPI Metric Cards */}
              {msg.kpiCards && msg.kpiCards.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mt-3.5 pt-3 border-t border-slate-100">
                  {msg.kpiCards.map((kpi, kIdx) => (
                    <div
                      key={kIdx}
                      className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 text-left"
                    >
                      <div className="text-[10px] font-medium text-slate-500">
                        {kpi.title}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-0.5 font-mono">
                        {kpi.value}
                      </div>
                      {kpi.change && (
                        <div className={`text-[10px] font-medium mt-0.5 flex items-center gap-1 ${
                          kpi.isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {kpi.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {kpi.change}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Mini Product Cards */}
              {msg.productCards && msg.productCards.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-600" />
                      Əlaqəli məhsullar:
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">{msg.productCards.length} məhsul</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {msg.productCards.map((prod, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl p-2.5 flex gap-2.5 items-start transition-all shadow-2xs group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {prod.image ? (
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              {prod.brand && (
                                <span className="text-[10px] font-medium text-slate-400 block leading-tight">
                                  {prod.brand}
                                </span>
                              )}
                              <h4 className="text-xs font-semibold text-slate-900 truncate leading-snug">
                                {prod.name}
                              </h4>
                            </div>
                            {prod.badge && (
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 flex-shrink-0">
                                {prod.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold text-slate-900 font-mono">
                              {prod.price ? (typeof prod.price === 'number' ? `${prod.price.toLocaleString()} ₼` : prod.price) : '0 ₼'}
                            </span>
                            {typeof prod.stock === 'number' && (
                              <span className="text-[11px] text-slate-500 font-normal">
                                Qalıq: {prod.stock} ədəd
                              </span>
                            )}
                          </div>

                          {prod.reason && (
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight pt-0.5 font-normal">
                              {prod.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chart Visualizer */}
              {msg.chartData && (
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                    {msg.chartData.title}
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                    {msg.chartData.labels.map((label, lIdx) => {
                      const val = msg.chartData?.data[lIdx] || 0;
                      const maxVal = Math.max(...(msg.chartData?.data || [1]), 1);
                      const percentage = Math.round((val / maxVal) * 100);
                      return (
                        <div key={lIdx} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-700">
                            <span>{label}</span>
                            <span className="font-mono text-slate-900">{val.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-slate-800 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Strategic Action Recommendations */}
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-slate-600" />
                    Rəhbər üçün strateji tövsiyələr:
                  </div>
                  <div className="space-y-1.5">
                    {msg.recommendations.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-md bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {rIdx + 1}
                        </span>
                        <span className="leading-snug font-normal">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Follow-up Questions */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-medium text-slate-400 mr-1">Növbəti suallar:</span>
                  {msg.suggestedQuestions.map((q, qIdx) => (
                    <button
                      key={qIdx}
                      onClick={() => handleSendMessage(q)}
                      className="bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 transition active:scale-95 text-left cursor-pointer"
                    >
                      💬 {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0 shadow-2xs mt-1">
                <span className="text-[11px] font-semibold">M</span>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-transparent border-0 shadow-none animate-bounce">
              {siteLogo ? (
                <img src={siteLogo} alt="Techno AI" className="w-full h-full object-contain bg-transparent border-0 shadow-none" />
              ) : (
                <Sparkles className="w-4 h-4 text-slate-700" />
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-700">
                Techno AI göstəriciləri təhlil edir...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ═══ 6. Fixed Bottom Input Dock ════════════════════════════════════ */}
      <div className="sticky bottom-0 z-20 bg-[#f8fafc] pt-2 pb-2">
        <div className="bg-white border border-slate-300 hover:border-slate-400 focus-within:border-slate-900 rounded-2xl p-2 sm:p-2.5 shadow-sm transition-all flex items-center gap-2.5">
          <div className="flex-1 px-2.5">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rəhbər sualınızı yazın... (Məs: Son 30 günün ən çox satılan məhsulları)"
              rows={1}
              disabled={isLoading}
              className="w-full bg-transparent resize-none border-none outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 py-1.5 min-h-[38px] max-h-32 overflow-hidden leading-relaxed"
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-medium px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Sorğu göndər</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-3">
          <span>💡 <strong>Enter</strong> — göndər, <strong>Shift + Enter</strong> — yeni sətir</span>
          <span>Techno AI • Rəhbərlik Paneli</span>
        </div>
      </div>
    </div>
  );
}
