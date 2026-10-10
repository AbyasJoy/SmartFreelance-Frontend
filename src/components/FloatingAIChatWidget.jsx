import { useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  User as UserIcon, 
  RefreshCw, 
  AlertTriangle, 
  AlertCircle,
  Minimize2
} from 'lucide-react';

const FloatingAIChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: `Hello ${user?.name || 'there'}! I am your SmartFreelance AI Assistant. Ask me about milestones, proposals, payment rules, or platform tools.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'SUCCESS',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState('');
  const [apiError, setApiError] = useState('');
  const [lastUserMessage, setLastUserMessage] = useState('');

  const quickSuggestions = [
    { label: 'Milestones', prompt: 'How do I break down my project into milestones?' },
    { label: 'Proposals', prompt: 'How do I draft a winning proposal for a project?' },
    { label: 'Payments', prompt: 'How does simulated payment settlement work?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, loading]);

  if (!isAuthenticated) return null;

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
            text: responseData.reply || 'AI Assistant is not configured. GEMINI_API_KEY required on server.',
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
      const errMsg = err.response?.data?.message || 'Failed to communicate with AI Assistant.';
      setApiError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'assistant',
          text: 'An error occurred while communicating with Gemini AI.',
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

  return (
    <>
      {/* Floating Chat Panel Container */}
      {isOpen && (
        <div
          className="sf-card shadow-lg overflow-hidden position-fixed border border-secondary border-opacity-25"
          style={{
            bottom: '84px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '530px',
            maxHeight: 'calc(100vh - 100px)',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
          }}
        >
          {/* Panel Header */}
          <div
            className="px-3.5 py-3 text-white d-flex align-items-center justify-content-between"
            style={{ backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '28px', height: '28px', backgroundColor: '#4f46e5' }}
              >
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <div className="fw-bold fs-7 leading-tight">SmartFreelance AI</div>
                <div className="fs-8 text-slate-400 d-flex align-items-center gap-1" style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                  <span className="d-inline-block rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span>
                  Gemini RAG Assistant
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                className="btn btn-sm btn-link text-white p-1 opacity-75 opacity-100-hover text-decoration-none"
                onClick={() => setIsOpen(false)}
                title="Minimize AI Widget"
              >
                <Minimize2 size={16} />
              </button>
              <button
                className="btn btn-sm btn-link text-white p-1 opacity-75 opacity-100-hover text-decoration-none"
                onClick={() => setIsOpen(false)}
                title="Close AI Panel"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Config / API Error Notices */}
          {configError && (
            <div className="p-2 bg-warning-subtle text-dark fs-8 border-bottom d-flex align-items-center gap-1.5">
              <AlertTriangle size={14} className="text-warning flex-shrink-0" />
              <div className="truncate">{configError}</div>
            </div>
          )}

          {apiError && (
            <div className="p-2 bg-danger-subtle text-dark fs-8 border-bottom d-flex align-items-center justify-content-between gap-1.5">
              <div className="d-flex align-items-center gap-1.5 truncate">
                <AlertCircle size={14} className="text-danger flex-shrink-0" />
                <span className="truncate">{apiError}</span>
              </div>
              <button className="btn btn-xs btn-outline-danger flex-shrink-0 py-0 px-1.5" onClick={handleRetry}>
                Retry
              </button>
            </div>
          )}

          {/* Messages Body */}
          <div
            className="p-3 bg-slate-50 overflow-auto"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.875rem', backgroundColor: '#f8fafc' }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  className={`p-2.5 ${
                    msg.sender === 'user'
                      ? 'sf-chat-bubble-user ms-4'
                      : msg.status === 'NOT_CONFIGURED'
                      ? 'bg-warning-subtle text-dark border border-warning me-4 rounded-3'
                      : msg.status === 'ERROR'
                      ? 'bg-danger-subtle text-dark border border-danger me-4 rounded-3'
                      : 'sf-chat-bubble-ai me-4'
                  }`}
                  style={{ maxWidth: '86%', fontSize: '0.8125rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1 gap-2 fs-8 opacity-75">
                    <span className="fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                      {msg.sender === 'user' ? (
                        <>
                          <UserIcon size={11} />
                          You
                        </>
                      ) : (
                        <>
                          <Bot size={11} className="text-indigo-600" style={{ color: msg.sender === 'user' ? '#fff' : '#4f46e5' }} />
                          AI
                        </>
                      )}
                    </span>
                    <span style={{ fontSize: '0.65rem' }}>{msg.timestamp}</span>
                  </div>
                  <div style={{ lineHeight: '1.5' }}>{msg.text}</div>

                  {msg.status === 'ERROR' && (
                    <div className="mt-1 text-end">
                      <button className="btn btn-xs btn-outline-danger py-0 px-1.5 fs-8" onClick={handleRetry}>
                        <RefreshCw size={10} /> Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start">
                <div className="sf-card p-2 px-3 d-flex align-items-center gap-2" style={{ borderRadius: '8px' }}>
                  <div className="spinner-border spinner-border-sm text-indigo-600" role="status" style={{ width: '14px', height: '14px', color: '#4f46e5' }}></div>
                  <span className="fs-8 text-muted">AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Pills */}
          <div className="px-3 py-1.5 bg-white border-top border-bottom d-flex align-items-center gap-1.5 overflow-auto">
            <span className="fs-8 text-muted fw-semibold flex-shrink-0" style={{ fontSize: '0.68rem' }}>Ask:</span>
            {quickSuggestions.map((item, i) => (
              <button
                key={i}
                type="button"
                className="btn btn-outline-secondary btn-sm py-0 px-2 flex-shrink-0"
                style={{ fontSize: '0.725rem', borderRadius: '12px' }}
                onClick={() => handleSend(item.prompt)}
                disabled={loading}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Input Box Footer */}
          <div className="p-2.5 bg-white border-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <div className="input-group">
                <textarea
                  ref={inputRef}
                  className="form-control"
                  rows="1"
                  placeholder="Ask AI Assistant..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  style={{ borderRadius: '6px 0 0 6px', resize: 'none', fontSize: '0.8125rem', padding: '0.375rem 0.625rem' }}
                ></textarea>
                <button
                  type="submit"
                  className="btn btn-sf-primary px-3 d-flex align-items-center justify-content-center"
                  disabled={!inputMessage.trim() || loading}
                  style={{ borderRadius: '0 6px 6px 0' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm" role="status" style={{ width: '14px', height: '14px' }}></span>
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Launcher Button in Bottom-Right Corner */}
      <button
        type="button"
        className="btn p-0 position-fixed rounded-circle shadow-lg d-flex align-items-center justify-content-center sf-ai-widget-launcher"
        style={{
          bottom: '24px',
          right: '24px',
          width: '52px',
          height: '52px',
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          zIndex: 1040,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Close AI Assistant' : 'Open SmartFreelance AI Assistant'}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <div className="position-relative d-flex align-items-center justify-content-center">
            <Sparkles size={24} />
            <span
              className="position-absolute top-0 start-100 translate-middle p-1 bg-success border border-light rounded-circle"
              style={{ width: '10px', height: '10px' }}
            >
              <span className="visually-hidden">AI Online</span>
            </span>
          </div>
        )}
      </button>
    </>
  );
};

export default FloatingAIChatWidget;
