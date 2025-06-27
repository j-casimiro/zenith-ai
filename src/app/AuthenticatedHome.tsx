'use client';
import { useState } from 'react';
import Link from 'next/link';

// Placeholder chat history
const INITIAL_CHAT = [
  {
    sender: 'user',
    text: 'I need a summary of the following article: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque euismod, urna eu tincidunt consectetur, nisi nisl aliquam nunc, eget aliquam massa nisl quis neque. [Very long article text placeholder...]',
  },
  {
    sender: 'ai',
    text: `Here's the summary of your document:\n\n- **Key Points:**\n  - Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n  - Pellentesque euismod, urna eu tincidunt consectetur.\n  - Nisi nisl aliquam nunc, eget aliquam massa nisl quis neque.\n\n**Summary:**\n\nThis article discusses the importance of lorem ipsum in design and how it helps focus on layout over content.`,
  },
];

// Placeholder sidebar history
const SIDEBAR_HISTORY = [
  'Summary: Lorem ipsum dolor sit amet... ',
  'Summary: Pellentesque euismod, urna eu... ',
  'Summary: Nisi nisl aliquam nunc... ',
];

export default function AuthenticatedHome({
  userName = 'User',
}: {
  userName?: string;
}) {
  // State for chat messages
  const [chat, setChat] = useState(INITIAL_CHAT);
  const [input, setInput] = useState('');

  // Handler for sending a new message (summarize)
  const handleSummarize = () => {
    if (!input.trim()) return;
    setChat([
      ...chat,
      { sender: 'user', text: input },
      {
        sender: 'ai',
        text: `**AI Summary:**\n\nThis is a placeholder summary for your document.`,
      },
    ]);
    setInput('');
  };

  // Handler for clearing chat
  const handleClearChat = () => setChat([]);

  return (
    <div className="font-inter min-h-screen flex bg-gradient-to-br from-white to-gray-100">
      {/* Sidebar (Left Column) */}
      <aside className="hidden md:flex flex-col w-72 bg-white/90 border-r border-gray-200 p-4 rounded-r-3xl shadow-lg relative z-10 min-h-screen">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="16" fill="#222" />
            <path d="M16 8L22 24H10L16 8Z" fill="#fff" />
          </svg>
          <span className="font-bold text-2xl text-black tracking-tight">
            Zenith-AI
          </span>
        </div>
        {/* New Summary Button */}
        <button className="w-full bg-black text-white rounded-xl py-3 font-semibold mb-6 hover:bg-gray-900 transition">
          New Summary
        </button>
        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto mb-6">
          <h3 className="text-xs text-gray-500 font-semibold mb-2 px-2">
            History
          </h3>
          <ul className="space-y-2">
            {SIDEBAR_HISTORY.map((item, idx) => (
              <li key={idx}>
                <a
                  href="#"
                  className="block px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm truncate"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 px-2 py-3 border-t border-gray-200">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl">
            {/* Placeholder user icon */}
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" fill="#bbb" />
              <path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" fill="#bbb" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="font-medium text-black text-sm">{userName}</div>
          </div>
          <Link
            href="/logout"
            className="text-xs text-gray-500 hover:underline"
          >
            Logout
          </Link>
        </div>
      </aside>
      {/* Mobile Sidebar Toggle (optional, not implemented for brevity) */}
      {/* Main Chat Area (Right Column) */}
      <main className="flex-1 flex flex-col min-h-screen max-h-screen bg-white/80 rounded-l-3xl shadow-lg overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-gray-200 bg-white/80 flex items-center">
          <h1 className="text-2xl font-bold text-black">Zenith-AI Chat</h1>
        </header>
        {/* Chat History Display */}
        <section className="flex-1 overflow-y-auto px-4 md:px-12 py-8 space-y-6">
          {chat.length === 0 && (
            <div className="text-center text-gray-400 mt-16">
              No messages yet. Paste your document to get started!
            </div>
          )}
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="flex items-start gap-2">
                  {/* AI Icon */}
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white mt-1">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="#fff" />
                      <path d="M12 7l4 10H8l4-10z" fill="#222" />
                    </svg>
                  </div>
                  <div className="max-w-xl bg-gray-100 rounded-2xl p-4 text-gray-900 prose prose-sm whitespace-pre-wrap">
                    {/* Render Markdown for AI responses */}
                    <MarkdownRenderer>{msg.text}</MarkdownRenderer>
                  </div>
                </div>
              )}
              {msg.sender === 'user' && (
                <div className="max-w-xl bg-gray-200 rounded-2xl p-4 text-gray-800 ml-auto whitespace-pre-wrap">
                  {msg.text}
                </div>
              )}
            </div>
          ))}
        </section>
        {/* Input Area */}
        <form
          className="px-4 md:px-12 py-6 border-t border-gray-200 bg-white/90 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSummarize();
          }}
        >
          <textarea
            className="w-full rounded-xl border border-gray-300 p-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-black bg-gray-50 font-inter"
            rows={4}
            placeholder="Paste your document here for summarization..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="bg-black text-white rounded-xl px-8 py-3 font-semibold hover:bg-gray-900 transition text-base"
            >
              Summarize
            </button>
            <button
              type="button"
              className="ml-auto text-gray-500 hover:underline text-sm"
              onClick={handleClearChat}
            >
              Clear Chat
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// --- Markdown Renderer ---
// For demonstration, a very basic Markdown renderer using dangerouslySetInnerHTML.
// In production, use a library like 'react-markdown' for security and full Markdown support.
function MarkdownRenderer({ children }: { children: string }) {
  // Simple Markdown to HTML (bold, bullet points, newlines)
  const html = children
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n- /g, '<ul><li>')
    .replace(/\n/g, '<br/>')
    .replace(/<ul><li>/g, '<ul><li>')
    .replace(/\n/g, '</li><li>')
    .replace(/<li><br\/>/g, '<li>')
    .replace(/<li><\/li>/g, '')
    .replace(/<ul><li>/g, '<ul><li>')
    .replace(/<li><br\/>/g, '<li>')
    .replace(/<ul><li>/g, '<ul><li>')
    .replace(/<li><br\/>/g, '<li>')
    .replace(/<ul><li>/g, '<ul><li>')
    .replace(/<li><br\/>/g, '<li>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
