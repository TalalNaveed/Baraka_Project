import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Plus,
  Trash2,
  Check,
  Circle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Clock3,
  Search,
} from 'lucide-react';
import type { Task } from './types/database';
import { mockTasks } from './data/mockTasks';

type FilterType = 'all' | 'completed' | 'pending';
type SortOption = 'newest' | 'oldest' | 'az' | 'za' | 'pending-first';

const STORAGE_KEY = 'tasks';

const loadSavedTasks = (): Task[] => {
  if (typeof window === 'undefined') return mockTasks;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return mockTasks;
    const parsed = JSON.parse(raw) as Task[];
    if (!Array.isArray(parsed)) return mockTasks;
    return parsed;
  } catch (err) {
    console.warn('Failed to read saved tasks, falling back to mock data', err);
    return mockTasks;
  }
};

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadSavedTasks());
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const totalTasks = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completionRate = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0;
  const nextTask = useMemo(
    () => tasks.find(t => !t.completed),
    [tasks]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleComplete = (taskId: number) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const clearCompleted = () => {
    if (!completedCount) return;
    if (!confirm('Remove all completed tasks?')) return;
    setTasks(tasks.filter(t => !t.completed));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTasks = useMemo(() => {
    const term = searchTerm.toLowerCase();

    const base = tasks.filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    }).filter(task => task.title.toLowerCase().includes(term));

    const sorter: Record<SortOption, (a: Task, b: Task) => number> = {
      newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      oldest: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      az: (a, b) => a.title.localeCompare(b.title),
      za: (a, b) => b.title.localeCompare(a.title),
      'pending-first': (a, b) => Number(a.completed) - Number(b.completed),
    };

    return [...base].sort(sorter[sortBy]);
  }, [tasks, filter, searchTerm, sortBy]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-12 space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200/80">
              <Sparkles size={16} /> Focus Board
            </p>
            <h1 className="text-4xl font-bold mt-2 leading-tight">
              Todo List
            </h1>
            <p className="text-slate-300 mt-2 max-w-2xl">
              Capture, prioritize, and ship faster with a crisp view of what’s done and what’s next.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total scope"
            value={totalTasks}
            delta={`${completionRate}% done`}
            icon={<TrendingUp size={18} />}
            accent="from-blue-500/30 to-blue-400/10"
          />
          <StatCard
            title="Completed"
            value={completedCount}
            delta={completedCount ? 'Nice momentum' : 'Let’s start ticking boxes'}
            icon={<CheckCircle2 size={18} />}
            accent="from-emerald-500/30 to-emerald-400/10"
          />
          <StatCard
            title="In progress"
            value={pendingCount}
            delta={nextTask ? 'Focus on the next one' : 'Zero open items'}
            icon={<Clock3 size={18} />}
            accent="from-amber-500/30 to-amber-400/10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-blue-500/10 backdrop-blur">
              <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Write a crisp task title…"
                    className="w-full rounded-xl bg-slate-900/50 border border-white/10 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-500 text-sm">
                    ⌘⏎ to add
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 px-5 py-3 font-semibold text-slate-950 shadow-lg shadow-blue-500/30 transition hover:translate-y-[1px] hover:shadow-xl hover:shadow-blue-500/40 disabled:from-slate-700 disabled:to-slate-600 disabled:text-slate-300"
                >
                  <Plus size={18} />
                  Add Task
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tasks by title…"
                    className="w-full rounded-xl bg-slate-900/60 border border-white/10 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  />
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none rounded-xl bg-slate-900/60 border border-white/10 px-3 py-2 text-sm text-slate-100 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="az">A → Z</option>
                    <option value="za">Z → A</option>
                    <option value="pending-first">Pending first</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[{ key: 'all', label: `All (${totalTasks})` }, { key: 'pending', label: `Pending (${pendingCount})` }, { key: 'completed', label: `Completed (${completedCount})` }].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key as FilterType)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      filter === key
                        ? 'border-blue-300 bg-blue-500/20 text-blue-100 shadow shadow-blue-500/30'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/30'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={clearCompleted}
                  disabled={!completedCount}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-300 hover:text-red-100 disabled:opacity-50"
                >
                  Clear completed
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur">
              {filteredTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
                  <Circle size={48} className="opacity-40" />
                  <p>No tasks match this filter.</p>
                  <p className="text-sm text-slate-500">Try switching filters or adding a new task.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex items-start gap-3 rounded-xl border border-white/5 bg-slate-900/60 p-4 transition hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10"
                    >
                      <button
                        onClick={() => toggleComplete(task.id)}
                        className="mt-0.5 flex-shrink-0 rounded-full bg-slate-800/70 p-2 text-slate-400 transition hover:text-emerald-300"
                      >
                        {task.completed ? (
                          <CheckCircle2 size={22} className="text-emerald-300" />
                        ) : (
                          <Circle size={22} className="text-slate-500" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className={`text-base font-semibold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-50'}`}>
                            {task.title}
                          </p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${task.completed ? 'bg-emerald-400/15 text-emerald-200 border border-emerald-300/30' : 'bg-amber-400/10 text-amber-100 border border-amber-300/20'}`}>
                            {task.completed ? 'Done' : 'In progress'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Created {formatDate(task.createdAt)}</p>
                        <div className="h-1.5 w-full rounded-full bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all ${task.completed ? 'bg-emerald-400 w-full' : 'bg-blue-400 w-1/3'}`}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="flex-shrink-0 rounded-lg p-2 text-slate-500 transition hover:bg-red-500/15 hover:text-red-200"
                        aria-label="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/20 via-slate-900 to-slate-900 p-6 shadow-2xl shadow-blue-500/20 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.2em] text-blue-100/80">Momentum</p>
                <Check size={18} className="text-blue-100" />
              </div>
              <p className="mt-2 text-3xl font-bold">{completionRate}%</p>
              <p className="text-sm text-blue-100/80">Completion rate</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-200">
                {nextTask ? `Stay sharp: ${nextTask.title}` : 'All tasks cleared. Take a victory lap!'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-500/10 backdrop-blur">
              <p className="text-sm font-semibold text-slate-200">Quick tips</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>• Keep titles action-focused.</li>
                <li>• Tackle pending tasks before adding more.</li>
                <li>• Use filters to spotlight the right work.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: number | string;
  delta: string;
  icon: ReactNode;
  accent: string;
};

function StatCard({ title, value, delta, icon, accent }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-slate-900/40 backdrop-blur">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-200/80">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          <p className="text-xs text-slate-200/70">{delta}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default App;
