"use client";
import React from "react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface Message {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
  provider: "openai" | "anthropic";
  createdAt: number;
}

interface MessageBubbleProps {
  message: Message;
  provider: "openai" | "anthropic";
  isStreaming?: boolean;
}

export function MessageBubble({ message, provider, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const providerInitial = provider === "openai" ? "G" : "C";
  const providerName = provider === "openai" ? "GPT" : "Claude";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
        isUser 
          ? "bg-gray-600" 
          : provider === "openai" 
            ? "bg-green-600" 
            : "bg-blue-600"
      }`}>
        {isUser ? "Y" : providerInitial}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : ""}`}>
        {/* Message Header */}
        <div className={`text-xs text-gray-500 mb-1 ${isUser ? "text-right" : ""}`}>
          <span className="font-medium">
            {isUser ? "You" : providerName}
          </span>
          {!isStreaming && (
            <span className="ml-2">
              {new Date(message.createdAt * 1000).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          )}
          {isStreaming && (
            <span className="ml-2">typing...</span>
          )}
        </div>

        {/* Message Bubble */}
        <div className={`rounded-lg px-4 py-3 ${
          isUser 
            ? "bg-blue-600 text-white ml-auto" 
            : "bg-gray-100 text-gray-900"
        }`}>
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
}
