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

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Update landing page design',
    description: 'Redesign the landing page with new brand colors and improve user experience',
    status: 'in-progress',
    priority: 'high',
    assignees: ['Sarah Johnson', 'Mike Chen'],
    dueDate: '2024-01-20',
    category: 'UAT',
    points: 8,
  },
  {
    id: 2,
    title: 'Fix production bug',
    description: 'Critical bug affecting user authentication flow needs immediate attention',
    status: 'completed',
    priority: 'urgent',
    assignees: ['Emma Davis', 'David Kim'],
    dueDate: '2024-01-18',
    category: 'Datafix',
    points: 13,
  },
  {
    id: 3,
    title: 'Database optimization',
    description: 'Optimize database queries for better performance on large datasets',
    status: 'completed',
    priority: 'high',
    assignees: ['David Kim'],
    dueDate: '2024-01-15',
    category: 'Task Force',
    points: 8,
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [filteredTasks, setFilteredTasks] = React.useState<Task[]>(initialTasks);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

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

  const handleSaveTask = (taskData: Omit<Task, 'id'> & { id?: number }) => {
    if (taskData.id) {
      setTasks(tasks.map(t => t.id === taskData.id ? taskData as Task : t));
    } else {
      const newTask = {
        ...taskData,
        id: Math.max(...tasks.map(t => t.id)) + 1,
      } as Task;
      setTasks([...tasks, newTask]);
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleStatusChange = (id: number, status: Task['status']) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

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
                    <SelectItem value="UAT">UAT</SelectItem>
                    <SelectItem value="Datafix">Datafix</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Task Force">Task Force</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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