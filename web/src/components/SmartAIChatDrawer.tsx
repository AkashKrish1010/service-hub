import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Search, Zap, Wind, Brush, CheckCheck, User, Star } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestion?: {
    providerId: string;
    name: string;
    category: string;
    rating: number;
    hourlyRate: number;
    distance: string;
    profileImage?: string;
  };
}

interface SmartAIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onBookProvider: (provider: any) => void;
}

export const SmartAIChatDrawer: React.FC<SmartAIChatDrawerProps> = ({ isOpen, onClose, onBookProvider }) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Hello! I am your Service Hub Assistant. Ask me about finding verified providers, checking service rates, or booking your repair requests.',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: 'Plumber near me', icon: Search },
    { label: 'AC making strange noise', icon: Wind },
    { label: 'Electrician urgently', icon: Zap },
    { label: 'Deep home cleaning', icon: Brush },
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Map history for backend
      const history = messages.slice(-5).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await api.post('/ai/chat', {
        message: textToSend.trim(),
        history,
      });

      const reply = res.data.reply || "I'm ready to connect you with our top verified professionals.";
      const suggestion = res.data.suggestions && res.data.suggestions.length > 0 ? res.data.suggestions[0] : undefined;

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        suggestion,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      showToast('Could not reach assistant. Please try again.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Our verified technicians for plumbing, electrical, cleaning, and appliances are standing by. You can also explore providers directly in the services catalog.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 flex justify-end">
      <div
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-borderSubtle"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-borderSubtle flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Service Hub Smart Assistant</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-medium text-slate-500">AI Assistant • Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-canvas/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-primary text-white rounded-br-xs shadow-sm'
                    : 'bg-white text-slate-800 border border-borderSubtle rounded-bl-xs shadow-card'
                }`}
              >
                <p>{m.text}</p>

                {/* Suggested Provider Card */}
                {m.suggestion && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100 bg-slate-50 rounded-xl p-3 border border-borderSubtle">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary overflow-hidden shrink-0">
                        {m.suggestion.profileImage ? (
                          <img src={m.suggestion.profileImage} alt={m.suggestion.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 stroke-[2.2]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{m.suggestion.name}</p>
                        <p className="text-[11px] text-slate-500">{m.suggestion.category} • {m.suggestion.distance}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-primary">${m.suggestion.hourlyRate}/hr</span>
                        <div className="flex items-center gap-0.5 justify-end text-[10px] text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{m.suggestion.rating}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onBookProvider(m.suggestion);
                      }}
                      className="w-full py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Book Now with {m.suggestion.name.split(' ')[0]}</span>
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-borderSubtle px-3 py-2 rounded-2xl w-fit shadow-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              <span>Thinking & checking available pros...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-t border-borderSubtle bg-white flex gap-2 overflow-x-auto scrollbar-none">
          {quickPrompts.map((q, idx) => {
            const IconComp = q.icon;
            return (
              <button
                key={idx}
                onClick={() => handleSend(q.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50 border border-slate-200 text-slate-600 hover:text-primary text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
              >
                <IconComp className="w-3 h-3" />
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-borderSubtle bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a problem, rate, or provider..."
              className="flex-1 py-2.5 px-4 rounded-xl border border-borderSubtle bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
