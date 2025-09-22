"use client";
import React from "react";

interface TopBarProps {
  provider: "openai" | "anthropic";
  onProviderChange: (provider: "openai" | "anthropic") => void;
  onNewChat: () => void;
}

export function TopBar({ provider, onProviderChange, onNewChat }: TopBarProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Crella</h1>
          <span className="text-sm text-gray-500">Local PM Assistant</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Provider Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Provider:</label>
            <select
              value={provider}
              onChange={(e) => onProviderChange(e.target.value as "openai" | "anthropic")}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI (GPT)</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 bg-blue-600 text-white rounded-md px-3 py-1 text-sm hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>
      </div>
    </div>
  );
}
