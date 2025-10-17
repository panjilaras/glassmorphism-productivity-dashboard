"use client";

import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { Plus, Search, MoreVertical, Edit, Trash2, Tag } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  color: string;
  taskCount?: number;
}

const initialCategories: Category[] = [
  { id: 1, name: 'UAT', color: '#E6E6FA', taskCount: 12 },
  { id: 2, name: 'Datafix', color: '#ADD8E6', taskCount: 18 },
  { id: 3, name: 'Training', color: '#FFB6C1', taskCount: 8 },
  { id: 4, name: 'Task Force', color: '#FFDAB9', taskCount: 15 },
  { id: 5, name: 'Other', color: '#DDA0DD', taskCount: 7 },
];

const colorPresets = [
  '#E6E6FA', '#ADD8E6', '#FFB6C1', '#FFDAB9', '#DDA0DD',
  '#F0E68C', '#E0BBE4', '#FFDFD3', '#C7CEEA', '#B5EAD7',
];

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [filteredCategories, setFilteredCategories] = React.useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [formData, setFormData] = React.useState({ name: '', color: '#E6E6FA' });

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  React.useEffect(() => {
    if (editingCategory) {
      setFormData({ name: editingCategory.name, color: editingCategory.color });
    } else {
      setFormData({ name: '', color: '#E6E6FA' });
    }
  }, [editingCategory, dialogOpen]);

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      setCategories(categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, name: formData.name, color: formData.color }
          : c
      ));
    } else {
      const newCategory: Category = {
        id: Math.max(...categories.map(c => c.id)) + 1,
        name: formData.name,
        color: formData.color,
        taskCount: 0,
      };
      setCategories([...categories, newCategory]);
    }
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
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
              <h1 className="text-4xl font-bold mb-2">Task Categories</h1>
              <p className="text-muted-foreground">Manage and configure task categories with custom colors</p>
            </div>
            <Button onClick={handleCreateCategory} size="lg" className="shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <GlassCard className="text-center" gradient={1}>
              <p className="text-2xl font-bold text-primary">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Total Categories</p>
            </GlassCard>
            <GlassCard className="text-center" gradient={2}>
              <p className="text-2xl font-bold text-blue-500">
                {categories.reduce((sum, cat) => sum + (cat.taskCount || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </GlassCard>
            <GlassCard className="text-center" gradient={3}>
              <p className="text-2xl font-bold text-purple-500">
                {Math.round(categories.reduce((sum, cat) => sum + (cat.taskCount || 0), 0) / categories.length)}
              </p>
              <p className="text-sm text-muted-foreground">Avg Tasks/Category</p>
            </GlassCard>
          </div>

          {/* Search */}
          <GlassCard>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card"
              />
            </div>
          </GlassCard>

          {/* Categories Table */}
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Category</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Task Count</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id} className="border-border hover:bg-accent/20">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-lg shadow-sm"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className="font-mono text-xs"
                          style={{ 
                            backgroundColor: `${category.color}40`,
                            color: category.color,
                            borderColor: category.color
                          }}
                        >
                          {category.color}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/20 text-primary">
                          {category.taskCount || 0} tasks
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-card">
                            <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No categories found</p>
              </div>
            )}
          </GlassCard>
        </div>
      </main>

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCategory} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., UAT, Datafix, Training..."
                className="glass-card"
              />
            </div>

            <div className="space-y-2">
              <Label>Category Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-12 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#E6E6FA"
                  className="flex-1 glass-card font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color Presets (Soft Pastels)</Label>
              <div className="grid grid-cols-10 gap-2">
                {colorPresets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className="w-10 h-10 rounded-lg shadow-sm hover:scale-110 transition-transform border-2"
                    style={{ 
                      backgroundColor: color,
                      borderColor: formData.color === color ? '#000' : 'transparent'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="p-4 glass-card rounded-xl flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-lg shadow-sm"
                  style={{ backgroundColor: formData.color }}
                />
                <div>
                  <p className="font-medium">{formData.name || 'Category Name'}</p>
                  <p className="text-sm text-muted-foreground">{formData.color}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}