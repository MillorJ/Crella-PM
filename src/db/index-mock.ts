// Mock database for testing when better-sqlite3 bindings fail
import * as schema from "./schema";

// Mock data storage
let mockChats: any[] = [];
let mockMessages: any[] = [];
let mockTasks: any[] = [];
let mockProjects: any[] = [];

// Mock counters for IDs
let chatIdCounter = 1;
let messageIdCounter = 1;
let taskIdCounter = 1;
let projectIdCounter = 1;

// Mock eq function for Drizzle compatibility
const createMockEq = (column: any, value: any) => {
  return { column, value, type: 'eq' };
};

// Mock database operations
const mockDb = {
  select: () => ({
    from: (table: any) => ({
      where: (condition: any) => ({
        orderBy: (order: any) => {
          console.log("🔍 Mock DB - WHERE query on", table?.name || 'unknown_table', condition);
          if (table === schema.chats) return mockChats;
          if (table === schema.messages) {
            // Handle Drizzle eq condition
            if (condition && condition.type === 'eq' && condition.value !== undefined) {
              return mockMessages.filter(m => m.chatId === condition.value);
            }
            // Fallback for direct chatId
            if (condition && condition.chatId !== undefined) {
              return mockMessages.filter(m => m.chatId === condition.chatId);
            }
            return mockMessages;
          }
          if (table === schema.tasks) return mockTasks;
          if (table === schema.projects) return mockProjects;
          return [];
        }
      }),
      orderBy: (order: any) => {
        console.log("🔍 Mock DB - SELECT from", table?.name || 'unknown_table');
        if (table === schema.chats) return mockChats;
        if (table === schema.messages) return mockMessages;
        if (table === schema.tasks) return mockTasks;
        if (table === schema.projects) return mockProjects;
        return [];
      }
    })
  }),
  
  insert: (table: any) => ({
    values: (values: any) => ({
      returning: () => {
        if (table === schema.chats) {
          const newChat = { 
            id: chatIdCounter++, 
            ...values, 
            createdAt: Math.floor(Date.now() / 1000) 
          };
          mockChats.push(newChat);
          return [newChat];
        }
        if (table === schema.messages) {
          const newMessage = { 
            id: messageIdCounter++, 
            ...values, 
            createdAt: Math.floor(Date.now() / 1000) 
          };
          mockMessages.push(newMessage);
          console.log("🔍 Mock DB - Inserted message:", newMessage);
          return [newMessage];
        }
        if (table === schema.tasks) {
          const newTask = { 
            id: taskIdCounter++, 
            ...values, 
            createdAt: Math.floor(Date.now() / 1000) 
          };
          mockTasks.push(newTask);
          return [newTask];
        }
        if (table === schema.projects) {
          const newProject = { 
            id: projectIdCounter++, 
            ...values, 
            createdAt: Math.floor(Date.now() / 1000) 
          };
          mockProjects.push(newProject);
          return [newProject];
        }
        return [];
      }
    })
  }),

  update: (table: any) => ({
    set: (values: any) => ({
      where: (condition: any) => ({
        returning: () => {
          if (table === schema.tasks) {
            // Find and update task (simple mock)
            const task = mockTasks.find(t => t.id === condition.id);
            if (task) {
              Object.assign(task, values);
              return [task];
            }
          }
          return [];
        }
      })
    })
  })
};

export const db = mockDb as any;
export const eq = createMockEq;
export type Schema = typeof schema;

console.log("⚠️  Using MOCK database - better-sqlite3 bindings not available");
console.log("📝 This is for testing only. Data will not persist between restarts.");
