import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const OPERATIONS = [
  {
    value: "uppercase",
    label: "UPPERCASE",
    desc: "Convert text to all uppercase letters",
    icon: "Aa",
    color: "text-accent-primary",
    bg: "bg-accent-primary/10 border-accent-primary/20",
  },
  {
    value: "lowercase",
    label: "lowercase",
    desc: "Convert text to all lowercase letters",
    icon: "aa",
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10 border-accent-cyan/20",
  },
  {
    value: "reverse",
    label: "Reverse",
    desc: "Reverse the entire input string",
    icon: "⇄",
    color: "text-accent-yellow",
    bg: "bg-accent-yellow/10 border-accent-yellow/20",
  },
  {
    value: "wordcount",
    label: "Word Count",
    desc: "Count words and characters in text",
    icon: "#",
    color: "text-accent-secondary",
    bg: "bg-accent-secondary/10 border-accent-secondary/20",
  },
];

export default function CreateTaskModal({ isOpen, onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", inputText: "", operation: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) setForm({ title: "", inputText: "", operation: "" });
  }, [isOpen]);

  // ✅ Background scroll lock fix
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => (document.body.style.overflow = "auto");
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.inputText || !form.operation)
      return toast.error("Please fill all fields");

    setLoading(true);
    try {
      const { data } = await api.post("/tasks", form);
      toast.success("Task created!");
      onCreated(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start sm:items-center justify-center p-4">
      
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-white">New Task</h2>
            <p className="text-white/40 text-sm mt-0.5">Configure your AI task</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Title */}
          <div>
            <label className="label">Task Title</label>
            <input
              type="text"
              value={form.title}
              placeholder="e.g. convert greeting message"
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="input-field"
            />
          </div>

          {/* Input text */}
          <div>
            <label className="label">Input Text</label>
            <textarea
              value={form.inputText}
              onChange={(e) => setForm((p) => ({ ...p, inputText: e.target.value }))}
              placeholder="Enter the text want to process..."
              rows={4}
              className="input-field resize-none"
            />
          </div>

          {/* Operation */}
          <div>
            <label className="label">Select Operation</label>
            <div className="grid grid-cols-2 gap-2">
              {OPERATIONS.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, operation: op.value }))}
                  className={`p-3 rounded-xl border text-left ${
                    form.operation === op.value
                      ? `${op.bg}`
                      : "bg-dark-700/50 border-white/10"
                  }`}
                >
                  <div className={`font-bold ${op.color}`}>{op.icon}</div>
                  <div className="text-white">{op.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}