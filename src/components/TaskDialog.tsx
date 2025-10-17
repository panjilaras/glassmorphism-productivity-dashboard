"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Task } from './TaskCard';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSave: (task: Omit<Task, 'id'> & { id?: number }) => void;
}

const categories = [
  { id: 1, name: 'UAT', color: '#E6E6FA' },
  { id: 2, name: 'Datafix', color: '#ADD8E6' },
  { id: 3, name: 'Training', color: '#FFB6C1' },
  { id: 4, name: 'Task Force', color: '#FFDAB9' },
  { id: 5, name: 'Other', color: '#DDA0DD' },
];

const activeUsers = [
  { id: 1, name: 'Sarah Johnson' },
  { id: 2, name: 'Mike Chen' },
  { id: 3, name: 'Emma Davis' },
  { id: 4, name: 'David Kim' },
  { id: 5, name: 'Lisa Wang' },
  { id: 6, name: 'Alex Turner' },
  { id: 7, name: 'John Doe' },
];

export function TaskDialog({ open, onOpenChange, task, onSave }: TaskDialogProps) {
  const [formData, setFormData] = React.useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignees: [],
    dueDate: '',
    category: '',
    points: 0,
  });

  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignees: task.assignees || [],
        dueDate: task.dueDate,
        category: task.category || '',
        points: task.points || 0,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignees: [],
        dueDate: '',
        category: '',
        points: 0,
      });
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task ? { ...formData, id: task.id } : formData);
    onOpenChange(false);
  };

  const handleAssigneeToggle = (userName: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userName)
        ? prev.assignees.filter(a => a !== userName)
        : [...prev.assignees, userName]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="glass-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="glass-card"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Task Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="glass-card">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Task Points</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                required
                className="glass-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignees (Select Multiple)</Label>
            <div className="glass-card p-4 rounded-xl max-h-48 overflow-y-auto space-y-3">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={formData.assignees.includes(user.name)}
                    onCheckedChange={() => handleAssigneeToggle(user.name)}
                  />
                  <Label
                    htmlFor={`user-${user.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    {user.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
              className="glass-card"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}