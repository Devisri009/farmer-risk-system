import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import apiClient from '../../api/client';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

const AssistantWidget = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "வணக்கம்! Hello! नमस्ते! I can understand Tanglish, Tamil, Hindi, and English. How can I help you today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [selectedLang, setSelectedLang] = useState(() => {
        const stored = localStorage.getItem("language");
        if (stored === "tanglish") {
            localStorage.setItem("language", "en");
            return "en";
        }
        return stored || "en";
    });
    const keyboard = useRef();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        } else {
            // Reset chat when closed
            setMessages([
                { role: 'assistant', text: "வணக்கம்! Hello! नमस्ते! I can understand Tanglish, Tamil, Hindi, and English. How can I help you today?" }
            ]);
            setInput('');
        }
    }, [isOpen, t]); // Only depend on isOpen and t for reset logic

    // Separate useEffect for scrolling when messages change and widget is open
    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    let recognition = null;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
    }

    const toggleListening = () => {
        if (isListening) {
            recognition?.stop();
        } else {
            const lang = localStorage.getItem("language") || "en";
            if (recognition) {
                let recLang = 'en-US';
                if (lang === 'ta') recLang = 'ta-IN';
                else if (lang === 'hi') recLang = 'hi-IN';
                
                recognition.lang = recLang;
                recognition.start();
            } else {
                alert(t('assistant.noSpeechSupport', "Your browser doesn't support speech recognition."));
            }
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const lang = localStorage.getItem("language") || "en";
            const response = await apiClient.post('/assistant', {
                message: userMsg,
                language: lang
            });
            setMessages((prev) => [...prev, { role: 'assistant', text: response.data.reply || response.data }]);
        } catch (error) {
            console.error("AI Assistant request failed:", error);
            // Check if it's a backend connection error vs a Gemini execution error 
            let errorText = "I'm having trouble connecting to the backend right now.";
            if (error.response && error.response.data && error.response.data.detail) {
                errorText = error.response.data.detail;
            }
            setMessages((prev) => [...prev, { role: 'assistant', text: errorText }]);
        }

        setLoading(false);
    };

    const getLayout = (lang) => {
        if (lang === 'ta') {
            return {
                'default': [
                    'அ ஆ இ ஈ உ ஊ எ ஏ ஐ ஒ ஓ ஔ',
                    'க ங ச ஞ ட ண த ந ப ம',
                    'ய ர ல வ ழ ள ற ன {bksp}',
                    '{abc} {space} {close}'
                ]
            };
        }
        if (lang === 'hi') {
            return {
                'default': [
                    'अ आ इ ई उ ऊ ऋ ए ऐ ओ औ',
                    'क ख ग घ ङ च छ ज झ ञ',
                    'ट ठ ड ढ ण त थ द ध न',
                    'प फ ब भ म य र ल व श',
                    'ष स ह {bksp}',
                    '{abc} {space} {close}'
                ]
            };
        }
        return {
            'default': [
                'q w e r t y u i o p',
                'a s d f g h j k l',
                'z x c v b n m {bksp}',
                '{abc} {space} {close}'
            ]
        };
    };

    const onKeyPress = (button) => {
        if (button === "{bksp}") {
            setInput(prev => prev.slice(0, -1));
        } else if (button === "{space}") {
            setInput(prev => prev + " ");
        } else if (button === "{close}") {
            setShowKeyboard(false);
        } else if (button === "{abc}") {
            // cycle through languages or something? for now just toggle English
            // but user asked for tamil, hindi, eng specifically
        } else {
            setInput(prev => prev + button);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-[350px] md:w-[400px] h-[550px] bg-[#f8f9fc] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-[#f8f9fc] p-4 flex justify-between items-center text-[#1E3A8A] border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">Agri AI Assistant</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-gray-200 p-1.5 rounded-full transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white flex flex-col pt-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm border ${msg.role === 'user'
                                    ? 'bg-[#E3EBFF] border-blue-100 text-[#1E3A8A] rounded-tr-sm'
                                    : 'bg-white border-gray-200 text-gray-800 rounded-tl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-3 justify-start">
                                <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
                        {/* Top action row */}
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <select 
                                    className="bg-[#f0f2f5] border-none rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:ring-0 cursor-pointer"
                                    value={selectedLang}
                                    onChange={(e) => {
                                        const newLang = e.target.value;
                                        localStorage.setItem("language", newLang);
                                        setSelectedLang(newLang);
                                    }}
                                >
                                    <option value="en">English</option>
                                    <option value="ta">தமிழ் (Tamil)</option>
                                    <option value="hi">हिंदी (Hindi)</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={toggleListening}
                                    className={`flex items-center gap-1.5 bg-[#f0f2f5] hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors ${isListening ? 'text-red-500 font-medium animate-pulse' : ''}`}
                                >
                                    <Mic size={14} />
                                    <span>Mic</span>
                                </button>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setShowKeyboard(!showKeyboard)}
                                className={`flex items-center gap-1.5 bg-[#f0f2f5] hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm transition-colors ${showKeyboard ? 'bg-blue-100 text-blue-600' : ''}`}
                            >
                                <span>Keyboard</span>
                            </button>
                        </div>

                        {showKeyboard && (
                            <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 animate-in fade-in zoom-in duration-200">
                                <Keyboard
                                    keyboardRef={r => (keyboard.current = r)}
                                    layoutName="default"
                                    layout={getLayout(selectedLang)}
                                    onKeyPress={onKeyPress}
                                    display={{
                                        '{bksp}': 'delete',
                                        '{space}': 'space',
                                        '{close}': 'close',
                                        '{abc}': '🌐'
                                    }}
                                />
                                <style>{`
                                    .simple-keyboard {
                                        background-color: transparent;
                                        font-family: inherit;
                                        max-width: 100%;
                                    }
                                    .hg-button {
                                        height: 35px !important;
                                        background: white !important;
                                        border-bottom: 2px solid #ddd !important;
                                        font-size: 14px !important;
                                        border-radius: 6px !important;
                                    }
                                    .hg-theme-default .hg-button:active {
                                        background: #f0f0f0 !important;
                                    }
                                `}</style>
                            </div>
                        )}

                        {/* Input row */}
                        <form onSubmit={handleSend} className="flex gap-2">
                            <input
                                type="text"
                                placeholder={isListening ? "Listening..." : "Type here..."}
                                className={`flex-1 border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all ${isListening ? 'border-red-400 ring-1 ring-red-400/50' : 'border-gray-200 focus:border-primary-green focus:ring-1 focus:ring-primary-green/50'
                                    }`}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || loading || isListening}
                                className="px-5 py-2.5 bg-[#1a933f] text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
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
