import { create } from 'zustand'

const useTaskStore = create((set, get) => ({
  tasks: [],
  activeTasks: [],         // volunteer's currently accepted tasks
  selectedTask: null,
  loading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),
  setActiveTasks: (activeTasks) => set({ activeTasks }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (taskId, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    })),
  removeTask: (taskId) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== taskId) })),

  reset: () =>
    set({ tasks: [], activeTasks: [], selectedTask: null, loading: false, error: null }),
}))

export default useTaskStore
