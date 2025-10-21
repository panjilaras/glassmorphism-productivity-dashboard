"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  MoreVertical, 
  Edit, 
  Trash2,
  ChevronRight,
  Tag,
  Award
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignees: string[];
  dueDate: string;
  createdAt?: string;
  category?: string;
  categoryColor?: string;
  points?: number;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: Task['status']) => void;
  userRole?: string;
}

const statusConfig = {
  'todo': { label: 'To Do', color: 'bg-pink-500/20 text-pink-700 dark:text-pink-400' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  'completed': { label: 'Completed', color: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  'cancelled': { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-700 dark:text-gray-400' },
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  medium: { label: 'Medium', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-400' },
  urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-700 dark:text-red-400' },
};

const categoryColors: Record<string, string> = {
  'UAT': '#E6E6FA',
  'Datafix': '#ADD8E6',
  'Training': '#FFB6C1',
  'Task Force': '#FFDAB9',
  'Other': '#DDA0DD',
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange, userRole = 'member' }: TaskCardProps) {
  const getNextStatus = (): Task['status'] | null => {
    switch (task.status) {
      case 'todo': return 'in-progress';
      case 'in-progress': return 'completed';
      default: return null;
    }
  };

  const nextStatus = getNextStatus();
  const assignees = task.assignees || [];
  const canEdit = userRole === 'admin' || userRole === 'manager';

  return (
    <GlassCard 
      className="p-6 glass-hover"
      style={{
        borderLeft: task.categoryColor ? `4px solid ${task.categoryColor}` : undefined
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge className={cn('font-medium', statusConfig[task.status].color)}>
            {statusConfig[task.status].label}
          </Badge>
          <Badge className={cn('font-medium', priorityConfig[task.priority].color)}>
            {priorityConfig[task.priority].label}
          </Badge>
        </div>
        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={() => onEdit(task)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{task.description}</p>

      {task.category && (
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${task.categoryColor || '#DDA0DD'}bb` }}
          >
            <Tag className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-medium">{task.category}</span>
        </div>
      )}

      {task.points !== undefined && task.points > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium">{task.points} points</span>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>
            {assignees.length > 0 
              ? assignees.length === 1
                ? assignees[0]
                : `${assignees[0]} +${assignees.length - 1} more`
              : 'Unassigned'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>

      {canEdit && nextStatus && task.status !== 'cancelled' && (
        <Button
          onClick={() => onStatusChange(task.id, nextStatus)}
          className="w-full"
          variant="outline"
        >
          Move to {statusConfig[nextStatus].label}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
      
      {!canEdit && (
        <div className="text-xs text-muted-foreground text-center py-2 bg-muted/30 rounded-lg">
          View only - Contact admin/manager to edit
        </div>
      )}
    </GlassCard>
  );
}