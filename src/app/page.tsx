"use client";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { TopBar } from "@/components/TopBar";

export default function Home() {
  const [chatId, setChatId] = React.useState<number | undefined>();
  const [provider, setProvider] = React.useState<"openai" | "anthropic">(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('crella-provider') as "openai" | "anthropic") || "openai";
    }
    return "openai";
  });
  
  const [chats, setChats] = React.useState<Array<{id: number, title: string, createdAt: number}>>([]);
  
  // Save provider preference
  React.useEffect(() => {
    localStorage.setItem('crella-provider', provider);
  }, [provider]);

  // Load chats list
  const loadChats = React.useCallback(async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  }, []);

  React.useEffect(() => {
    loadChats();
  }, [loadChats]);

  const handleNewChat = () => {
    setChatId(undefined);
  };

  const handleChatCreated = (newChatId: number) => {
    setChatId(newChatId);
    loadChats(); // Refresh sidebar
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar 
        chats={chats}
        currentChatId={chatId}
        onChatSelect={setChatId}
        onNewChat={handleNewChat}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <TopBar 
          provider={provider}
          onProviderChange={setProvider}
          onNewChat={handleNewChat}
        />
        
        {/* Chat Panel */}
        <ChatPanel 
          chatId={chatId}
          provider={provider}
          onChatCreated={handleChatCreated}
        />
      </div>
    </div>
  );
}