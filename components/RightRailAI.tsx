"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, X, HelpCircle, Lightbulb, BookOpen, Zap, Target, FileText, Upload, Play, Download, Settings, Bot } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface RightRailAIProps {
  currentStep: string;
  construct: any;
  userStories: any[];
  requirements: any[];
  requirementsConstruct: any;
  transcripts: any[];
  onUpdateUserStories: (stories: any[]) => void;
  onUpdateRequirements: (requirements: any[]) => void;
  onUpdateConstruct: (construct: any) => void;
  onUpdateTranscripts: (transcripts: any[]) => void;
}

export function RightRailAI({ 
  currentStep, 
  construct, 
  userStories, 
  transcripts, 
  requirements, 
  requirementsConstruct,
  onUpdateUserStories,
  onUpdateRequirements,
  onUpdateConstruct,
  onUpdateTranscripts
}: RightRailAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>>([]);
  const { toast } = useToast();
  
  // Debug logging
  useEffect(() => {
    // Load saved chat history
    try {
      const saved = localStorage.getItem('chatHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setChatHistory(parsed);
        }
      }
    } catch (e) {
      // Silently fail if chat history is corrupted
    }
  }, []);

  useEffect(() => {
    // Save chat history when it changes
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    // Add user message to chat
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, newUserMessage]);

    try {
      // Prepare chat context
      const chatContext = {
        currentStep,
        construct: construct ? {
          name: construct.name,
          output_schema: construct.output_schema,
          description: construct.description
        } : null,
        userStories: userStories?.slice(0, 5) || [], // Limit to first 5 for context
        requirements: requirements?.slice(0, 5) || [], // Limit to first 5 for context
        requirementsConstruct: requirementsConstruct ? {
          name: requirementsConstruct.name,
          output_schema: requirementsConstruct.output_schema
        } : null,
        transcripts: transcripts?.slice(0, 3) || [] // Limit to first 3 for context
      };

      console.log('Sending chat request:', { message: userMessage, context: chatContext });

      // Send to backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://interview-etl-backend-bwxhuzcaka-uc.a.run.app';
      const response = await fetch(`${backendUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: chatContext
        }),
      });

      console.log('Chat response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Chat response data:', data);
      
      // Check if the response has the expected structure
      if (!data.response && !data.message) {
        throw new Error('Invalid response format from backend');
      }
      
      // Add assistant response to chat
      const newAssistantMessage = {
        role: 'assistant' as const,
        content: data.response || data.message || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, newAssistantMessage]);

    } catch (error) {
      // Add error message to chat
      const errorMessage = {
        role: 'assistant' as const,
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [input, currentStep, construct, userStories, requirements, requirementsConstruct, transcripts]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
  };

  // Get helpful suggestions based on current step and data
  const getSuggestions = (): string[] => {
    const baseSuggestions = [
      "How does the Interview ETL process work?",
      "What are best practices for user stories?",
      "How do I improve my requirements?",
      "Can you analyze my data?",
      "What should I do next?"
    ];

    switch (currentStep) {
      case 'construct':
        return [
          "What fields should I include in my schema?",
          "How do I structure stakeholder information?",
          "What makes a good user story format?",
          "How do I handle priority levels?",
          "What validation rules should I set?"
        ];
      case 'upload':
        return [
          "What file formats are supported?",
          "How do I prepare my transcripts?",
          "What happens during processing?",
          "How do I handle multiple files?",
          "What if upload fails?"
        ];
      case 'process':
        return [
          "How does the AI extraction work?",
          "How long does processing take?",
          "What affects processing speed?",
          "How accurate are the extractions?",
          "What if processing fails?"
        ];
      case 'userStories':
        return [
          "How do I write good user stories?",
          "What makes a story actionable?",
          "How do I prioritize stories?",
          "Can you suggest improvements?",
          "How do I organize stories?"
        ];
      case 'requirements_construct':
        return [
          "How do requirements relate to stories?",
          "What makes a good requirement?",
          "How do I structure requirements?",
          "What fields are essential?",
          "How do I handle non-functional requirements?"
        ];
      case 'requirements':
        return [
          "How do I review requirements?",
          "What makes requirements clear?",
          "How do I handle ambiguity?",
          "Can you suggest improvements?",
          "How do I ensure completeness?"
        ];
      case 'download':
        return [
          "What formats can I download?",
          "How do I validate the output?",
          "What's included in the results?",
          "How do I use the exported data?",
          "What should I do next?"
        ];
      default:
        return baseSuggestions;
    }
  };

  const suggestions = getSuggestions();

  return (
    <>
      {/* Floating AI Button - Always visible */}
      <div 
        className="fixed right-4 top-1/3 transform -translate-y-1/2 z-[9999]"
        onMouseEnter={() => {
          setIsHovered(true);
        }}
        onMouseLeave={() => {
          !isOpen && setIsHovered(false);
        }}
        style={{ 
          position: 'fixed',
          right: '16px',
          top: '33%',
          transform: 'translateY(-50%)',
          zIndex: 9999
        }}
      >
        <Button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          className={`
            w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ease-in-out
            ${isOpen 
              ? 'bg-red-600 hover:bg-red-700 scale-110' 
              : isHovered 
                ? 'bg-green-500 hover:bg-green-600 scale-105' 
                : 'bg-blue-500 hover:bg-blue-600'
            }
          `}
          size="lg"
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '3px solid white'
          }}
        >
          <Bot className="w-6 h-6" />
        </Button>
        
        {/* Tooltip on hover */}
        {isHovered && !isOpen && (
          <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
            AI Assistant
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </div>
        )}
      </div>

      {/* Slide-out AI Panel */}
      <div 
        className={`
          fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[9998]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        style={{ 
          position: 'fixed',
          right: 0,
          top: 0,
          height: '100%',
          width: '384px',
          backgroundColor: 'white',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease-in-out',
          zIndex: 9998
        }}
      >
        <Card className="h-full border-0 shadow-none rounded-none">
          <CardHeader className="pb-3 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                <CardTitle className="text-lg">AI Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AI Assistant
              </h3>
              <p className="text-sm text-gray-600">
                Ask me anything about the Interview ETL process, your data, or get help with any step.
              </p>
              {chatHistory.length > 0 && (
                <p className="text-xs text-green-600 mt-1">
                  {chatHistory.length} messages in this session
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4 pb-6 h-full flex flex-col">
            {/* Chat History - Reduced bottom margin */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-2">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Start a conversation to get help with the Interview ETL process</p>
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        chat.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{chat.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(chat.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 max-w-xs px-3 py-2 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions - Reduced margin */}
            {chatHistory.length === 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {/* The original context.suggestions was removed, so this will be empty */}
                  {/* If you want to re-add suggestions, you'd need to define them here */}
                  {/* For now, keeping the structure but it will be empty */}
                  {/* <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs h-7 px-2"
                  >
                    {suggestion}
                  </Button> */}
                </div>
              </div>
            )}

            {/* Chat Input - Moved up with reduced margins */}
            <div className="flex space-x-2 mb-4">
              <Input
                value={input}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about the Interview ETL process..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                size="sm"
                className="px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Clear Chat Button - Reduced margin */}
            {chatHistory.length > 0 && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearChatHistory}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear Chat History
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Backdrop when open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
