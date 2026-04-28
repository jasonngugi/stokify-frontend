import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useStore } from '../storeContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const DAILY_LIMIT = 20;

function AIAdvisor() {
  const { storeId } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (storeId) fetchContext();
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('ai_usage') || '{}');
    if (saved.date === today) {
      setQuestionsUsed(saved.count || 0);
    } else {
      localStorage.setItem('ai_usage', JSON.stringify({ date: today, count: 0 }));
    }
  }, [storeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContext = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/ai-context/${storeId}`);
      setContext(res.data.summary);
      setMessages([{
        role: 'assistant',
        content: `Hello! I'm your STOKIFY AI Business Advisor 👋\n\nI have access to your store data for the last 30 days:\n• **${res.data.summary.totalTransactions} transactions** recorded\n• **KSh ${res.data.summary.totalRevenue.toLocaleString()}** in revenue\n• **KSh ${res.data.summary.totalProfit.toLocaleString()}** in profit\n• **${res.data.summary.lowStockCount} products** running low\n\nAsk me anything about your business! For example:\n- "How is my business performing?"\n- "Which products should I reorder?"\n- "How can I increase my profit?"\n- "What are my biggest expenses?"`
      }]);
    } catch (err) {
      console.error('Error fetching context:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || questionsUsed >= DAILY_LIMIT) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const newCount = questionsUsed + 1;
    setQuestionsUsed(newCount);
    localStorage.setItem('ai_usage', JSON.stringify({ date: new Date().toDateString(), count: newCount }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are an AI Business Advisor for STOKIFY, an inventory management system. You are helping a shop owner in Kenya understand and improve their business.

Here is the shop's current data for the last 30 days:
- Total Revenue: KSh ${context?.totalRevenue?.toLocaleString()}
- Total Profit: KSh ${context?.totalProfit?.toLocaleString()}
- Total Expenses: KSh ${context?.totalExpenses?.toLocaleString()}
- Total Transactions: ${context?.totalTransactions}
- Outstanding Credit: KSh ${context?.totalCredit?.toLocaleString()}
- Total Products: ${context?.products}
- Low Stock Items: ${context?.lowStockCount} (${context?.lowStockItems?.join(', ')})
- Top Selling Products: ${context?.topProducts?.map(p => `${p.name} (${p.qty} units)`).join(', ')}

Give practical, actionable advice specific to this shop's data. Use KSh for currency. Keep responses concise and friendly. Use bullet points where helpful. Focus on what will actually help a small Kenyan shop owner grow their business.`,
          messages: [
            ...messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      const data = await response.json();
      const aiResponse = data.content[0].text;
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const formatMessage = (content) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  const suggestedQuestions = [
    "How is my business performing?",
    "Which products should I reorder?",
    "How can I increase my profit?",
    "What are my slow moving products?",
    "Am I on track to break even?"
  ];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`
        .ai-page { min-height: 100vh; background: #080810; font-family: 'DM Sans', sans-serif; display: flex; flex-direction: column; color: white; }
        .ai-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ai-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: white; margin: 0 0 4px 0; }
        .ai-subtitle { color: rgba(255,255,255,0.4); font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
        .usage-badge { background: rgba(255,255,255,0.06); padding: 4px 12px; border-radius: 20px; font-size: 12px; }
        .messages-container { flex: 1; overflow-y: auto; padding: 20px; max-height: calc(100vh - 220px); }
        .message { margin-bottom: 16px; display: flex; gap: 10px; }
        .message-user { flex-direction: row-reverse; }
        .message-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; }
        .bubble-user { background: rgba(0,245,160,0.15); border: 1px solid rgba(0,245,160,0.2); color: white; border-radius: 16px 16px 4px 16px; }
        .bubble-assistant { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.9); border-radius: 16px 16px 16px 4px; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
        .avatar-ai { background: rgba(0,245,160,0.15); border: 1px solid rgba(0,245,160,0.2); }
        .avatar-user { background: rgba(124,92,252,0.2); border: 1px solid rgba(124,92,252,0.3); }
        .typing { display: flex; gap: 4px; padding: 12px 16px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(0,245,160,0.5); animation: bounce 1.4s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } }
        .suggestions { padding: 0 20px 12px; display: flex; gap: 8px; overflow-x: auto; }
        .suggestion-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); padding: 8px 14px; border-radius: 20px; cursor: pointer; font-size: 12px; white-space: nowrap; font-family: 'DM Sans', sans-serif; transition: all 0.2s; flex-shrink: 0; }
        .suggestion-btn:hover { background: rgba(0,245,160,0.08); border-color: rgba(0,245,160,0.2); color: #00f5a0; }
        .input-area { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; gap: 10px; }
        .chat-input { flex: 1; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
        .chat-input:focus { border-color: rgba(0,245,160,0.4); }
        .send-btn { background: #00f5a0; color: #080810; border: none; padding: 12px 20px; border-radius: 12px; cursor: pointer; font-weight: 600; font-family: 'DM Sans', sans-serif; font-size: 14px; flex-shrink: 0; }
        .send-btn:disabled { background: rgba(0,245,160,0.3); cursor: not-allowed; }
        .limit-warning { text-align: center; padding: 12px; color: #ffc800; font-size: 13px; }
        @media (min-width: 600px) {
          .ai-header { padding: 20px 40px; }
          .messages-container { padding: 20px 40px; }
          .suggestions { padding: 0 40px 12px; }
          .input-area { padding: 16px 40px; }
        }
      `}</style>
      <div className="ai-page">
        <div className="ai-header">
          <div className="ai-title">🤖 AI Business Advisor</div>
          <div className="ai-subtitle">
            <span>Powered by Claude AI — personalized insights for your store</span>
            <span className="usage-badge">{questionsUsed}/{DAILY_LIMIT} questions today</span>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role === 'user' ? 'message-user' : ''}`}>
              <div className={`avatar ${msg.role === 'assistant' ? 'avatar-ai' : 'avatar-user'}`}>
                {msg.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className={`message-bubble ${msg.role === 'assistant' ? 'bubble-assistant' : 'bubble-user'}`}
                dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
            </div>
          ))}
          {loading && (
            <div className="message">
              <div className="avatar avatar-ai">🤖</div>
              <div className="message-bubble bubble-assistant">
                <div className="typing">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {questionsUsed < DAILY_LIMIT && (
          <div className="suggestions">
            {suggestedQuestions.map((q, i) => (
              <button key={i} className="suggestion-btn" onClick={() => setInput(q)}>{q}</button>
            ))}
          </div>
        )}

        {questionsUsed >= DAILY_LIMIT ? (
          <div className="limit-warning">⚠ You've reached your daily limit of {DAILY_LIMIT} questions. Come back tomorrow!</div>
        ) : (
          <form className="input-area" onSubmit={sendMessage}>
            <input className="chat-input" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything about your business..." disabled={loading} />
            <button className="send-btn" type="submit" disabled={loading || !input.trim()}>
              {loading ? '...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export default AIAdvisor;