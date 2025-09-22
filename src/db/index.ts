import * as schema from "./schema";
import { jsonDb } from "./json-db";

// Use reliable JSON file database
const db = {
  select: () => ({
    from: (table: any) => {
      // Direct call to from() should return the data immediately
      if (table === schema.chats) {
        return jsonDb.selectChats();
      }
      if (table === schema.tasks) {
        return jsonDb.selectTasks();
      }
      
      // Return an object for chaining where() and orderBy() when needed
      return {
        where: (condition?: any) => ({
          orderBy: (order?: any) => {
            if (table === schema.messages) {
              if (condition && condition.value !== undefined) {
                return jsonDb.selectMessages(condition.value);
              }
              return [];
            }
            return [];
          }
        }),
        orderBy: (order?: any) => {
          if (table === schema.messages) {
            return [];
          }
          return [];
        }
      };
    }
  }),
  
  insert: (table: any) => ({
    values: (values: any) => ({
      returning: () => {
        if (table === schema.chats) {
          const chat = jsonDb.insertChat(values.title);
          return [chat];
        }
        if (table === schema.messages) {
          const message = jsonDb.insertMessage(
            values.chatId,
            values.role,
            values.provider,
            values.content
          );
          return [message];
        }
        if (table === schema.tasks) {
          const task = jsonDb.insertTask(
            values.title,
            values.projectId,
            values.owner,
            values.dueDate,
            values.notes,
            values.status
          );
          return [task];
        }
        return [];
      }
    })
  }),
  
  update: (table: any) => ({
    set: (values: any) => ({
      where: (condition: any) => ({
        returning: () => {
          if (table === schema.tasks && condition.value) {
            const task = jsonDb.updateTask(condition.value, values);
            return task ? [task] : [];
          }
          return [];
        }
      })
    })
  })
};

const eq = (column: any, value: any) => ({ column, value, type: 'eq' });

export { db, eq };
export type Schema = typeof schema;
