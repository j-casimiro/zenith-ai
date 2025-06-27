'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, X, User, LogOut, Plus, MessageSquare } from 'lucide-react';
import { logout } from '../lib/api';

// Types
interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface HistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
}

// Placeholder data
const INITIAL_CHAT: ChatMessage[] = [];

export function ChatWorkspace({
  userName = 'John Doe',
}: {
  userName?: string;
}) {
  // State management
  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null
  );
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Helper to get cookie value by name
  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
    return '';
  }

  // Fetch summarization history
  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const access_token = getCookie('access_token');
      if (!access_token) {
        setHistoryItems([]);
        setIsHistoryLoading(false);
        return;
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/summaries`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        // Assume data is an array of history items
        setHistoryItems(data);
      } else {
        setHistoryItems([]);
      }
    } catch {
      setHistoryItems([]);
      // Optionally set an error state here
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handler for sending a new message (summarize)
  const handleSummarize = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: input,
      timestamp: new Date(),
    };
    setChat((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const access_token = getCookie('access_token');
      if (!access_token) {
        setChat((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: 'Authentication error: No access token found. Please log in again.',
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/summarize_document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({ text: input }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChat((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: data.summary,
            timestamp: new Date(),
          },
        ]);
        // Refresh history after successful summarization
        fetchHistory();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setChat((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: `Summarization failed: ${
              errorData.detail || response.statusText
            }`,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (error) {
      const err = error as Error;
      setChat((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'ai',
          text: `Summarization failed: ${err.message || 'Network error.'}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for starting new chat
  const handleNewSummary = () => {
    setChat([]);
    setSelectedHistoryId(null);
    setSidebarOpen(false);
  };

  // Handler for clearing current chat
  const handleClearChat = () => {
    setChat([]);
  };

  // Handler for selecting history item
  const handleSelectHistory = async (historyId: string) => {
    setSelectedHistoryId(historyId);
    setSidebarOpen(false);

    const access_token = getCookie('access_token');
    if (!access_token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL}/summaries/${historyId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setChat([
          {
            id: crypto.randomUUID(),
            sender: 'user',
            text: data.original_text,
            timestamp: new Date(data.timestamp),
          },
          {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: data.summary_text,
            timestamp: new Date(data.timestamp),
          },
        ]);
      }
    } catch {
      // Optionally handle error
    }
  };

  // Handler for logging out
  const handleLogout = async () => {
    // Helper to get cookie value by name
    function getCookie(name: string) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    }
    // Helper to remove cookie by name
    function removeCookie(name: string) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
    const token = getCookie('access_token');
    if (token) {
      try {
        await logout(token);
      } catch (e) {
        console.error('Logout failed:', e);
      }
      removeCookie('access_token');
      removeCookie('refresh_token');
    }
    window.location.href = '/auth/login';
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="font-inter h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        h-screen
        fixed md:relative z-50 md:z-10
        w-80 md:w-72
        bg-white/95 backdrop-blur-sm
        border-r border-slate-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
        shadow-xl md:shadow-lg
        rounded-r-2xl
      `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 md:hidden"
        >
          <X size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-200">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="16" fill="#000" />
            <path d="M16 8L22 24H10L16 8Z" fill="#fff" />
          </svg>
          <span className="font-bold text-2xl text-black tracking-tight">
            Zenith-AI
          </span>
        </div>

        {/* New Summary Button */}
        <div className="p-4">
          <button
            onClick={handleNewSummary}
            className="w-full bg-black text-white rounded-xl py-3 px-4 font-semibold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            New Summary
          </button>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="text-xs text-slate-500 font-semibold mb-3 px-2 uppercase tracking-wider">
            Recent Summaries
          </h3>
          <div className="space-y-2">
            {isHistoryLoading ? (
              <div className="text-slate-400 text-sm px-2 py-4">
                Loading history...
              </div>
            ) : historyItems.length === 0 ? (
              <div className="text-slate-400 text-sm px-2 py-4">
                No summaries found.
              </div>
            ) : (
              historyItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectHistory(item.id)}
                  className={`
                    w-full text-left p-3 rounded-xl transition-colors
                    ${
                      selectedHistoryId === item.id
                        ? 'bg-slate-100 border border-slate-200'
                        : 'hover:bg-slate-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare
                      size={16}
                      className="text-slate-400 mt-0.5 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-slate-900 truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.preview}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {item.timestamp instanceof Date
                          ? item.timestamp.toLocaleDateString()
                          : new Date(item.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
              <User size={20} className="text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900 text-sm truncate">
                {userName}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-screen bg-white/80 backdrop-blur-sm rounded-l-2xl shadow-lg overflow-hidden">
        {/* Header (fixed) */}
        <header className="px-4 md:px-8 py-4 border-b border-slate-200 bg-white/90 backdrop-blur-sm flex-shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                Document Summarizer
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Paste your document below to get an AI-powered summary
              </p>
            </div>
          </div>
        </header>

        {/* Chat History Display (scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-8 py-6">
          {chat.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-black/10 flex items-center justify-center mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="16" cy="16" r="16" fill="#000" />
                  <path d="M16 8L22 24H10L16 8Z" fill="#fff" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                Ready to summarize
              </h3>
              <p className="text-gray-500 mb-6">
                Paste your document in the text area below and I will create a
                comprehensive summary for you.
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {chat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.sender === 'ai' && (
                    <div className="flex items-start gap-3 max-w-3xl">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0 mt-1">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 32 32"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="16" cy="16" r="16" fill="#fff" />
                          <path d="M16 8L22 24H10L16 8Z" fill="#000" />
                        </svg>
                      </div>
                      <div className="bg-gray-50 rounded-2xl rounded-tl-md p-4 shadow-sm">
                        <MarkdownRenderer>{msg.text}</MarkdownRenderer>
                        <div className="text-xs text-gray-400 mt-2">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}
                  {msg.sender === 'user' && (
                    <div className="max-w-2xl">
                      <div className="bg-black text-white rounded-2xl rounded-tr-md p-4 shadow-sm">
                        <div className="whitespace-pre-wrap break-words">
                          {msg.text}
                        </div>
                        <div className="text-xs text-gray-300 mt-2">
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="animate-pulse"
                      >
                        <circle cx="16" cy="16" r="16" fill="#fff" />
                        <path d="M16 8L22 24H10L16 8Z" fill="#000" />
                      </svg>
                    </div>
                    <div className="bg-gray-50 rounded-2xl rounded-tl-md p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                        <span className="text-sm">Analyzing document...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input Area (fixed at bottom) */}
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-sm p-4 md:p-6 flex-shrink-0 sticky bottom-0 z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSummarize();
            }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="w-full rounded-2xl border border-gray-300 p-4 pr-24 text-base resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white shadow-sm min-h-[120px] max-h-[300px]"
                placeholder="Paste your document here for summarization..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-black text-white rounded-xl px-6 py-2 font-semibold hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="16" cy="16" r="16" fill="#fff" />
                        <path d="M16 8L22 24H10L16 8Z" fill="#000" />
                      </svg>
                      Summarize
                    </>
                  )}
                </button>
              </div>
            </div>
            {chat.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-slate-500">
                  {chat.length} message{chat.length !== 1 ? 's' : ''} in this
                  conversation
                </div>
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="text-sm text-slate-500 hover:text-slate-700 hover:underline transition-colors"
                >
                  Clear Chat
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
}

// Enhanced Markdown Renderer Component
function MarkdownRenderer({ children }: { children: string }) {
  const renderMarkdown = (text: string) => {
    return (
      text
        // Bold text
        .replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="font-semibold text-black">$1</strong>'
        )
        // Headers
        .replace(
          /^### (.*$)/gm,
          '<h3 class="text-lg font-semibold text-black mt-4 mb-2">$1</h3>'
        )
        .replace(
          /^## (.*$)/gm,
          '<h2 class="text-xl font-semibold text-black mt-4 mb-2">$1</h2>'
        )
        .replace(
          /^# (.*$)/gm,
          '<h1 class="text-2xl font-bold text-black mt-4 mb-2">$1</h1>'
        )
        // Lists
        .replace(/^\d+\.\s+(.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
        .replace(/^\-\s+(.*$)/gm, '<li class="ml-4 mb-1 list-disc">$1</li>')
        // Line breaks
        .replace(/\n\n/g, '</p><p class="mb-3">')
        .replace(/\n/g, '<br/>')
    );

    return `<div class="prose prose-gray max-w-none"><p class="mb-3">${renderMarkdown}</p></div>`;
  };

  return (
    <div
      className="text-gray-700 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(children) }}
    />
  );
}

export default ChatWorkspace;
