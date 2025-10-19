"use client";

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { TaskCard, Task } from '@/components/TaskCard';
import { TaskDialog } from '@/components/TaskDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = React.useState<Task[]>([]);
  const [categories, setCategories] = React.useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  // Fetch tasks and categories from API
  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [tasksRes, categoriesRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/task-categories')
      ]);
      
      const tasksData = await tasksRes.json();
      const categoriesData = await categoriesRes.json();
      
      if (tasksData.success && Array.isArray(tasksData.data)) {
        setTasks(tasksData.data);
      }
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(task => task.category === categoryFilter);
    }

    setFilteredTasks(filtered);
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter, tasks]);

  const handleSaveTask = async (taskData: Omit<Task, 'id'> & { id?: number }) => {
    try {
      if (taskData.id) {
        const response = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Task updated successfully');
          fetchData();
        } else {
          toast.error('Failed to update task');
        }
      } else {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Task created successfully');
          fetchData();
        } else {
          toast.error('Failed to create task');
        }
      }
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Task deleted successfully');
        fetchData();
      } else {
        toast.error('Failed to delete task');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id: number, status: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Task status updated');
        fetchData();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-72 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-muted-foreground py-12">Loading tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="lg:ml-72 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Tasks</h1>
              <p className="text-muted-foreground">Manage and track your team's tasks</p>
            </div>
            <Button onClick={handleCreateTask} size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              New Task
            </Button>
          </div>

          {/* Filters */}
          <GlassCard>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-card"
                />
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] glass-card">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px] glass-card">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px] glass-card">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="glass-card">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>

          {/* Task Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="text-center">
              <p className="text-2xl font-bold text-pink-500">{tasks.filter(t => t.status === 'todo').length}</p>
              <p className="text-sm text-muted-foreground">To Do</p>
            </GlassCard>
            <GlassCard className="text-center">
              <p className="text-2xl font-bold text-blue-500">{tasks.filter(t => t.status === 'in-progress').length}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </GlassCard>
            <GlassCard className="text-center">
              <p className="text-2xl font-bold text-green-500">{tasks.filter(t => t.status === 'completed').length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </GlassCard>
            <GlassCard className="text-center">
              <p className="text-2xl font-bold text-gray-500">{tasks.filter(t => t.status === 'cancelled').length}</p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </GlassCard>
          </div>

          {/* Tasks Grid */}
          {filteredTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-12">
              <p className="text-muted-foreground">No tasks found matching your filters</p>
            </GlassCard>
          )}
        </div>
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSave={handleSaveTask}
      />
    </div>
  );
}