"use client";

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreVertical, Edit, Trash2, Shield, UserCheck, Upload, User as UserIcon, Key } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MetricCard } from '@/components/MetricCard';
import { Users } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  position: string | null;
  status: 'active' | 'inactive';
  role: string;
  joinDate: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  active: { label: 'Active', color: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  inactive: { label: 'Inactive', color: 'bg-gray-500/20 text-gray-700 dark:text-gray-400' },
};

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-400' },
  manager: { label: 'Manager', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' },
  member: { label: 'Member', color: 'bg-green-500/20 text-green-700 dark:text-green-400' },
};

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    position: '',
    status: 'active' as const,
    role: 'member' as const,
    joinDate: '',
    avatarUrl: '',
  });
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string>('');

  // Fetch users from API
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users?limit=100');
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  React.useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.position && user.position.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, statusFilter, users]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      position: user.position || '',
      status: user.status,
      role: user.role || 'member',
      joinDate: user.joinDate ? new Date(user.joinDate).toISOString().split('T')[0] : '',
      avatarUrl: user.avatarUrl || '',
    });
    setAvatarPreview(user.avatarUrl || '');
    setAvatarFile(null);
    setIsDialogOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingUser 
        ? `/api/users?id=${editingUser.id}`
        : '/api/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      // Prepare avatar URL (use preview if new file uploaded, otherwise keep existing)
      let avatarUrl = formData.avatarUrl;
      if (avatarFile && avatarPreview) {
        avatarUrl = avatarPreview; // base64 encoded image
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        position: formData.position || null,
        status: formData.status,
        role: formData.role,
        joinDate: formData.joinDate || new Date().toISOString(),
        avatarUrl: avatarUrl || null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // If editing and role changed, sync role to auth table
        if (editingUser && editingUser.role !== formData.role) {
          await syncRoleToAuth(formData.email, formData.role);
        }
        
        toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
        fetchUsers();
        setIsDialogOpen(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', position: '', status: 'active', role: 'member', joinDate: '', avatarUrl: '' });
        setAvatarFile(null);
        setAvatarPreview('');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to save user');
      }
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user');
    }
  };

  // New function to sync role to auth table
  const syncRoleToAuth = async (email: string, role: string) => {
    try {
      const response = await fetch('/api/auth/sync-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        console.error('Failed to sync role to auth table');
      }
    } catch (error) {
      console.error('Failed to sync role:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ 
      name: '', 
      email: '', 
      position: '', 
      status: 'active', 
      role: 'member',
      joinDate: new Date().toISOString().split('T')[0],
      avatarUrl: '',
    });
    setAvatarFile(null);
    setAvatarPreview('');
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/users?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleSetDefaultPassword = async (user: User) => {
    try {
      const response = await fetch('/api/users/set-default-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Default password set for ${user.name}. Password: ${data.defaultPassword}`,
          { duration: 8000 }
        );
      } else {
        toast.error(data.error || 'Failed to set default password');
      }
    } catch (error) {
      console.error('Failed to set default password:', error);
      toast.error('Failed to set default password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-72 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-muted-foreground py-12">Loading users...</p>
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
              <h1 className="text-4xl font-bold mb-2">Users</h1>
              <p className="text-muted-foreground">Manage team members and their roles</p>
            </div>
            <Button onClick={openCreateDialog} size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="glass-card w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="glass-card w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={users.length}
              icon={Users}
              gradient={1}
            />
            <MetricCard
              title="Admins"
              value={users.filter(u => u.role === 'admin').length}
              icon={Shield}
              gradient={2}
            />
            <MetricCard
              title="Managers"
              value={users.filter(u => u.role === 'manager').length}
              icon={UserCheck}
              gradient={3}
            />
            <MetricCard
              title="Members"
              value={users.filter(u => u.role === 'member').length}
              icon={Users}
              gradient={4}
            />
          </div>

          {/* Search */}
          <GlassCard>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card"
              />
            </div>
          </GlassCard>

          {/* Users Table */}
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Avatar</th>
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 font-semibold">Position</th>
                    <th className="text-left py-3 px-4 font-semibold">Role</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Join Date</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-accent/20">
                      <td className="py-3 px-4">
                        {user.avatarUrl ? (
                          <img 
                            src={user.avatarUrl} 
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">{user.position || '-'}</td>
                      <td className="py-3 px-4">
                        <Badge className={roleConfig[user.role as keyof typeof roleConfig]?.color || roleConfig.member.color}>
                          {roleConfig[user.role as keyof typeof roleConfig]?.label || 'Member'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={statusConfig[user.status].color}>
                          {statusConfig[user.status].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleSetDefaultPassword(user)}
                          title="Set default password (Summitoto_456)"
                        >
                          <Key className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-card max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <Label>Profile Picture</Label>
              <div className="relative">
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-semibold border-4 border-primary/20">
                    <UserIcon className="w-12 h-12" />
                  </div>
                )}
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                  <Upload className="w-4 h-4" />
                  <input 
                    id="avatar-upload"
                    type="file" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Click the upload icon to change avatar (Max 2MB)</p>
            </div>

            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="glass-card"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="glass-card"
                required
              />
            </div>
            <div>
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="glass-card"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value: 'admin' | 'manager' | 'member') => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="glass-card">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="joinDate">Join Date *</Label>
              <Input
                id="joinDate"
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="glass-card"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}