import { useEffect, useState, useRef } from "react";
import api from "../api/axios";

const levelColors = {
  info: "text-white/50",
  success: "text-accent-cyan",
  error: "text-accent-secondary",
};

const levelDots = {
  info: "bg-white/30",
  success: "bg-accent-cyan",
  error: "bg-accent-secondary",
};

export default function TaskLogsModal({ task, onClose }) {
  const [data, setData] = useState({ logs: task.logs || [], status: task.status, result: task.result });
  const bottomRef = useRef(null);
  const intervalRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const res = await api.get(`/tasks/${task._id}/logs`);
      setData(res.data);
      if (res.data.status === "success" || res.data.status === "failed") {
        clearInterval(intervalRef.current);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchLogs();
    if (task.status === "pending" || task.status === "running") {
      intervalRef.current = setInterval(fetchLogs, 1500);
    }
    return () => clearInterval(intervalRef.current);
  }, [task._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data.logs]);

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl glass-card animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-display font-bold text-white truncate">{task.title}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <StatusBadge status={data.status} />
              <span className="text-white/30 text-xs font-mono uppercase">{task.operation}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Result box */}
        {data.result && (
          <div className="mx-6 mt-4 p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-xl">
            <p className="text-xs font-mono text-accent-cyan/60 mb-2 uppercase tracking-wider">Result</p>
            <p className="text-white font-mono text-sm break-all leading-relaxed">{data.result}</p>
          </div>
        )}

        {/* Logs */}
        <div className="px-6 pb-6 mt-4">
          <p className="text-xs font-mono text-white/30 uppercase tracking-wider mb-3">Execution Logs</p>
          <div className="bg-dark-900/80 rounded-xl border border-white/5 p-4 h-56 overflow-y-auto font-mono text-sm space-y-2">
            {data.logs.length === 0 ? (
              <p className="text-white/20">No logs yet...</p>
            ) : (
              data.logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-white/20 text-xs mt-0.5 flex-shrink-0">
                    {log.timestamp ? formatTime(log.timestamp) : "--:--:--"}
                  </span>
                  <span className={`flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${levelDots[log.level] || levelDots.info}`} />
                  <span className={`${levelColors[log.level] || levelColors.info} break-all`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
            {(data.status === "pending" || data.status === "running") && (
              <div className="flex items-center gap-2 text-white/30 pt-1">
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="text-xs">Processing...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending:  { cls: "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20", dot: "bg-accent-yellow" },
    running:  { cls: "bg-accent-primary/10 text-accent-primary border-accent-primary/20", dot: "bg-accent-primary animate-pulse" },
    success:  { cls: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20", dot: "bg-accent-cyan" },
    failed:   { cls: "bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20", dot: "bg-accent-secondary" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`status-badge border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}
