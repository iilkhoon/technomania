'use client';

import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, User } from './HeroIconsHub';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Salam! Mən Techno-ERP Süni İntellekt əlaltınızam. Sizə məhsul seçimi, kredit şərtləri və ya stok haqqında necə kömək edə bilərəm?',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: input.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = input.trim();
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      let replyText = 'Sualınız üçün təşəkkür edirik! Saytımızda bütün məhsullar 12 ayadək faizsiz taksitlə təqdim olunur.';
      const queryLower = currentQuery.toLowerCase();

      if (queryLower.includes('kredit') || queryLower.includes('taksit')) {
        replyText = 'Kreditlə alış-veriş üçün şəxsiyyət vəsiqəniz kifayətdir. Məhsul səhifəsindəki "Kredit Kalkulyatoru" vasitəsilə aylıq ödənişi hesablaya bilərsiniz!';
      } else if (queryLower.includes('çatdırılma') || queryLower.includes('karqo')) {
        replyText = 'Bakı şəhəri daxilində çatdırılma 24 saat ərzində tamamilə pulsuzdur!';
      } else if (queryLower.includes('zəmanət') || queryLower.includes('qaratı')) {
        replyText = 'Bütün məhsullarımıza 1 ildən 3 ilədək rəsmi istehsalçı zəmanəti verilir.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: replyText,
        },
      ]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 border border-indigo-400/30"
        >
          <Bot className="w-6 h-6 animate-bounce" />
          <span className="text-xs font-bold pr-1 hidden sm:inline">AI Məsləhətçi</span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[460px] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fade-in">
          {/* Header */}
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  AI Virtul Məsləhətçi <span className="text-[10px] text-emerald-400 font-medium">● Canlı</span>
                </h4>
                <p className="text-[10px] text-slate-400">Gemini AI əsaslı dəstək</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-[11px] pl-8">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                <span>AI cavab hazırlayır...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sualınızı yazın..."
              className="flex-1 px-3 py-2 bg-slate-800/80 border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
