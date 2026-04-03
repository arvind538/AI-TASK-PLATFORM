const statusConfig = {
  pending: {
    cls: "bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20",
    dot: "bg-accent-yellow",
    pulse: false,
  },
  running: {
    cls: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
    dot: "bg-accent-primary",
    pulse: true,
  },
  success: {
    cls: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
    dot: "bg-accent-cyan",
    pulse: false,
  },
  failed: {
    cls: "bg-accent-secondary/10 text-accent-secondary border-accent-secondary/20",
    dot: "bg-accent-secondary",
    pulse: false,
  },
};

const opColors = {
  uppercase: "text-accent-primary bg-accent-primary/10",
  lowercase: "text-accent-cyan bg-accent-cyan/10",
  reverse: "text-accent-yellow bg-accent-yellow/10",
  wordcount: "text-accent-secondary bg-accent-secondary/10",
};

const opLabels = {
  uppercase: "UPPERCASE",
  lowercase: "lowercase",
  reverse: "Reverse",
  wordcount: "Word Count",
};

export default function TaskCard({ task, onRun, onViewLogs, onDelete, isRunning }) {
  const s = statusConfig[task.status] || statusConfig.pending;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="glass-card p-5 hover:border-white/10 transition-all duration-200 animate-fade-in group">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-white truncate text-base">
            {task.title}
          </h3>
          <p className="text-white/35 text-sm font-body mt-0.5 line-clamp-1">
            {task.inputText}
          </p>
        </div>

        {/* Status badge */}
        <span className={`status-badge border flex-shrink-0 ${s.cls}`}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot} ${s.pulse ? "animate-pulse" : ""}`} />
          {task.status}
        </span>
      </div>

      {/* Operation tag + time */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-md ${opColors[task.operation] || "text-white/50 bg-white/5"}`}>
          {opLabels[task.operation] || task.operation}
        </span>
        <span className="text-white/25 text-xs font-mono">
          {timeAgo(task.createdAt)}
        </span>
      </div>

      {/* Result preview */}
      {task.result && task.status === "success" && (
        <div className="bg-dark-900/60 border border-white/5 rounded-xl p-3 mb-4">
          <p className="text-xs text-white/30 font-mono mb-1">Result</p>
          <p className="text-sm text-accent-cyan font-mono truncate">{task.result}</p>
        </div>
      )}

      {/* Error state */}
      {task.status === "failed" && (
        <div className="bg-accent-secondary/5 border border-accent-secondary/15 rounded-xl p-3 mb-4">
          <p className="text-xs text-accent-secondary font-mono">Task processing failed</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        {/* Run button */}
        <button
          onClick={() => onRun(task._id)}
          disabled={isRunning || task.status === "running"}
          className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
        >
          {task.status === "running" ? (
            <>
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Running
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              {task.status === "success" || task.status === "failed" ? "Re-run" : "Run"}
            </>
          )}
        </button>

        {/* Logs button */}
        <button
          onClick={() => onViewLogs(task)}
          className="btn-ghost text-xs px-3 py-1.5 flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
          </svg>
          Logs
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(task._id)}
          className="ml-auto btn-danger text-xs px-3 py-1.5 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}
