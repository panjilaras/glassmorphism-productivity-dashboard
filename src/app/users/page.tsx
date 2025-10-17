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

const initialUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    position: 'Senior Engineer',
    status: 'active',
    joinDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'manager',
    position: 'Design Lead',
    status: 'active',
    joinDate: '2023-03-20',
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'member',
    position: 'Full Stack Developer',
    status: 'active',
    joinDate: '2023-05-10',
  },
];

const roleConfig = {
  admin: { label: 'Admin', color: 'bg-purple-500/20 text-purple-700 dark:text-purple-400', icon: Shield },
  manager: { label: 'Manager', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400', icon: UserCheck },
  member: { label: 'Member', color: 'bg-green-500/20 text-green-700 dark:text-green-400', icon: UserCheck },
  viewer: { label: 'Viewer', color: 'bg-gray-500/20 text-gray-700 dark:text-gray-400', icon: UserCheck },
};

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);

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

  const handleSaveUser = (userData: Omit<User, 'id'> & { id?: number }) => {
    if (userData.id) {
      setUsers(users.map(u => u.id === userData.id ? userData as User : u));
    } else {
      const newUser = {
        ...userData,
        id: Math.max(...users.map(u => u.id)) + 1,
      } as User;
      setUsers([...users, newUser]);
    }
    setEditingUser(null);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
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