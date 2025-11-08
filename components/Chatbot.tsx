
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageSender } from '../types';
import { SendIcon, ChatIcon } from './Icons';

interface ChatbotProps {
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === MessageSender.User;
    const messageClasses = isUser
        ? 'bg-cyan-600 self-end rounded-l-lg rounded-tr-lg'
        : 'bg-gray-700 self-start rounded-r-lg rounded-tl-lg';

    return (
        <div className={`max-w-xs md:max-w-md p-3 text-white shadow-md ${messageClasses}`}>
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        </div>
    );
};

const Chatbot: React.FC<ChatbotProps> = ({ onSendMessage, messages, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <>
      {/* Floating Action Button for Mobile */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-30 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-500 transition-transform transform hover:scale-110"
      >
        <ChatIcon className="w-6 h-6" />
      </button>

      {/* Chat Panel */}
      <div className={`fixed bottom-0 right-0 z-20 h-full w-full max-w-sm flex flex-col bg-gray-800 border-l border-gray-700 shadow-2xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 lg:relative lg:h-auto lg:max-w-xs xl:max-w-sm`}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900">
          <h2 className="text-lg font-semibold text-cyan-400">AI Assistant</h2>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto flex flex-col space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <div className="self-start flex items-center space-x-2">
                <div className="bg-gray-700 rounded-r-lg rounded-tl-lg p-3">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about parking..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-cyan-600 text-white rounded-full p-3 hover:bg-cyan-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              disabled={isLoading}
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
