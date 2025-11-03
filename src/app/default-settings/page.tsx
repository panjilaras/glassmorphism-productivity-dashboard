"use client";

import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Save, Settings, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DefaultSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DefaultSettingsPage() {
  const { isOpen: sidebarOpen } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<DefaultSetting[]>([]);
  
  // Form state
  const [timeFilter, setTimeFilter] = useState<string>('30days');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/default-settings?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);

      // Set form values from fetched settings
      const timeSetting = data.find((s: DefaultSetting) => s.settingKey === 'default_time_filter');
      const categorySetting = data.find((s: DefaultSetting) => s.settingKey === 'default_category_filter');
      const managerSetting = data.find((s: DefaultSetting) => s.settingKey === 'default_manager_filter');

      if (timeSetting) setTimeFilter(timeSetting.settingValue);
      if (categorySetting) setCategoryFilter(categorySetting.settingValue);
      if (managerSetting) setManagerFilter(managerSetting.settingValue);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load default settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("bearer_token");

      // Update each setting
      const updates = [
        { key: 'default_time_filter', value: timeFilter },
        { key: 'default_category_filter', value: categoryFilter },
        { key: 'default_manager_filter', value: managerFilter },
      ];

      for (const update of updates) {
        const setting = settings.find(s => s.settingKey === update.key);
        if (setting) {
          const response = await fetch(`/api/default-settings?id=${setting.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              settingValue: update.value
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to update ${update.key}`);
          }
        }
      }

      toast.success('Default settings saved successfully');
      fetchSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save default settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className={cn(
          "p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300",
          sidebarOpen ? "lg:ml-72" : "lg:ml-0"
        )}>
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-muted-foreground py-12">Loading default settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className={cn(
        "p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300",
        sidebarOpen ? "lg:ml-72" : "lg:ml-0"
      )}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Default Settings</h1>
              <p className="text-muted-foreground">
                Configure default filter values for dashboard and reports
              </p>
            </div>
            <Button
              onClick={fetchSettings}
              variant="outline"
              className="glass-card"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Settings Form */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Filter Defaults</h2>
                <p className="text-sm text-muted-foreground">
                  These settings will be applied by default when you open dashboard and reports
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Time Filter Default */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Time Period</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Default time filter for dashboard and reports
                </p>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter Default */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Category Filter</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Default category selection for filtering tasks
                </p>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    <SelectItem value="all">All Categories</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground italic">
                  Note: Currently only "All Categories" is available. Specific categories can be selected in the filter panel.
                </p>
              </div>

              {/* Manager Filter Default */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Manager Filter</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Default manager selection for reports (Admin/Manager only)
                </p>
                <Select value={managerFilter} onValueChange={setManagerFilter}>
                  <SelectTrigger className="glass-card">
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    <SelectItem value="all">All Managers</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground italic">
                  Note: Currently only "All Managers" is available. Specific managers can be selected in the filter panel.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-8">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="shadow-lg"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </GlassCard>

          {/* Information Card */}
          <GlassCard gradient={1} className="p-6">
            <h3 className="text-lg font-semibold mb-3">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Default settings are applied automatically when you open the dashboard or reports pages</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>You can still change filters manually on each page - defaults just set the initial values</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Time period filter helps you focus on recent data by default (recommended: 30 days)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Changes take effect immediately on your next page visit</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
