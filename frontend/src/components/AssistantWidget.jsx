import React, { useState } from 'react';
import { MessageSquare, Send, X, Bot } from 'lucide-react';
import apiClient from '../api/client';

const AssistantWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'assistant', text: 'Hello! I am your FarmVista AI Assistant. How can I help you today?' }
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = { role: 'user', text: message };
        setChat(prev => [...prev, userMsg]);
        const currentMsg = message;
        setMessage('');
        setLoading(true);

        try {
            const res = await apiClient.post('/assistant', { message: currentMsg });
            setChat(prev => [...prev, { role: 'assistant', text: res.data.response || "I'm processing your request." }]);
        } catch (err) {
            setChat(prev => [...prev, { role: 'assistant', text: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full shadow-lg transition-all duration-300 ${isOpen ? 'bg-red-500' : 'bg-green-600'
                    } text-white font-bold hover:scale-105 active:scale-95`}
            >
                {isOpen ? <X size={24} /> : (
                    <>
                        <Bot size={24} />
                        <span>Assistant</span>
                    </>
                )}
            </button>

            {/* Chat Box */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-green-600 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-lg">
                                <Bot size={20} />
                            </div>
                            <span className="font-bold">AI Assistant</span>
                        </div>
                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                    </div>

                    <div className="flex-1 max-h-96 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {chat.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-green-600 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white">
                        <div className="relative">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm font-medium"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || loading}
                                className="absolute right-2 top-2 p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-300 transition-all font-bold"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AssistantWidget;
