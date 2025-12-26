import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minus } from 'lucide-react';
import { Button } from './UI';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
    id: 'welcome',
    text: "Hi there! 👋 Welcome to BattleVault. How can I help you with your console rental today?",
    sender: 'bot',
    timestamp: new Date()
};

const FAQ_RESPONSES: Record<string, string> = {
    'price': "Our flexible pricing starts from ₹3499/week for PS5 consoles. We also have monthly plans! You can check the catalog for specific rates.",
    'deposit': "We require a small refundable security deposit which is returned immediately after the rental period ends.",
    'delivery': "We offer free delivery and pickup within our service areas in Bangalore.",
    'games': "All our consoles come with PS Plus subscription access, giving you hundreds of games to play instantly!",
    'verification': "To rent, you'll need to complete a quick ID verification process. It usually takes less than 2 hours."
};

export const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate bot response
        setTimeout(() => {
            const lowerInput = userMessage.text.toLowerCase();
            let botText = "I'm not sure about that. Could you please contact support for more details?";

            // Simple keyword matching
            for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
                if (lowerInput.includes(key)) {
                    botText = response;
                    break;
                }
            }

            if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
                botText = "Hello! Ready to game? 🎮";
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botText,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-brand-500/50 transition-all z-50 animate-bounce-slow"
                aria-label="Open Chat"
            >
                <MessageCircle size={28} />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 w-96 bg-dark-card border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[500px]'}`}>
            {/* Header */}
            <div className="bg-brand-600 p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-white">
                    <MessageCircle size={20} />
                    <span className="font-bold">Support Chat</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-white/20 rounded text-white"
                    >
                        <Minus size={18} />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/20 rounded text-white"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user'
                                            ? 'bg-brand-500 text-white rounded-tr-none'
                                            : 'bg-slate-700 text-slate-200 rounded-tl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-slate-700 p-3 rounded-2xl rounded-tl-none flex gap-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-slate-700 bg-dark-card">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputText.trim()}
                                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-colors"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
