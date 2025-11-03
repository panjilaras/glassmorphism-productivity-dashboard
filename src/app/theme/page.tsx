"use client";

import React, { useState, useEffect } from 'react';
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paintbrush, Image as ImageIcon, CreditCard, RefreshCw, Save, Upload, X, Sparkles, Settings } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ThemeSettings {
  // Background settings
  backgroundGradientColors: string[];
  backgroundOpacity: number;
  backgroundImage: string | null;
  
  // Login page settings
  loginIconColor: string;
  loginCardOpacity: number;
  loginIconImage: string | null;
  
  // Card settings
  cardBackgroundColor: string;
  cardOpacity: number;
  cardBorderOpacity: number;
}

interface DefaultSetting {
  id: number;
  settingKey: string;
  settingValue: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

const defaultSettings: ThemeSettings = {
  backgroundGradientColors: [
    'rgba(168, 135, 255, 0.15)',
    'rgba(135, 206, 250, 0.15)',
    'rgba(255, 182, 193, 0.15)',
    'rgba(255, 218, 185, 0.15)',
    'rgba(221, 160, 221, 0.15)'
  ],
  backgroundOpacity: 0.15,
  backgroundImage: null,
  loginIconColor: '#7c3aed',
  loginCardOpacity: 0.4,
  loginIconImage: null,
  cardBackgroundColor: '#ffffff',
  cardOpacity: 0.4,
  cardBorderOpacity: 0.2,
};

// Theme Presets
const themePresets = {
  glassmorphism: {
    name: 'Glassmorphism',
    description: 'Translucent glass-like cards with backdrop blur and soft gradients',
    settings: {
      backgroundGradientColors: [
        'rgba(168, 135, 255, 0.15)',
        'rgba(135, 206, 250, 0.15)',
        'rgba(255, 182, 193, 0.15)',
        'rgba(255, 218, 185, 0.15)',
        'rgba(221, 160, 221, 0.15)'
      ],
      backgroundOpacity: 0.15,
      backgroundImage: null,
      loginIconColor: '#7c3aed',
      loginCardOpacity: 0.4,
      loginIconImage: null,
      cardBackgroundColor: '#ffffff',
      cardOpacity: 0.4,
      cardBorderOpacity: 0.2,
    }
  },
  neumorphism: {
    name: 'Neumorphism',
    description: 'Soft, extruded elements with subtle shadows creating a 3D effect',
    settings: {
      backgroundGradientColors: [
        'rgba(230, 230, 250, 0.95)',
        'rgba(230, 230, 250, 0.95)',
        'rgba(230, 230, 250, 0.95)',
        'rgba(230, 230, 250, 0.95)',
        'rgba(230, 230, 250, 0.95)'
      ],
      backgroundOpacity: 0.95,
      backgroundImage: null,
      loginIconColor: '#8b5cf6',
      loginCardOpacity: 0.95,
      loginIconImage: null,
      cardBackgroundColor: '#e6e6fa',
      cardOpacity: 0.95,
      cardBorderOpacity: 0.05,
    }
  },
  skeuomorphism: {
    name: 'Skeuomorphism',
    description: 'Realistic textures and shadows mimicking real-world materials',
    settings: {
      backgroundGradientColors: [
        'rgba(139, 92, 246, 0.25)',
        'rgba(99, 102, 241, 0.25)',
        'rgba(59, 130, 246, 0.25)',
        'rgba(139, 92, 246, 0.25)',
        'rgba(99, 102, 241, 0.25)'
      ],
      backgroundOpacity: 0.25,
      backgroundImage: null,
      loginIconColor: '#6366f1',
      loginCardOpacity: 0.85,
      loginIconImage: null,
      cardBackgroundColor: '#f8f9fa',
      cardOpacity: 0.85,
      cardBorderOpacity: 0.3,
    }
  },
  minimalist: {
    name: 'Minimalist',
    description: 'Clean, simple design with high contrast and minimal decorations',
    settings: {
      backgroundGradientColors: [
        'rgba(250, 250, 250, 0.98)',
        'rgba(250, 250, 250, 0.98)',
        'rgba(250, 250, 250, 0.98)',
        'rgba(250, 250, 250, 0.98)',
        'rgba(250, 250, 250, 0.98)'
      ],
      backgroundOpacity: 0.98,
      backgroundImage: null,
      loginIconColor: '#000000',
      loginCardOpacity: 1,
      loginIconImage: null,
      cardBackgroundColor: '#ffffff',
      cardOpacity: 1,
      cardBorderOpacity: 0.1,
    }
  },
  aero: {
    name: 'Aero',
    description: 'Windows Vista/7 inspired glass effect with glowing borders and vibrant colors',
    settings: {
      backgroundGradientColors: [
        'rgba(100, 149, 237, 0.35)',
        'rgba(135, 206, 250, 0.35)',
        'rgba(176, 196, 222, 0.35)',
        'rgba(100, 149, 237, 0.35)',
        'rgba(135, 206, 250, 0.35)'
      ],
      backgroundOpacity: 0.35,
      backgroundImage: null,
      loginIconColor: '#4169e1',
      loginCardOpacity: 0.5,
      loginIconImage: null,
      cardBackgroundColor: '#ffffff',
      cardOpacity: 0.5,
      cardBorderOpacity: 0.35,
    }
  }
};

export default function ThemePage() {
  const { isOpen: sidebarOpen } = useSidebar();
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string>('glassmorphism');

  // Default Settings state
  const [defaultFilterSettings, setDefaultFilterSettings] = useState<DefaultSetting[]>([]);
  const [timeFilter, setTimeFilter] = useState<string>('30days');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [managerFilter, setManagerFilter] = useState<string>('all');
  const [savingDefaults, setSavingDefaults] = useState(false);

  // Auth check
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?redirect=/theme');
    }
  }, [session, isPending, router]);

  // Fetch current user from Master Users table by email
  useEffect(() => {
    if (session?.user?.email) {
      async function fetchCurrentUser() {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch(`/api/users?search=${encodeURIComponent(session.user.email)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            // Find exact email match
            const matchedUser = data.find((u: any) => u.email === session.user.email);
            if (matchedUser) {
              setCurrentUser(matchedUser);
              // Check admin access
              if (matchedUser.role !== 'admin') {
                toast.error('Admin access required');
                router.push('/');
              }
            } else {
              toast.error('User not found in system');
              router.push('/');
            }
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          toast.error('Failed to verify user permissions');
          router.push('/');
        } finally {
          setUserLoading(false);
        }
      }
      fetchCurrentUser();
    } else {
      setUserLoading(false);
    }
  }, [session, router]);

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/theme-settings');
        if (!response.ok) {
          throw new Error('Failed to load theme settings');
        }
        const data = await response.json();
        
        // Parse backgroundGradientColors if it's a string
        const parsedSettings = {
          ...data,
          backgroundGradientColors: typeof data.backgroundGradientColors === 'string'
            ? JSON.parse(data.backgroundGradientColors)
            : data.backgroundGradientColors
        };
        
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load theme settings');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.role === 'admin') {
      loadSettings();
    }
  }, [currentUser]);

  // Fetch default filter settings
  const fetchDefaultSettings = async () => {
    try {
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
      setDefaultFilterSettings(data);

      // Set form values from fetched settings
      const timeSetting = data.find((s: DefaultSetting) => s.settingKey === 'default_time_filter');
      const categorySetting = data.find((s: DefaultSetting) => s.settingKey === 'default_category_filter');
      const managerSetting = data.find((s: DefaultSetting) => s.settingKey === 'default_manager_filter');

      if (timeSetting) setTimeFilter(timeSetting.settingValue);
      if (categorySetting) setCategoryFilter(categorySetting.settingValue);
      if (managerSetting) setManagerFilter(managerSetting.settingValue);
    } catch (error) {
      console.error('Failed to fetch default settings:', error);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchDefaultSettings();
    }
  }, [currentUser]);

  const applyThemeImmediately = (settings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Apply background - either image or gradient
    if (settings.backgroundImage) {
      document.body.style.background = `url(${settings.backgroundImage}) center/cover fixed`;
    } else {
      const gradientStops = settings.backgroundGradientColors.map((color, index) => {
        const position = (index / (settings.backgroundGradientColors.length - 1)) * 100;
        return `${color} ${position}%`;
      }).join(', ');
      
      document.body.style.background = `linear-gradient(135deg, ${gradientStops})`;
      document.body.style.backgroundAttachment = 'fixed';
    }
    
    // Apply card settings
    root.style.setProperty('--card', `${settings.cardBackgroundColor} / ${settings.cardOpacity}`);
    root.style.setProperty('--border', `1 0 0 / ${settings.cardBorderOpacity}`);
    
    // Update sessionStorage for other components
    sessionStorage.setItem('theme-settings', JSON.stringify(settings));
  };

  const applyPreset = (presetKey: string) => {
    const preset = themePresets[presetKey as keyof typeof themePresets];
    if (preset) {
      // Preserve current background image and login icon
      setSettings({
        ...preset.settings,
        backgroundImage: settings.backgroundImage,
        loginIconImage: settings.loginIconImage
      });
      setSelectedPreset(presetKey);
      toast.success(`${preset.name} preset applied! Click Save to apply globally.`);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/theme-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      // Apply theme immediately for current user
      applyThemeImmediately(settings);
      
      toast.success('Global theme settings saved! All users will see changes on next page load.');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSettings(defaultSettings);
    setSelectedPreset('glassmorphism');
    toast.success('Theme settings reset to default (not saved yet)');
  };

  const handleBackgroundImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, and WEBP are allowed');
      return;
    }

    setUploadingBg(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/theme-settings/upload-background', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setSettings({ ...settings, backgroundImage: data.imageUrl });
      toast.success('Background image uploaded! Click Save to apply globally.');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingBg(false);
    }
  };

  const handleLoginIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast.error('Invalid file type. Only JPEG, PNG, WEBP, and SVG are allowed');
      return;
    }

    setUploadingIcon(true);
    try {
      const token = localStorage.getItem('bearer_token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/theme-settings/upload-login-icon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      setSettings({ ...settings, loginIconImage: data.imageUrl });
      toast.success('Login icon uploaded! Click Save to apply globally.');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload icon');
    } finally {
      setUploadingIcon(false);
    }
  };

  const updateGradientColor = (index: number, value: string) => {
    const newColors = [...settings.backgroundGradientColors];
    newColors[index] = value;
    setSettings({ ...settings, backgroundGradientColors: newColors });
  };

  const rgbaToHex = (rgba: string): string => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) return '#a887ff';
    const [, r, g, b] = match;
    return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
  };

  const hexToRgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Handle default settings save
  const handleSaveDefaults = async () => {
    try {
      setSavingDefaults(true);
      const token = localStorage.getItem("bearer_token");

      // Update each setting
      const updates = [
        { key: 'default_time_filter', value: timeFilter },
        { key: 'default_category_filter', value: categoryFilter },
        { key: 'default_manager_filter', value: managerFilter },
      ];

      for (const update of updates) {
        const setting = defaultFilterSettings.find(s => s.settingKey === update.key);
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

      toast.success('Default filter settings saved successfully');
      fetchDefaultSettings();
    } catch (error) {
      console.error('Failed to save default settings:', error);
      toast.error('Failed to save default settings');
    } finally {
      setSavingDefaults(false);
    }
  };

  if (isPending || loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading theme settings...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className={cn(
        "p-3 sm:p-4 md:p-6 lg:p-8 transition-all duration-300",
        sidebarOpen ? "lg:ml-72" : "lg:ml-0"
      )}>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Global Theme Settings
              </h2>
              <p className="text-muted-foreground mt-2">
                Customize the appearance for ALL users across the entire application
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                ⚠️ Changes will apply to all users after they refresh their pages
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>

          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="grid w-full grid-cols-5 glass-card">
              <TabsTrigger value="presets" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Presets
              </TabsTrigger>
              <TabsTrigger value="background" className="gap-2">
                <Paintbrush className="w-4 h-4" />
                Background
              </TabsTrigger>
              <TabsTrigger value="login" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Login Page
              </TabsTrigger>
              <TabsTrigger value="cards" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Cards
              </TabsTrigger>
              <TabsTrigger value="defaults" className="gap-2">
                <Settings className="w-4 h-4" />
                Defaults
              </TabsTrigger>
            </TabsList>

            {/* Theme Presets */}
            <TabsContent value="presets" className="space-y-4">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Choose a Theme Preset</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Select a predefined theme style to quickly apply a cohesive design. You can customize individual settings after applying a preset.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(themePresets).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-105 ${
                        selectedPreset === key
                          ? 'border-primary bg-primary/10'
                          : 'border-border glass-card hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-lg">{preset.name}</h4>
                        {selectedPreset === key && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{preset.description}</p>
                      
                      {/* Preview */}
                      <div 
                        className="h-24 rounded-lg border relative overflow-hidden"
                        style={preset.settings.backgroundImage 
                          ? { background: `url(${preset.settings.backgroundImage}) center/cover` }
                          : { background: `linear-gradient(135deg, ${preset.settings.backgroundGradientColors.join(', ')})` }
                        }
                      >
                        <div 
                          className="absolute inset-x-4 top-1/2 -translate-y-1/2 p-3 rounded-lg backdrop-blur-md border"
                          style={{ 
                            background: `${preset.settings.cardBackgroundColor} / ${preset.settings.cardOpacity}`,
                            borderColor: `rgba(255, 255, 255, ${preset.settings.cardBorderOpacity})`
                          }}
                        >
                          <div className="w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Current Preview */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Full Preview</h3>
                <div 
                  className="h-64 rounded-xl border-2 border-dashed border-border/50 relative overflow-hidden"
                  style={settings.backgroundImage 
                    ? { background: `url(${settings.backgroundImage}) center/cover` }
                    : { background: `linear-gradient(135deg, ${settings.backgroundGradientColors.join(', ')})` }
                  }
                >
                  <div className="absolute inset-8 grid grid-cols-2 gap-4">
                    <div 
                      className="p-6 rounded-xl backdrop-blur-md border"
                      style={{ 
                        background: `${settings.cardBackgroundColor} / ${settings.cardOpacity}`,
                        borderColor: `rgba(255, 255, 255, ${settings.cardBorderOpacity})`
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-3" />
                      <div className="h-3 bg-foreground/20 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-foreground/10 rounded w-1/2" />
                    </div>
                    
                    <div 
                      className="p-6 rounded-xl backdrop-blur-md border"
                      style={{ 
                        background: `${settings.cardBackgroundColor} / ${settings.cardOpacity}`,
                        borderColor: `rgba(255, 255, 255, ${settings.cardBorderOpacity})`
                      }}
                    >
                      <div className="h-3 bg-foreground/20 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-foreground/10 rounded w-full mb-2" />
                      <div className="h-3 bg-foreground/10 rounded w-4/5" />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Background Settings */}
            <TabsContent value="background" className="space-y-4">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Background Image Upload</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Upload Custom Background Image (Max 5MB)</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card border-border hover:border-primary transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>{uploadingBg ? 'Uploading...' : 'Choose Image'}</span>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleBackgroundImageUpload}
                          className="hidden"
                          disabled={uploadingBg}
                        />
                      </label>
                      {settings.backgroundImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings({ ...settings, backgroundImage: null })}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Remove Image
                        </Button>
                      )}
                    </div>
                    {settings.backgroundImage && (
                      <div className="mt-2">
                        <img
                          src={settings.backgroundImage}
                          alt="Background preview"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Image will override gradient background
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Background Gradient Colors</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Used when no background image is set
                </p>
                <div className="space-y-4">
                  {settings.backgroundGradientColors.map((color, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <Label className="w-24">Color {index + 1}</Label>
                      <Input
                        type="color"
                        value={rgbaToHex(color)}
                        onChange={(e) => updateGradientColor(index, hexToRgba(e.target.value, settings.backgroundOpacity))}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <div className="flex-1 h-10 rounded-lg border" style={{ background: color }} />
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <Label>Background Opacity: {settings.backgroundOpacity.toFixed(2)}</Label>
                    <Slider
                      value={[settings.backgroundOpacity]}
                      onValueChange={([value]) => {
                        const newColors = settings.backgroundGradientColors.map(color => {
                          const hex = rgbaToHex(color);
                          return hexToRgba(hex, value);
                        });
                        setSettings({ ...settings, backgroundOpacity: value, backgroundGradientColors: newColors });
                      }}
                      min={0}
                      max={0.5}
                      step={0.01}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              {/* Preview */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div 
                  className="h-48 rounded-xl border-2 border-dashed border-border/50"
                  style={settings.backgroundImage 
                    ? { background: `url(${settings.backgroundImage}) center/cover` }
                    : { background: `linear-gradient(135deg, ${settings.backgroundGradientColors.join(', ')})` }
                  }
                />
              </Card>
            </TabsContent>

            {/* Login Page Settings */}
            <TabsContent value="login" className="space-y-4">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Login Icon Upload</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Upload Custom Login Icon (Max 2MB)</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <label className="cursor-pointer">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card border-border hover:border-primary transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>{uploadingIcon ? 'Uploading...' : 'Choose Icon'}</span>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                          onChange={handleLoginIconUpload}
                          className="hidden"
                          disabled={uploadingIcon}
                        />
                      </label>
                      {settings.loginIconImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSettings({ ...settings, loginIconImage: null })}
                          className="gap-2"
                        >
                          <X className="w-4 h-4" />
                          Remove Icon
                        </Button>
                      )}
                    </div>
                    {settings.loginIconImage && (
                      <div className="mt-2">
                        <img
                          src={settings.loginIconImage}
                          alt="Login icon preview"
                          className="w-16 h-16 object-contain rounded-lg border p-2"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Login Page Customization</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Login Icon Color</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Input
                        type="color"
                        value={settings.loginIconColor}
                        onChange={(e) => setSettings({ ...settings, loginIconColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <div className="flex-1 h-10 rounded-lg border" style={{ background: settings.loginIconColor }} />
                    </div>
                  </div>

                  <div>
                    <Label>Login Card Opacity: {settings.loginCardOpacity.toFixed(2)}</Label>
                    <Slider
                      value={[settings.loginCardOpacity]}
                      onValueChange={([value]) => setSettings({ ...settings, loginCardOpacity: value })}
                      min={0.1}
                      max={1}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              {/* Preview */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="flex items-center justify-center h-48 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border">
                  <div 
                    className="p-8 rounded-2xl backdrop-blur-md border"
                    style={{ 
                      background: `${settings.cardBackgroundColor} / ${settings.loginCardOpacity}`,
                      borderColor: `rgba(255, 255, 255, ${settings.cardBorderOpacity})`
                    }}
                  >
                    {settings.loginIconImage ? (
                      <img 
                        src={settings.loginIconImage} 
                        alt="Login icon" 
                        className="w-12 h-12 object-contain mx-auto"
                      />
                    ) : (
                      <ImageIcon className="w-12 h-12 mx-auto" style={{ color: settings.loginIconColor }} />
                    )}
                    <p className="text-center mt-4 text-sm text-muted-foreground">Login Card Preview</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Card Settings */}
            <TabsContent value="cards" className="space-y-4">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Card Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Card Background Color</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Input
                        type="color"
                        value={settings.cardBackgroundColor}
                        onChange={(e) => setSettings({ ...settings, cardBackgroundColor: e.target.value })}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <div className="flex-1 h-10 rounded-lg border" style={{ background: settings.cardBackgroundColor }} />
                    </div>
                  </div>

                  <div>
                    <Label>Card Opacity: {settings.cardOpacity.toFixed(2)}</Label>
                    <Slider
                      value={[settings.cardOpacity]}
                      onValueChange={([value]) => setSettings({ ...settings, cardOpacity: value })}
                      min={0.1}
                      max={1}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Card Border Opacity: {settings.cardBorderOpacity.toFixed(2)}</Label>
                    <Slider
                      value={[settings.cardBorderOpacity]}
                      onValueChange={([value]) => setSettings({ ...settings, cardBorderOpacity: value })}
                      min={0.05}
                      max={0.5}
                      step={0.05}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              {/* Preview */}
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="p-6 rounded-xl backdrop-blur-md border"
                    style={{ 
                      background: `${settings.cardBackgroundColor} / ${settings.cardOpacity}`,
                      borderColor: `rgba(255, 255, 255, ${settings.cardBorderOpacity})`
                    }}
                  >
                    <h4 className="font-semibold mb-2">Sample Card</h4>
                    <p className="text-sm text-muted-foreground">
                      This is how cards will appear with your custom settings.
                    </p>
                  </div>
                  
                  <div 
                    className="p-6 rounded-xl backdrop-blur-md border"
                    style={{ 
                      background: `${settings.cardBackgroundColor} / ${settings.cardOpacity}`,
                      borderColor: `rgba(255, 255, 255, ${settings.cardBorderOpacity})`
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                      <div className="flex-1">
                        <h4 className="font-semibold">Card with Avatar</h4>
                        <p className="text-xs text-muted-foreground">Example content</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Default Settings Tab */}
            <TabsContent value="defaults" className="space-y-4">
              <Card className="glass-card p-6">
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
                    onClick={handleSaveDefaults}
                    disabled={savingDefaults}
                    className="shadow-lg"
                    size="lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {savingDefaults ? 'Saving...' : 'Save Default Settings'}
                  </Button>
                </div>
              </Card>

              {/* Information Card */}
              <Card className="glass-card p-6 bg-gradient-to-br from-primary/5 to-accent/5">
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
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}