"use client";
import React from "react";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  provider: "openai" | "anthropic";
  createdAt: number;
}

interface ChatPanelProps {
  chatId?: number;
  provider: "openai" | "anthropic";
  onChatCreated: (chatId: number) => void;
}

export function ChatPanel({ chatId, provider, onChatCreated }: ChatPanelProps) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [streamingContent, setStreamingContent] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Load messages for current chat
  React.useEffect(() => {
    if (chatId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [chatId]);

  // Auto-refresh chat list callback
  const refreshChatList = React.useCallback(() => {
    if (onChatCreated) {
      // Trigger parent to refresh chat list
      window.dispatchEvent(new CustomEvent('chatListRefresh'));
    }
  }, [onChatCreated]);

  const loadMessages = async () => {
    if (!chatId) return;
    
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (res.ok) {
        const data = await res.json();
        // Filter out system messages for display
        const userMessages = data.messages.filter((m: Message) => m.role !== "system");
        setMessages(userMessages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isStreaming) return;

    setError(null);

    // Handle slash commands
    if (input.startsWith("/task ")) {
      await handleTaskCommand(input);
      return;
    }

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input,
      provider,
      createdAt: Date.now() / 1000,
    };
    setMessages(prev => [...prev, userMessage]);

    setIsStreaming(true);
    setStreamingContent("");

    try {
      // Use test endpoint while API providers are being fixed
      const response = await fetch("/api/test-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          provider,
          userText: input,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                setError(data.error);
                break;
              }
              
              if (data.content) {
                setStreamingContent(prev => prev + data.content);
              }
              
              if (data.done) {
                // Create final assistant message
                const assistantMessage: Message = {
                  id: Date.now() + 1,
                  role: "assistant",
                  content: data.fullResponse || streamingContent,
                  provider,
                  createdAt: Date.now() / 1000,
                };
                setMessages(prev => [...prev, assistantMessage]);
                setStreamingContent("");
                
                // If this was the first message, update chatId and refresh chat list
                if (!chatId && data.chatId) {
                  onChatCreated(data.chatId);
                  // Refresh sidebar chat list
                  setTimeout(refreshChatList, 100);
                }
                break;
              }
            } catch (e) {
              console.error("Failed to parse streaming data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please check your API keys in .env.local");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleTaskCommand = async (input: string) => {
    const match = input.match(/^\/task\s+(.+?)(?:\s+by\s+(\d{4}-\d{2}-\d{2}))?(?:\s+@(\S+))?$/i);
    
    if (!match) {
      setError("Invalid task format. Use: /task Title by YYYY-MM-DD @owner");
      return;
    }

    const [, title, dueDate, owner] = match;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, dueDate, owner }),
      });

      const data = await response.json();
      
      if (data.ok) {
        const confirmationMessage: Message = {
          id: Date.now(),
          role: "assistant",
          content: `✅ Task created: **${title}**${dueDate ? ` (due ${dueDate})` : ""}${owner ? ` (@${owner})` : ""}`,
          provider,
          createdAt: Date.now() / 1000,
        };
        setMessages(prev => [...prev, confirmationMessage]);
      } else {
        setError(`Failed to create task: ${data.error}`);
      }
    } catch (error) {
      setError("Failed to create task");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center text-gray-500 py-12">
              <h2 className="text-xl font-medium mb-2">Start a conversation</h2>
              <p className="text-sm">
                Ask me anything about project management, or use slash commands like:
              </p>
              <p className="text-sm font-mono mt-2 text-gray-600">
                /task Create homepage by 2025-12-01 @john
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              message={message} 
              provider={provider}
            />
          ))}
          
          {/* Streaming Message */}
          {isStreaming && streamingContent && (
            <MessageBubble 
              message={{
                id: -1,
                role: "assistant",
                content: streamingContent,
                provider,
                createdAt: Date.now() / 1000,
              }}
              provider={provider}
              isStreaming={true}
            />
          )}
          
          {/* Typing Indicator */}
          {isStreaming && !streamingContent && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                {provider === "openai" ? "G" : "C"}
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-2">
          <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Message Composer */}
      <div className="border-t border-gray-200 p-6">
        <div className="max-w-3xl mx-auto">
          <MessageComposer 
            onSend={handleSendMessage}
            disabled={isStreaming}
            placeholder="Type a message or /task Title by YYYY-MM-DD @owner"
          />
        </div>
      </div>
    </div>
  );
}
