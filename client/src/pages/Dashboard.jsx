import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import CreateTaskModal from "../components/CreateTaskModal";
import TaskLogsModal from "../components/TaskLogsModal";

const STATUS_FILTERS = ["all", "pending", "running", "success", "failed"];

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [runningIds, setRunningIds] = useState(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [logsTask, setLogsTask] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = useCallback(async () => {
    try {
      const params = { page, limit: 12 };
      if (filter !== "all") params.status = filter;
      const { data } = await api.get("/tasks", { params });
      setTasks(data.tasks);
      setTotalPages(data.pages);
    } catch (err) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Poll for running tasks
  useEffect(() => {
    const hasRunning = tasks.some(
      (t) => t.status === "pending" || t.status === "running"
    );
    if (!hasRunning) return;
    const interval = setInterval(fetchTasks, 2500);
    return () => clearInterval(interval);
  }, [tasks, fetchTasks]);

  const handleRun = async (taskId) => {
    setRunningIds((prev) => new Set(prev).add(taskId));
    try {
      await api.post(`/tasks/${taskId}/run`);
      toast.success("Task queued!");
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to run task");
    } finally {
      setRunningIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success("Task deleted");
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const handleCreated = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
  };

  // Stats
  const stats = {
    total: tasks.length,
    success: tasks.filter((t) => t.status === "success").length,
    running: tasks.filter((t) => t.status === "running" || t.status === "pending").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };

  return (
    <div className="min-h-screen">
      <Navbar onCreateTask={() => setShowCreate(true)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome banner */}
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-white">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h2>
          <p className="text-white/40 font-body mt-1">
            Manage and monitor your AI text processing tasks
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard label="Total Tasks" value={stats.total} color="text-white" bg="bg-white/5" />
          <StatCard label="Success" value={stats.success} color="text-accent-cyan" bg="bg-accent-cyan/5" />
          <StatCard label="In Progress" value={stats.running} color="text-accent-primary" bg="bg-accent-primary/5" />
          <StatCard label="Failed" value={stats.failed} color="text-accent-secondary" bg="bg-accent-secondary/5" />
        </div>

        {/* Filters + count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1 p-1 bg-dark-800/60 border border-white/5 rounded-xl w-fit">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => { setFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-display font-medium capitalize transition-all duration-150 ${
                  filter === s
                    ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/20"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary text-sm flex items-center gap-2 sm:hidden"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {/* Tasks grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 h-44 animate-pulse">
                <div className="h-4 bg-white/5 rounded-lg w-2/3 mb-3" />
                <div className="h-3 bg-white/5 rounded-lg w-full mb-2" />
                <div className="h-3 bg-white/5 rounded-lg w-1/2" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <EmptyState filter={filter} onCreateTask={() => setShowCreate(true)} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onRun={handleRun}
                  onViewLogs={setLogsTask}
                  onDelete={handleDelete}
                  isRunning={runningIds.has(task._id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-ghost text-sm px-4 py-2 disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="text-white/40 font-mono text-sm">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-ghost text-sm px-4 py-2 disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CreateTaskModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />

      {logsTask && (
        <TaskLogsModal
          task={logsTask}
          onClose={() => setLogsTask(null)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className={`glass-card px-4 py-3 ${bg}`}>
      <p className="text-white/40 text-xs font-body">{label}</p>
      <p className={`text-2xl font-display font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  );
}

function EmptyState({ filter, onCreateTask }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      </div>
      <p className="text-white/50 font-display font-semibold">
        {filter === "all" ? "No tasks yet" : `No ${filter} tasks`}
      </p>
      <p className="text-white/25 text-sm font-body mt-1">
        {filter === "all" ? "Create your first task to get started" : "Try a different filter"}
      </p>
      {filter === "all" && (
        <button onClick={onCreateTask} className="btn-primary mt-4 text-sm">
          Create Task
        </button>
      )}
    </div>
  );
}
