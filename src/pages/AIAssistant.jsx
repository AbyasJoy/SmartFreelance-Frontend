import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  User as UserIcon, 
  Send, 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  AlertTriangle,
  Lightbulb,
  FileText,
  CreditCard,
  RotateCcw
} from 'lucide-react';

const AIAssistant = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am your SmartFreelance AI Assistant powered by Gemini. I can assist you with milestone breakdown, drafting competitive proposals, reviewing deliverables, and platform navigation. What can I help you with today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SUCCESS',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState('');
  const [apiError, setApiError] = useState('');
  const [lastUserMessage, setLastUserMessage] = useState('');

  const promptSuggestions = [
    {
      icon: Lightbulb,
      label: 'Break Project into Milestones',
      prompt: 'How should I break down my project into clear milestone deliverables and budgets?',
    },
    {
      icon: FileText,
      label: 'Draft Winning Proposal',
      prompt: 'How do I draft a competitive proposal and cover letter that stands out to clients?',
    },
    {
      icon: CreditCard,
      label: 'Simulated Payment Rules',
      prompt: 'How does simulated payment initiation and settlement work on SmartFreelance?',
    },
    {
      icon: RotateCcw,
      label: 'Revision & Review Best Practices',
      prompt: 'What are best practices for reviewing submitted work and requesting revisions?',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const formatConversationContext = () => {
    const recent = messages.slice(-4);
    return recent
      .map((m) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');
  };

  const handleSend = async (messageText = inputMessage) => {
    const trimmed = messageText.trim();
    if (!trimmed || loading) return;

    setConfigError('');
    setApiError('');
    setLastUserMessage(trimmed);

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const contextString = formatConversationContext();
      const res = await axiosInstance.post('/ai/chat', {
        message: trimmed,
        conversationContext: contextString,
      });

      const responseData = res.data;

      if (responseData.status === 'NOT_CONFIGURED') {
        setConfigError(responseData.reply || 'AI Assistant is not configured on the backend.');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'assistant',
            text: responseData.reply || 'AI Assistant is not configured. Please set GEMINI_API_KEY on the backend server.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'NOT_CONFIGURED',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'assistant',
            text: responseData.reply || 'No response returned.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: responseData.status || 'SUCCESS',
          },
        ]);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to communicate with AI Assistant. Please try again.';
      setApiError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: 'An error occurred while communicating with Gemini AI. Click retry to resend your prompt.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'ERROR',
        },
      ]);
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRetry = () => {
    if (lastUserMessage) {
      handleSend(lastUserMessage);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: `Conversation reset. How can I assist you with SmartFreelance today, ${user?.name}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'SUCCESS',
      },
    ]);
    setConfigError('');
    setApiError('');
  };

  return (
    <div className="container py-4">
      {/* Header Banner */}
      <div className="sf-header-card p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge-sf badge-sf-indigo d-inline-flex align-items-center gap-1.5">
                <Sparkles size={12} />
                Gemini 3.8 Flash
              </span>
              <span className="text-slate-400 fs-8" style={{ color: '#94a3b8' }}>
                RAG Platform Knowledge Engine
              </span>
            </div>
            <h2 className="fw-bold mb-0 text-white fs-3" style={{ letterSpacing: '-0.03em' }}>
              SmartFreelance AI Assistant
            </h2>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge-sf badge-sf-neutral text-uppercase fs-8">{user?.role}</span>
            <button
              className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 fs-8"
              onClick={handleClearChat}
            >
              <Trash2 size={13} />
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Configuration Alert */}
      {configError && (
        <div className="alert alert-warning alert-dismissible fade show mb-4 d-flex align-items-center gap-2" role="alert">
          <AlertTriangle size={18} className="text-warning flex-shrink-0" />
          <div className="fs-7">
            <strong>Backend Configuration Notice:</strong> {configError}
          </div>
          <button type="button" className="btn-close ms-auto" onClick={() => setConfigError('')}></button>
        </div>
      )}

      {/* API Error Alert */}
      {apiError && (
        <div className="alert alert-danger alert-dismissible fade show mb-4 d-flex justify-content-between align-items-center gap-2" role="alert">
          <div className="d-flex align-items-center gap-2 fs-7">
            <AlertCircle size={18} className="text-danger flex-shrink-0" />
            <div><strong>Communication Error:</strong> {apiError}</div>
          </div>
          <button className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 fs-8" onClick={handleRetry}>
            <RefreshCw size={13} />
            Retry
          </button>
        </div>
      )}

      {/* Chat Container Card */}
      <div className="sf-card overflow-hidden" style={{ minHeight: '620px', display: 'flex', flexDirection: 'column' }}>
        {/* Chat Messages Body */}
        <div
          className="p-4 bg-slate-50 overflow-auto"
          style={{ flex: 1, maxHeight: '550px', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#f8fafc' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div
                className={`p-3.5 ${
                  msg.sender === 'user'
                    ? 'sf-chat-bubble-user ms-5'
                    : msg.status === 'NOT_CONFIGURED'
                    ? 'bg-warning-subtle text-dark border border-warning me-5 rounded-3'
                    : msg.status === 'ERROR'
                    ? 'bg-danger-subtle text-dark border border-danger me-5 rounded-3'
                    : 'sf-chat-bubble-ai me-5'
                }`}
                style={{ maxWidth: '82%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-1.5 gap-3 fs-8 opacity-75">
                  <span className="fw-bold d-inline-flex align-items-center gap-1">
                    {msg.sender === 'user' ? (
                      <>
                        <UserIcon size={12} />
                        {user?.name || 'You'}
                      </>
                    ) : (
                      <>
                        <Bot size={13} className="text-indigo-600" style={{ color: msg.sender === 'user' ? '#fff' : '#4f46e5' }} />
                        SmartFreelance AI
                      </>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="fs-7" style={{ lineHeight: '1.6' }}>{msg.text}</div>

                {msg.status === 'ERROR' && (
                  <div className="mt-2 text-end">
                    <button className="btn btn-xs btn-outline-danger fw-bold d-inline-flex align-items-center gap-1 py-0.5 px-2 fs-8" onClick={handleRetry}>
                      <RefreshCw size={11} />
                      Retry Prompt
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Thinking State */}
          {loading && (
            <div className="d-flex justify-content-start">
              <div className="sf-card p-3 d-flex align-items-center gap-2.5">
                <div className="spinner-border spinner-border-sm text-indigo-600" role="status" style={{ color: '#4f46e5' }}></div>
                <span className="fs-7 text-muted fw-medium">Gemini AI is generating response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestion Chips */}
        <div className="px-4 py-3 bg-white border-top border-bottom">
          <div className="fs-8 text-muted fw-semibold mb-2 text-uppercase" style={{ letterSpacing: '0.04em' }}>Suggested Prompts:</div>
          <div className="d-flex flex-wrap gap-2">
            {promptSuggestions.map((s, idx) => {
              const IconComp = s.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-sf-outline btn-sm py-1 px-2.5 fs-8 d-inline-flex align-items-center gap-1.5"
                  onClick={() => handleSend(s.prompt)}
                  disabled={loading}
                >
                  <IconComp size={13} className="text-indigo-600" style={{ color: '#4f46e5' }} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message Input Footer */}
        <div className="p-3 bg-white border-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="input-group">
              <textarea
                ref={inputRef}
                className="form-control border-end-0"
                rows="2"
                placeholder="Ask AI Assistant about projects, milestones, proposals, or payment rules... (Enter to send)"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                style={{ borderRadius: '8px 0 0 8px', resize: 'none' }}
              ></textarea>
              <button
                type="submit"
                className="btn btn-sf-primary px-4 d-flex align-items-center gap-1.5"
                disabled={!inputMessage.trim() || loading}
                style={{ borderRadius: '0 8px 8px 0' }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                ) : (
                  <>
                    Send
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
            <div className="fs-8 text-muted mt-2 d-flex justify-content-between px-1">
              <span>Press <strong>Enter</strong> to send, <strong>Shift+Enter</strong> for newline.</span>
              <span>{inputMessage.length} / 2000</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
