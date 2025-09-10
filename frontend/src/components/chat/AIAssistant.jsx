import React, { useState } from 'react';
import { Sparkles, Send, Bot, User } from 'lucide-react';

/**
 * AI Assistant Component - Mock Implementation
 * 
 * This component provides a user interface for AI assistance in chats,
 * currently using MOCK responses instead of real Google Gemini API calls.
 * 
 * CURRENT STATUS: MOCK IMPLEMENTATION
 * - Displays "Powered by Google Gemini" but uses hardcoded responses
 * - No actual API calls to Google Gemini
 * - No @google/generative-ai dependency installed
 * 
 * TO IMPLEMENT REAL GOOGLE GEMINI INTEGRATION:
 * 1. Install: npm install @google/generative-ai
 * 2. Add API key to environment: VITE_GOOGLE_GEMINI_API_KEY
 * 3. Replace callGeminiAPI function with real API implementation
 * 4. Handle proper error states and rate limiting
 */

const AIAssistant = ({ onSendMessage, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState([]);

  // MOCK Gemini AI API call - NOT a real implementation
  // TODO: Replace with actual Google Gemini API integration
  const callGeminiAPI = async (prompt, context = []) => {
    // ⚠️  MOCK IMPLEMENTATION WARNING ⚠️
    // This is NOT a real Google Gemini API call!
    // This function returns hardcoded responses for demonstration purposes.
    // 
    // For real implementation:
    // 1. Import: import { GoogleGenerativeAI } from '@google/generative-ai';
    // 2. Initialize: const genAI = new GoogleGenerativeAI(process.env.VITE_GOOGLE_GEMINI_API_KEY);
    // 3. Use actual API calls instead of mock responses below
    
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    
    // Mock AI responses based on prompt content
    const responses = {
      greeting: "Hello! I'm your Echo AI assistant. I can help you with messaging, finding information, or just having a conversation. What can I do for you today?",
      help: "I can help you with various tasks:\n• Draft messages and replies\n• Translate text\n• Summarize conversations\n• Answer questions\n• Provide suggestions\n• Help with creative writing\n\nWhat would you like me to help you with?",
      translate: "I can translate text between many languages. Just tell me what you'd like to translate and which language you want it in!",
      default: `I understand you're asking about "${prompt}". While I'm still learning, I can help you draft a response, provide suggestions, or clarify information. How would you like me to assist you?`
    };

    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('hello') || lowerPrompt.includes('hi') || lowerPrompt.includes('hey')) {
      return responses.greeting;
    } else if (lowerPrompt.includes('help') || lowerPrompt.includes('what can you do')) {
      return responses.help;
    } else if (lowerPrompt.includes('translate')) {
      return responses.translate;
    } else {
      return responses.default;
    }
  };

  const handleSendToAI = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = { role: 'user', content: message };
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    setMessage('');
    setIsLoading(true);

    try {
      // MOCK: Call simulated Gemini AI API (not real!)
      // TODO: Replace with real Google Gemini API call
      const aiResponse = await callGeminiAPI(message, conversation);
      
      const assistantMessage = { role: 'assistant', content: aiResponse };
      setConversation(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI API error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later." 
      };
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseResponse = (content) => {
    onSendMessage({ content, type: 'text' });
    setIsOpen(false);
  };

  const clearConversation = () => {
    setConversation([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        title="AI Assistant"
      >
        <Sparkles className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI Assistant</h3>
              <p className="text-sm opacity-90">Mock Implementation - Not Real Gemini API</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearConversation}
              className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm hover:bg-opacity-30 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversation.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-2">Hello! I'm your AI assistant</p>
              <p className="text-sm">Ask me anything or let me help you craft the perfect message!</p>
            </div>
          )}

          {conversation.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {msg.role === 'assistant' && (
                    <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  {msg.role === 'user' && (
                    <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleUseResponse(msg.content)}
                        className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Use this message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-[80%] px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendToAI();
                  }
                }}
                placeholder="Ask me anything or request help with a message..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSendToAI}
              disabled={!message.trim() || isLoading}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;