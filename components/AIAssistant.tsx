import React, { useState, useRef, useEffect } from 'react';
import { getAiAssistantResponse } from '../services/geminiService';
import { ChatIcon } from './icons/ChatIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SendIcon } from './icons/SendIcon';
import { GenerateContentResponse } from '@google/genai';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const AIAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        // Add a placeholder for the assistant's response
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        try {
            const stream = await getAiAssistantResponse(input);
            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = fullResponse;
                    return newMessages;
                });
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error.';
             setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-full p-4 shadow-lg hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-transform transform hover:scale-110 z-30"
                aria-label="Open AI Design Assistant"
            >
                <ChatIcon className="w-8 h-8" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in-fast" aria-hidden="true" onClick={() => setIsOpen(false)}></div>
            )}

            <div 
                className={`fixed bottom-6 right-6 w-[calc(100vw-3rem)] max-w-lg h-[calc(100vh-6rem)] max-h-[700px] bg-gray-950 rounded-lg shadow-2xl flex flex-col transition-transform duration-300 ease-in-out z-50 border border-gray-700/80 ${isOpen ? 'transform translate-y-0 opacity-100' : 'transform translate-y-full opacity-0 pointer-events-none'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-assistant-title"
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 id="ai-assistant-title" className="text-lg font-semibold text-gray-200">AI Design Assistant</h2>
                    <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700" aria-label="Close chat">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500 pt-8">
                            <p>Ask me about design concepts, materials, or styles.</p>
                            <p className="text-sm">e.g., "Compare biophilic and minimalist design."</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'items-start'}`}>
                            {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-amber-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs mt-1">AI</div>}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
                                <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: msg.content.replace(/```(\w+)?\n/g, '<pre><code>').replace(/```/g, '</code></pre>').replace(/\n/g, '<br />') + (isLoading && msg.role === 'assistant' && index === messages.length -1 ? '...' : '') }} />
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-gray-700 bg-gray-950/50">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask the assistant..."
                            className="flex-1 w-full bg-gray-800 border-transparent rounded-lg py-2 px-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-amber-600 text-white rounded-full p-2 hover:bg-amber-700 disabled:bg-amber-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900" disabled={isLoading || !input.trim()}>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </footer>
            </div>
             <style>{`
                .prose-invert {
                    --tw-prose-body: theme(colors.gray[300]);
                    --tw-prose-headings: theme(colors.gray[100]);
                    --tw-prose-lead: theme(colors.gray[400]);
                    --tw-prose-links: theme(colors.amber[400]);
                    --tw-prose-bold: theme(colors.white);
                    --tw-prose-counters: theme(colors.gray[400]);
                    --tw-prose-bullets: theme(colors.gray[600]);
                    --tw-prose-hr: theme(colors.gray[700]);
                    --tw-prose-quotes: theme(colors.gray[200]);
                    --tw-prose-quote-borders: theme(colors.gray[700]);
                    --tw-prose-captions: theme(colors.gray[400]);
                    --tw-prose-code: theme(colors.amber[300]);
                    --tw-prose-pre-code: theme(colors.gray[300]);
                    --tw-prose-pre-bg: theme(colors.gray[900]);
                    --tw-prose-th-borders: theme(colors.gray[600]);
                    --tw-prose-td-borders: theme(colors.gray[700]);
                }
                .animate-fade-in-fast { animation: fadeInFast 0.3s ease-out; }
                @keyframes fadeInFast {
                from { opacity: 0; }
                to { opacity: 1; }
                }
            `}</style>
        </>
    );
};