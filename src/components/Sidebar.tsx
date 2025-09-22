"use client";
import React from "react";

interface Chat {
  id: number;
  title: string;
  createdAt: number;
}

interface SidebarProps {
  chats: Chat[];
  currentChatId?: number;
  onChatSelect: (chatId: number) => void;
  onNewChat: () => void;
}

export function Sidebar({ chats, currentChatId, onChatSelect, onNewChat }: SidebarProps) {
  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white rounded-lg px-4 py-2 hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-gray-500 text-sm text-center">
            No conversations yet
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full text-left p-3 rounded-lg mb-1 hover:bg-gray-100 transition-colors ${
                  currentChatId === chat.id ? "bg-gray-200" : ""
                }`}
              >
                <div className="font-medium text-sm text-gray-900 truncate">
                  {chat.title || "Untitled Chat"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(chat.createdAt * 1000).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <strong>Crella</strong> - Local PM Assistant
        </div>
      </div>
    </div>
  );
}
