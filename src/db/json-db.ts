// Simple JSON file database for reliable local storage
import fs from 'fs';
import path from 'path';

interface Chat {
  id: number;
  title: string;
  createdAt: number;
}

interface Message {
  id: number;
  chatId: number;
  role: 'user' | 'assistant' | 'system';
  provider: 'openai' | 'anthropic';
  content: string;
  createdAt: number;
}

interface Task {
  id: number;
  projectId?: number;
  title: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  owner?: string;
  dueDate?: string;
  notes?: string;
  createdAt: number;
}

interface Project {
  id: number;
  name: string;
  description?: string;
  createdAt: number;
}

interface Database {
  chats: Chat[];
  messages: Message[];
  tasks: Task[];
  projects: Project[];
  counters: {
    chatId: number;
    messageId: number;
    taskId: number;
    projectId: number;
  };
}

class JsonDatabase {
  private dbPath: string;
  private data: Database;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'crella.json');
    this.ensureDataDir();
    this.loadData();
  }

  private ensureDataDir() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private loadData() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = {
          chats: [],
          messages: [],
          tasks: [],
          projects: [],
          counters: {
            chatId: 1,
            messageId: 1,
            taskId: 1,
            projectId: 1
          }
        };
        this.saveData();
      }
    } catch (error) {
      console.error('Error loading database:', error);
      this.data = {
        chats: [],
        messages: [],
        tasks: [],
        projects: [],
        counters: {
          chatId: 1,
          messageId: 1,
          taskId: 1,
          projectId: 1
        }
      };
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  // Chat operations
  insertChat(title: string): Chat {
    const chat: Chat = {
      id: this.data.counters.chatId++,
      title,
      createdAt: Math.floor(Date.now() / 1000)
    };
    this.data.chats.push(chat);
    this.saveData();
    return chat;
  }

  selectChats(): Chat[] {
    return [...this.data.chats].sort((a, b) => b.createdAt - a.createdAt);
  }

  // Message operations
  insertMessage(chatId: number, role: string, provider: string, content: string): Message {
    const message: Message = {
      id: this.data.counters.messageId++,
      chatId,
      role: role as 'user' | 'assistant' | 'system',
      provider: provider as 'openai' | 'anthropic',
      content,
      createdAt: Math.floor(Date.now() / 1000)
    };
    this.data.messages.push(message);
    this.saveData();
    return message;
  }

  selectMessages(chatId: number): Message[] {
    return this.data.messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  // Task operations
  insertTask(title: string, projectId?: number, owner?: string, dueDate?: string, notes?: string, status?: string): Task {
    const task: Task = {
      id: this.data.counters.taskId++,
      projectId,
      title,
      status: (status as any) || 'todo',
      owner,
      dueDate,
      notes,
      createdAt: Math.floor(Date.now() / 1000)
    };
    this.data.tasks.push(task);
    this.saveData();
    return task;
  }

  selectTasks(): Task[] {
    return [...this.data.tasks].sort((a, b) => b.createdAt - a.createdAt);
  }

  updateTask(id: number, updates: Partial<Task>): Task | null {
    const taskIndex = this.data.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return null;
    
    this.data.tasks[taskIndex] = { ...this.data.tasks[taskIndex], ...updates };
    this.saveData();
    return this.data.tasks[taskIndex];
  }

  // Debug
  getStats() {
    return {
      chats: this.data.chats.length,
      messages: this.data.messages.length,
      tasks: this.data.tasks.length,
      projects: this.data.projects.length,
      dbPath: this.dbPath
    };
  }
}

// Create singleton instance
export const jsonDb = new JsonDatabase();

console.log('📁 JSON Database initialized at:', jsonDb.getStats().dbPath);
console.log('📊 Current data:', jsonDb.getStats());
