"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface Category {
  id: number;
  name: string;
  color: string;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSave: (category: Omit<Category, 'id'> & { id?: number }) => void;
}

const colorOptions = [
  { name: 'Lavender', value: '#E6E6FA', rgb: 'rgba(230, 230, 250, 0.7)' },
  { name: 'Light Blue', value: '#ADD8E6', rgb: 'rgba(173, 216, 230, 0.7)' },
  { name: 'Light Pink', value: '#FFB6C1', rgb: 'rgba(255, 182, 193, 0.7)' },
  { name: 'Peach', value: '#FFDAB9', rgb: 'rgba(255, 218, 185, 0.7)' },
  { name: 'Mint', value: '#98FF98', rgb: 'rgba(152, 255, 152, 0.7)' },
  { name: 'Light Coral', value: '#F08080', rgb: 'rgba(240, 128, 128, 0.7)' },
  { name: 'Plum', value: '#DDA0DD', rgb: 'rgba(221, 160, 221, 0.7)' },
  { name: 'Khaki', value: '#F0E68C', rgb: 'rgba(240, 230, 140, 0.7)' },
];

export function CategoryDialog({ open, onOpenChange, category, onSave }: CategoryDialogProps) {
  const [formData, setFormData] = React.useState<Omit<Category, 'id'>>({
    name: '',
    color: colorOptions[0].value,
  });

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        color: category.color,
      });
    } else {
      setFormData({
        name: '',
        color: colorOptions[0].value,
      });
    }
  }, [category, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(category ? { ...formData, id: category.id } : formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Create New Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="glass-card"
              placeholder="e.g., UAT, Training"
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`h-16 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    formData.color === color.value
                      ? 'border-primary ring-2 ring-primary ring-offset-2'
                      : 'border-border'
                  }`}
                  style={{ backgroundColor: color.rgb }}
                  title={color.name}
                >
                  <span className="text-xs font-medium">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {category ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}