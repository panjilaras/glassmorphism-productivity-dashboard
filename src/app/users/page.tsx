"use client";

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { UserDialog, User } from '@/components/UserDialog';
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
import { Plus, Search, MoreVertical, Edit, Trash2, Shield, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-400', icon: Shield },
  manager: { label: 'Manager', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400', icon: UserCheck },
  member: { label: 'Member', color: 'bg-green-500/20 text-green-700 dark:text-green-400', icon: UserCheck },
  viewer: { label: 'Viewer', color: 'bg-gray-500/20 text-gray-700 dark:text-gray-400', icon: UserCheck },
};

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

  // Fetch users from API
  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
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
    if (searchQuery) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const handleSaveUser = async (userData: Omit<User, 'id'> & { id?: number }) => {
    try {
      if (userData.id) {
        // Update existing user
        const response = await fetch(`/api/users/${userData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (data.success) {
          toast.success('User updated successfully');
          fetchUsers(); // Refresh users
        } else {
          toast.error('Failed to update user');
        }
      } else {
        // Create new user
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (data.success) {
          toast.success('User created successfully');
          fetchUsers(); // Refresh users
        } else {
          toast.error('Failed to create user');
        }
      }
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh users
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setDialogOpen(true);
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
            <Button onClick={handleCreateUser} size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="text-center" gradient={1}>
              <p className="text-2xl font-bold text-primary">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </GlassCard>
            <GlassCard className="text-center" gradient={2}>
              <p className="text-2xl font-bold text-purple-500">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-sm text-muted-foreground">Admins</p>
            </GlassCard>
            <GlassCard className="text-center" gradient={3}>
              <p className="text-2xl font-bold text-blue-500">{users.filter(u => u.role === 'manager').length}</p>
              <p className="text-sm text-muted-foreground">Managers</p>
            </GlassCard>
            <GlassCard className="text-center" gradient={4}>
              <p className="text-2xl font-bold text-green-500">{users.filter(u => u.status === 'active').length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </GlassCard>
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
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const RoleIcon = roleConfig[user.role].icon;
                    return (
                      <TableRow key={user.id} className="border-border hover:bg-accent/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge className={cn('font-medium', roleConfig[user.role].color)}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleConfig[user.role].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.position}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              'font-medium',
                              user.status === 'active'
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'
                            )}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
}