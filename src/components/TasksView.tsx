import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Voicemail as VoicemailIcon, 
  Filter 
} from 'lucide-react';
import { CrmTask } from '../types/crm';
import { getUrgencyBadgeClasses } from '../utils/crmSyncEngine';

interface TasksViewProps {
  tasks: CrmTask[];
  onToggleTask: (taskId: string) => void;
  onSelectVoicemail: (vmId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onToggleTask,
  onSelectVoicemail,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'high') return t.priority === 'High' || t.priority === 'Critical';
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base">Automated Follow-up Tasks</h2>
            <p className="text-xs text-slate-600">Action items extracted directly from caller requests and deadlines</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed', 'high'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === mode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {mode === 'all' ? `All (${tasks.length})` : mode === 'pending' ? `Pending (${pendingCount})` : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-600 text-sm">
            No tasks match the active filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                task.completed ? 'bg-slate-50/60 opacity-70' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-600' : 'text-slate-900'}`}>
                    {task.title}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                    {task.contactName && (
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.contactName}</span>
                      </span>
                    )}

                    <span className="text-slate-400">•</span>

                    <span className="text-slate-600">
                      Assignee: <span className="font-medium text-slate-800">{task.assignee}</span>
                    </span>

                    <span className="text-slate-400">•</span>

                    <span className="flex items-center gap-1 font-mono text-slate-600">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{task.dueDate}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Priority badge & Voicemail reference */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getUrgencyBadgeClasses(task.priority)}`}>
                  {task.priority}
                </span>

                <button
                  onClick={() => onSelectVoicemail(task.sourceVoicemailId)}
                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Listen to originating voicemail"
                  aria-label="Listen to originating voicemail for task"
                >
                  <VoicemailIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
