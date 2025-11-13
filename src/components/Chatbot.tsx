import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { getChat } from '../services/geminiService';
import { ChatMessage } from '../types';
import SparkIcon from './icons/SparkIcon';

const Chatbot = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChat(getChat());
    setMessages([
        {
            role: 'model',
            parts: [{ text: "Hello! I'm your AI nutrition assistant. Ask me anything about your food results or general health." }]
        }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: currentMessage }] };
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      let fullResponse = "";
      const modelResponse: ChatMessage = { role: 'model', parts: [{ text: '' }] };
      setMessages(prev => [...prev, modelResponse]);

      const result = await chat.sendMessageStream({ message: currentMessage });
      for await (const chunk of result) {
        fullResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].parts[0].text = fullResponse;
            return newMessages;
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
          role: 'model',
          parts: [{ text: "Sorry, I encountered an error. Please try again." }]
      };
      setMessages(prev => [...prev.slice(0, -1), errorMessage]); // Replace placeholder with error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-[75vh] flex flex-col bg-white rounded-2xl shadow-lg border border-slate-200">
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                {msg.parts.map((part, i) => <p key={i} className="whitespace-pre-wrap">{part.text}</p>)}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length-1].role === 'model' && (
             <div className="flex justify-start">
               <div className="bg-slate-200 text-slate-800 px-4 py-3 rounded-2xl">
                 <div className="flex items-center">
                   <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                   <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s] mx-1"></div>
                   <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-slate-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-400"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !currentMessage.trim()} className="bg-teal-500 text-white p-2 rounded-full hover:bg-teal-600 disabled:bg-slate-400 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
