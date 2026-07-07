import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiHelperProps {}

export const AiHelper: React.FC<AiHelperProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I am your AI Civic Guide. Ask me anything about the Community Hero buttons, ledger operations, or how to earn points!'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'connected' | 'offline'>('idle');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pre-configured helper prompts
  const suggestedPrompts = [
    { text: 'What does the Ledger do?', q: 'Explain what the Tamper-Proof Ledger tab does and how the hashing works.' },
    { text: 'How do I earn Karma points?', q: 'How can citizens accumulate points to progress on the Duolingo level trail?' },
    { text: 'Explain Map buttons', q: 'What do the Upvote and Verify buttons on the Map view do?' },
    { text: 'What is the Profile Keyring?', q: 'Explain what the Export Cryptographic Keyring button in my profile does.' }
  ];

  // Smart local database fallback if Ollama is not active or blocked by CORS
  const getFallbackResponse = (userQuery: string): string => {
    const q = userQuery.toLowerCase();
    
    if (q.includes('ledger') || q.includes('block') || q.includes('tamper') || q.includes('hash')) {
      return `⚙️ (Local Fallback): The **Tamper-Proof Ledger** records all community issues onto a client-side blockchain database:
- **How it works**: Each issue filed generates a cryptographic block containing details, a timestamp, and a SHA-256 hash linked to the previous block.
- **"Tamper Block" Button**: Lets you modify a block's text to show how blockchain security detects integrity breaches (the block turns red as hashes mismatch).
- **"Restore Chain" Button**: Re-computes validation hashes across all blocks to return the database to consensus equilibrium.`;
    }
    
    if (q.includes('point') || q.includes('karma') || q.includes('level') || q.includes('duolingo') || q.includes('rank')) {
      return `⚙️ (Local Fallback): Citizens earn **Karma Points** to level up on the Duolingo-style progression trail:
- **Earn points**: +50 points for submitting a new report, +10 points for upvoting, and +20 points for casting a validation check.
- **Climbing Levels**: Clicking the Level/Points container in the top right shows your Duolingo milestones. Starting at Level 1 (0 points), you unlock titles like Neighborhood Guardian and Metropolitan Hero as your score grows.`;
    }

    if (q.includes('map') || q.includes('upvote') || q.includes('verify') || q.includes('button')) {
      return `⚙️ (Local Fallback): Here is an explanation of the Map dashboard buttons:
- **"Upvote" (Heart icon)**: Registers community interest. Higher upvotes signal increased urgency to authorities.
- **"Verify" (Shield Check)**: Lets citizens confirm that an issue physically exists. It logs a verification transaction.
- **"Map Centering"**: Clicking location access offsets issues to center around your real GPS location, marked by a pulsing blue pin.`;
    }

    if (q.includes('keyring') || q.includes('profile') || q.includes('export')) {
      return `⚙️ (Local Fallback): The **Export Cryptographic Keyring** button in your Profile download a secure JSON packet containing:
- Your credentials.
- Your unique private citizen signature.
- Your blockchain keys used to validate consensus audits securely.`;
    }

    return `⚙️ (Local Fallback): I'm here to help guide you through the Community Hero platform!
- Type **"ledger"** to understand how blockchain ledger blocks protect files.
- Type **"points"** to learn about the Duolingo level milestones.
- Type **"map"** to see what Upvote and Verify controls accomplish.`;
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    const systemContext = `You are the AI Civic Guide for the "Community Hero" platform.
    Here is how the platform works for Citizens:
    1. Civic Map: Displays reported issues (potholes, leaks, streetlights, waste). Citizens upvote (heart icon) to signal priority or click "Verify" (shield icon) to log a check confirming its existence.
    2. Report Issue: Wizard to upload photo/video, tag location, auto-classify using AI confidence, and register on the ledger.
    3. Tamper-Proof Ledger: Displays SHA-256 blocks. Click "Tamper Block" to modify text (breaks hash connection and triggers red alerts). Click "Restore Chain" to re-calculate proof hashes and repair ledger validation.
    4. Rewards (Duolingo Path): Citizens start at Level 1 (0 points). Earn points by upvoting (+10), verifying (+20), or reporting (+50). Click the Level card in the Navbar to see Duolingo-style milestones.
    5. Profile Page: Accessed by clicking your avatar in the Navbar. Contains personal stats, badges, and a keyring download button.

    Provide a short, direct explanation. Answer the citizen's question concisely based on these mechanics.`;

    try {
      // Connect to local Ollama server running on default port 11434
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // Standard default model
          messages: [
            { role: 'system', content: systemContext },
            { role: 'user', content: textToSend }
          ],
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error('Local server offline');
      }

      const data = await response.json();
      const reply = data.message?.content || data.response || 'No reply received.';
      
      setOllamaStatus('connected');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      // Fallback to local expert response if connection fails (e.g. Ollama offline or CORS)
      setOllamaStatus('offline');
      const fallbackReply = getFallbackResponse(textToSend);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${fallbackReply}\n\n*⚠️ Note: Local Ollama server is offline. To enable Ollama chat in browser, start it with CORS allowed:*\n\`OLLAMA_ORIGINS=* ollama serve\``
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="glow-on-hover"
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            border: 'none',
            color: '#FFF',
            padding: '14px',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s'
          }}
          title="Ask AI Civic Helper"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Slide up chat panel */}
      {isOpen && (
        <div className="glass-card" style={{
          width: '360px',
          height: '480px',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(10, 12, 22, 0.95)',
          backdropFilter: 'blur(16px)',
          animation: 'fade-in 0.2s'
        }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--primary)" />
              <strong style={{ fontSize: '0.9rem', color: '#FFF' }}>AI Civic Guide</strong>
              <span style={{
                fontSize: '0.65rem',
                padding: '2px 6px',
                borderRadius: '4px',
                background: ollamaStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)',
                color: ollamaStatus === 'connected' ? 'var(--emerald)' : 'var(--text-muted)',
                fontWeight: 600
              }}>
                {ollamaStatus === 'connected' ? 'Ollama Online' : 'Local Fallback'}
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Messages scroll area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.role === 'user' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: msg.role === 'user' ? '1px solid rgba(139, 92, 246, 0.25)' : '1px solid rgba(255,255,255,0.04)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  color: msg.role === 'user' ? '#FFF' : 'var(--text-secondary)',
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Thinking...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompts Panel */}
          {messages.length === 1 && (
            <div style={{ padding: '0 16px 12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested Questions:</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {suggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(p.q)}
                    style={{
                      padding: '6px 8px',
                      fontSize: '0.7rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139,92,246,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    }}
                  >
                    💡 {p.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Panel */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Ask about buttons or ledger..."
              className="form-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(query)}
              disabled={loading}
              style={{ flex: 1, fontSize: '0.8rem', padding: '8px 12px' }}
            />
            <button
              onClick={() => handleSend(query)}
              disabled={loading || !query.trim()}
              className="btn btn-primary"
              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
