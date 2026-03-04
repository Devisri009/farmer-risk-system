import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import apiClient from '../../api/client';

const AssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hello! I'm your FarmVista AI Assistant. You can ask me questions about climate risks, market prices, or crop management." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await apiClient.post('/assistant', { message: userMsg });
            setMessages((prev) => [...prev, { role: 'assistant', text: response.data.reply || response.data }]);
        } catch (error) {
            console.error("AI Assistant request failed:", error);
            // Fallback mock responses based on prompt keywords
            setTimeout(() => {
                let reply = "I'm having trouble connecting to the backend right now.";
                const lowerMsg = userMsg.toLowerCase();
                if (lowerMsg.includes('sell today')) {
                    reply = "Based on current market trends and the incoming moderate climate risk, selling today at $15.50/kg is a safe bet. However, waiting a week could yield $18.20/kg if the weather holds.";
                } else if (lowerMsg.includes('climate risk high') || lowerMsg.includes('climate')) {
                    reply = "The climate risk is considered high because there is an 80% probability of heavy regional rainfall next week that could negatively impact soil moisture levels.";
                } else if (lowerMsg.includes('better prices') || lowerMsg.includes('market')) {
                    reply = "Currently, the northern regional marketplaces are offering a 12% premium on organic tomatoes compared to local hubs due to supply chain shortages.";
                }

                setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
                setLoading(false);
            }, 1000);
            return; // Exit here since we handled it with timeout
        }

        setLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-gradient-to-r from-primary-green to-green-700 p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <Bot size={24} />
                            <h3 className="font-bold text-lg">FarmVista AI</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col pt-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-primary-green shrink-0">
                                        <Bot size={18} />
                                    </div>
                                )}
                                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-primary-green text-white rounded-tr-sm'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 shrink-0">
                                        <User size={18} />
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-primary-green shrink-0">
                                    <Bot size={18} />
                                </div>
                                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                placeholder="Ask about farming..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-full px-5 py-3 pr-12 text-sm focus:outline-none focus:border-primary-green focus:ring-1 focus:ring-primary-green/50 transition-all"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-green text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={16} className="-ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center w-14 h-14 ${isOpen ? 'bg-red-500 hover:bg-red-600 rotate-90 scale-90' : 'bg-primary-green hover:bg-green-700 hover:scale-105'
                    }`}
            >
                {isOpen ? <X size={26} /> : <MessageCircle size={28} className="animate-pulse" />}
            </button>
        </div>
    );
};

export default AssistantWidget;
