import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface NotificationSystemProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {notifications.map((note) => (
        <Toast key={note.id} note={note} onClose={() => removeNotification(note.id)} />
      ))}
    </div>
  );
};

const Toast = ({ note, onClose }: { note: Notification; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-gaming-900 border-gaming-accent text-white',
    error: 'bg-red-950 border-red-500 text-white',
    warning: 'bg-yellow-950 border-yellow-500 text-white',
    info: 'bg-blue-950 border-blue-500 text-white',
  };

  const Icons = {
    success: CheckCircle,
    error: AlertOctagon,
    warning: AlertTriangle,
    info: Info,
  };

  const Icon = Icons[note.type];

  return (
    <div className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-lg border-l-4 shadow-2xl flex items-start gap-3 animate-fade-in ${bgColors[note.type]}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div className="flex-1 text-sm font-medium">{note.message}</div>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationSystem;