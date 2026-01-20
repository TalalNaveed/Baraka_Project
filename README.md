# Baraka Project - Todo List Application

A modern, feature-rich todo list application built with React, TypeScript, and Tailwind CSS. Features a sleek dark UI with gradient accents, task management, and persistent local storage.

## Features

### Core Features
- ✅ **Add Tasks** - Create new tasks with validation
- ✅ **View Tasks** - Display all tasks with creation timestamps
- ✅ **Toggle Status** - Mark tasks as complete/incomplete with visual feedback
- ✅ **Delete Tasks** - Remove tasks with confirmation prompts
- ✅ **Filter Tasks** - Filter by All, Pending, or Completed status

### Bonus Features
- 🔍 **Search** - Quickly find tasks by title
- 🔄 **Sort Options** - Sort by newest, oldest, A-Z, Z-A, or pending-first
- 💾 **LocalStorage Persistence** - Tasks persist across browser sessions
- 🧹 **Bulk Clear** - Remove all completed tasks at once
- 📊 **Stats Dashboard** - Real-time completion rate and task counts
- 🎨 **Modern UI** - Dark theme with gradient backgrounds and smooth animations

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/TalalNaveed/Baraka_Project.git
cd Baraka_Project
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── App.tsx           # Main application component
├── data/
│   └── mockTasks.ts  # Initial mock data
├── types/
│   └── database.ts   # TypeScript type definitions
└── main.tsx          # Application entry point
```

