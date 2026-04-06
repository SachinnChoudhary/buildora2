'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, ChevronDown, Sparkles, Lightbulb } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { PROJECTS_DB } from '@/lib/projects';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

interface BuildoraBotProps {
  currentProject?: {
    id: string;
    title: string;
    techStack?: string[];
  };
}

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  global: [
    'What is Buildora?',
    'How do I buy a project?',
    'Can I use these for my final year project?',
    'What do I get after purchase?',
    'How do I deploy my project?',
    'Are these projects verified?',
  ],
  neurohire: [
    'How do I set up the resume parser?',
    'What AI model does the semantic search use?',
    'How can I deploy this to production?',
  ],
  findash: [
    'How do WebSocket connections work in this project?',
    'How do I add more cryptocurrency data sources?',
    'What libraries are used for charting?',
  ],
  medchain: [
    'What is the smart contract architecture?',
    'How do I deploy to Ethereum testnet?',
    'How is encryption handled in IPFS storage?',
  ],
  docuchat: [
    'How does RAG work in this project?',
    'How do I set up Pinecone?',
    'How can I add multiple PDF uploads?',
  ],
  shopsync: [
    'How do microservices communicate?',
    'What message queue system is used?',
    'How do I scale this to production?',
  ],
  campusconnect: [
    'How do real-time updates work with Socket.io?',
    'What is the Prisma schema for study groups?',
    'How do I add a notification system?',
  ],
  greenfleet: [
    'How is MQTT used for data simulation?',
    'How can I add more sensors?',
    'What Mapbox features are used for geofencing?',
  ],
  sentinelai: [
    'How is the ML model trained?',
    'What is the role of Elasticsearch?',
    'How do I update the dataset for retraining?',
  ],
};

export default function BuildoraBot({ currentProject: propCurrentProject }: BuildoraBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(SUGGESTED_QUESTIONS.global);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [currentProject, setCurrentProject] = useState(propCurrentProject);

  // Detect project from URL if on a project page
  useEffect(() => {
    // If project is passed as prop, use that
    if (propCurrentProject) {
      setCurrentProject(propCurrentProject);
      setSuggestedQuestions(SUGGESTED_QUESTIONS[propCurrentProject.id] || SUGGESTED_QUESTIONS.global);
      return;
    }

    // Try to extract project ID from URL (e.g., /projects/neurohire)
    const matches = pathname.match(/\/projects\/([a-z0-9-]+)/);
    if (matches && matches[1]) {
      const projectId = matches[1];
      const project = PROJECTS_DB.find(p => p.id === projectId);
      if (project) {
        setCurrentProject({
          id: project.id,
          title: project.title,
          techStack: project.techStack,
        });
        setSuggestedQuestions(SUGGESTED_QUESTIONS[projectId] || SUGGESTED_QUESTIONS.global);
      } else {
        setCurrentProject(undefined);
        setSuggestedQuestions(SUGGESTED_QUESTIONS.global);
      }
    } else {
      setCurrentProject(undefined);
      setSuggestedQuestions(SUGGESTED_QUESTIONS.global);
    }
  }, [pathname, propCurrentProject]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isMinimized]);

  const handleSend = async (messageToSend?: string) => {
    const text = messageToSend || input.trim();
    if (!text || isLoading) return;

    if (!messageToSend) setInput('');
    
    const userMessage: Message = { role: 'user', parts: [{ text }] };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          projectContext: currentProject,
        }),
      });

      const data = await response.json();
      if (data.text) {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: data.text }] }]);
      } else if (data.error) {
        setMessages((prev) => [...prev, { role: 'model', parts: [{ text: `Error: ${data.error}` }] }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'model', parts: [{ text: "I'm having trouble connecting to my knowledge base. Please check your connection." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        id="buildora-bot-fab"
        data-bot-trigger
        onClick={() => {
          setIsOpen(!isOpen);
          setIsMinimized(false);
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-brand-purple flex items-center justify-center text-white shadow-lg shadow-brand-purple/30 hover:shadow-brand-orange/40 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-purple via-brand-purple to-brand-orange opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }} exit={{ rotate: 90 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-7 h-7 relative z-10" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90 }} animate={{ rotate: 0 }} exit={{ rotate: -90 }} transition={{ duration: 0.2 }} className="group-hover:animate-bounce">
              <Bot className="w-7 h-7 relative z-10" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '72px' : '550px' 
            }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className={`fixed bottom-0 right-0 sm:bottom-24 sm:right-6 z-[9998] w-full sm:w-[400px] glassmorphism sm:border border-white/10 sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 ease-in-out`}
            style={{ 
              height: isMinimized ? '72px' : (typeof window !== 'undefined' && window.innerWidth < 640 ? '100%' : '550px'),
              zIndex: typeof window !== 'undefined' && window.innerWidth < 640 && !isMinimized ? 10000 : 9998
            }}
          >
            {/* Header */}
            <div className={`p-4 border-b border-white/10 bg-white/5 flex items-center justify-between cursor-pointer`} onClick={() => setIsMinimized(!isMinimized)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-purple/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-brand-purple" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Buildora-Bot</h3>
                  <p className="text-[10px] text-brand-orange flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Technical AI Mentor
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(!isMinimized);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400"
                >
                  {isMinimized ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content (Hidden when minimized) */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-[calc(100%-72px)] overflow-hidden"
                >
                  {/* Messages Area */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center px-6">
                        <Bot className="w-10 h-10 text-brand-purple mb-3 opacity-50" />
                        <p className="text-gray-400 text-sm mb-6">
                          {currentProject 
                            ? `I'm here to help you build "${currentProject.title}". Ask me about its architecture, deployment, or improvements!`
                            : "I'm Buildora-Bot, your AI mentor. Ready to help you build great projects. How can I assist you today?"}
                        </p>
                        
                        {/* Suggested Questions */}
                        {suggestedQuestions.length > 0 && (
                          <div className="w-full space-y-2 text-left">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                              <Lightbulb className="w-3 h-3" /> Suggested Questions
                            </p>
                            {suggestedQuestions.map((question, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestedQuestion(question)}
                                className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-brand-purple/20 border border-white/10 hover:border-brand-purple/30 transition-all text-xs text-gray-300 hover:text-white"
                              >
                                {question}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                          msg.role === 'user' 
                            ? 'bg-brand-purple/20 border border-brand-purple/30 text-white rounded-tr-none' 
                            : 'bg-white/10 border border-white/20 text-gray-200 rounded-tl-none'
                        }`}>
                          {msg.parts[0].text}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/10 border border-white/20 text-gray-200 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-bounce delay-75"></div>
                            <div className="w-1.5 h-1.5 bg-brand-purple rounded-full animate-bounce delay-150"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
 
                  {/* Input Area */}
                  <div className="p-4 border-t border-white/10">
                    <div className="relative">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask your mentor..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 pr-12 transition-all"
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-brand-purple flex items-center justify-center text-white disabled:opacity-50 hover:bg-brand-orange transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
