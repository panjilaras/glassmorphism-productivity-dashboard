"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeIds: string | null;
  dueDate: string;
  categoryId: number | null;
  points?: number;
}

interface Category {
  id: number;
  name: string;
  color: string | null;
}

interface User {
  id: number;
  name: string;
  status: string;
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSave: (task: Partial<Task>) => Promise<void>;
}

export function TaskDialog({ open, onOpenChange, task, onSave }: TaskDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [activeUsers, setActiveUsers] = React.useState<User[]>([]);
  const [selectedAssignees, setSelectedAssignees] = React.useState<number[]>([]);
  
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    categoryId: null as number | null,
    points: 0,
    dueDate: new Date().toISOString().split('T')[0],
  });

  // Fetch users and categories when dialog opens
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [usersRes, categoriesRes] = await Promise.all([
          fetch('/api/users?limit=100'),
          fetch('/api/task-categories?limit=100')
        ]);
        
        const usersData = await usersRes.json();
        const categoriesData = await categoriesRes.json();
        
        // API returns plain arrays
        if (Array.isArray(usersData)) {
          setActiveUsers(usersData.filter((u: any) => u.status === 'active'));
        }
        
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (open) {
      fetchData();
    }
  }, [open]);

  // Reset form when task changes or dialog opens
  React.useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        categoryId: task.categoryId,
        points: task.points || 0,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      });
      
      // Parse assigneeIds (comma-separated string)
      if (task.assigneeIds) {
        const ids = task.assigneeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        setSelectedAssignees(ids);
      } else {
        setSelectedAssignees([]);
      }
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        categoryId: null,
        points: 0,
        dueDate: new Date().toISOString().split('T')[0],
      });
      setSelectedAssignees([]);
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...(task ? { id: task.id } : {}),
      ...formData,
      assigneeIds: selectedAssignees.length > 0 ? selectedAssignees.join(',') : null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date().toISOString(),
    };
    
    await onSave(taskData);
    onOpenChange(false);
  };

  const toggleAssignee = (userId: number) => {
    setSelectedAssignees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="glass-card"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="glass-card"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Task['status']) => setFormData({ ...formData, status: value })}>
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

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: Task['priority']) => setFormData({ ...formData, priority: value })}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.categoryId?.toString() || 'none'} 
                onValueChange={(value) => setFormData({ ...formData, categoryId: value === 'none' ? null : parseInt(value) })}
              >
                <SelectTrigger className="glass-card">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="none">No Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                className="glass-card"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="glass-card"
            />
          </div>

          <div>
            <Label>Assignees</Label>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-3 glass-card">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading users...</p>
              ) : activeUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active users available</p>
              ) : (
                activeUsers.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer hover:bg-accent/20 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedAssignees.includes(user.id)}
                      onChange={() => toggleAssignee(user.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{user.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}