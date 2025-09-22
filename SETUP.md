# 🚀 Crella Setup Guide

## ✅ Database Status: READY
Your local SQLite database is set up at `.data/local.sqlite` (24KB)

## 🔑 Required: API Keys Setup

Create `.env.local` in the project root:
```bash
# Required - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o-mini

# Required - Get from https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here  
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

## 🏃‍♂️ Start the Application

```bash
# Start development server
pnpm dev
```

Visit: http://localhost:3000

## 🗄️ Check Your Database

```bash
# Check database status
pnpm db:check

# Open database viewer (web interface)
pnpm db:studio
```

## 💾 Data Storage

- **Location**: `.data/local.sqlite` 
- **Type**: Local SQLite file on your machine
- **Privacy**: ALL data stays on your computer
- **Backup**: Copy the `.data/` folder to backup your chats and tasks

## ✨ Test Features

1. **Chat**: Ask "Plan a website project"
2. **Tasks**: Type `/task Create wireframes by 2025-01-15 @designer`
3. **Providers**: Switch between OpenAI and Anthropic in top bar
4. **History**: Your conversations persist in the sidebar

## 🔧 Troubleshooting

**If you see database errors:**
```bash
pnpm rebuild
pnpm setup
```

**If API calls fail:**
- Verify your API keys in `.env.local`
- Check you have credits/access with OpenAI/Anthropic

---
🎯 **Your local PM assistant is ready!**
