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
import { Plus, Search, MoreVertical, Edit, Trash2, Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  color: string | null;
  taskCount: number;
  avgPoints: number;
  createdAt: string;
  updatedAt: string;
}

const colorPresets = [
  '#E6E6FA', '#ADD8E6', '#FFB6C1', '#FFDAB9', '#DDA0DD',
  '#F0E68C', '#E0BBE4', '#FFDFD3', '#C7CEEA', '#B5EAD7',
];

export default function CategoriesPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [formData, setFormData] = React.useState({ name: '', color: '#E6E6FA' });

  // Fetch categories from API
  const fetchCategories = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/task-categories?limit=100');
      const data = await response.json();
      
      // API returns plain array with taskCount and avgPoints calculated
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/task-categories?id=${editingCategory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Category updated successfully');
          fetchCategories();
        } else {
          toast.error(data.error || 'Failed to update category');
        }
      } else {
        // Create new category
        const response = await fetch('/api/task-categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Category created successfully');
          fetchCategories();
        } else {
          toast.error(data.error || 'Failed to create category');
        }
      }
      setDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch(`/api/task-categories?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="lg:ml-72 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
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
                {categories.length > 0 ? Math.round(categories.reduce((sum, cat) => sum + (cat.taskCount || 0), 0) / categories.length) : 0}
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
                    <TableHead>Task Count</TableHead>
                    <TableHead>Avg Points</TableHead>
                    <TableHead className="text-right">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-border hover:bg-accent/20">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: category.color || '#E0E0E0' }}
                          />
                          <span className="font-medium">{category.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{category.taskCount}</td>
                      <td className="py-3 px-4 text-muted-foreground">{category.avgPoints.toFixed(1)}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEditCategory(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
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