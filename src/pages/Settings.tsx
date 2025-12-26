import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  User, Settings as SettingsIcon, Eye, Bell, LogOut,
  Save, Plus, Trash2, Share2, Lock
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useSharedLists } from "@/hooks/useSharedLists";
import { useChapterNotifications } from "@/hooks/useChapterNotifications";
import { useMangaListByIds } from "@/hooks/useManga";
import { useSecret } from "@/hooks/useSecret";
import { AvatarUpload } from "@/components/profile/AvatarUpload";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const { lists, createList, deleteList, shareList } = useSharedLists();
  const { subscriptions, toggleEmailNotifications } = useChapterNotifications();
  const { isSecretEnabled, toggleSecretEnabled, setPin, pin } = useSecret();

  const subMangaIds = subscriptions.map(s => s.manga_id);
  const { data: subMangas = [] } = useMangaListByIds(subMangaIds);

  const [activeSection, setActiveSection] = useState("account");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [createListOpen, setCreateListOpen] = useState(false);
  const [newPin, setNewPin] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const sections = [
    { id: "account", label: "Account Settings", icon: User },
    { id: "reading", label: "Reading Preferences", icon: Eye },
    { id: "interface", label: "Interface & Theme", icon: SettingsIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security & Vault", icon: Lock },
  ];

  const handleSave = async () => {
    const { error } = await updateProfile({ username, bio });
    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved successfully!");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    await createList(newListName, newListDesc);
    setNewListName("");
    setNewListDesc("");
    setCreateListOpen(false);
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-4 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 px-2">Settings</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <section.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{section.label}</span>
                  </button>
                ))}
                <hr className="my-2 border-border" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Log Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Account Settings */}
            {activeSection === "account" && (
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-6">Account Settings</h2>

                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                    <AvatarUpload
                      currentAvatarUrl={avatarUrl}
                      userId={user.id}
                      username={username}
                      onAvatarChange={(newUrl) => setAvatarUrl(newUrl)}
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <p className="text-sm text-muted-foreground">
                        Upload a profile picture. Accepted formats: JPEG, PNG, GIF, WebP. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email || ""}
                        disabled
                        className="opacity-60"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about your favorite genres..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Reading Lists */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">My Reading Lists</h3>
                    <Dialog open={createListOpen} onOpenChange={setCreateListOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create List
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New List</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>List Name</Label>
                            <Input
                              value={newListName}
                              onChange={(e) => setNewListName(e.target.value)}
                              placeholder="My Favorites"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Description (optional)</Label>
                            <Textarea
                              value={newListDesc}
                              onChange={(e) => setNewListDesc(e.target.value)}
                              placeholder="A collection of my favorite manga..."
                            />
                          </div>
                          <Button onClick={handleCreateList} className="w-full">
                            Create List
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {lists.length > 0 ? (
                    <div className="space-y-3">
                      {lists.map(list => (
                        <div key={list.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div>
                            <p className="font-medium">{list.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {list.manga_ids.length} manga • {list.is_public ? "Public" : "Private"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => shareList(list.id)}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteList(list.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No reading lists yet. Create one to share your favorites!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Reading Preferences */}
            {activeSection === "reading" && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Reading Preferences
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default View Mode</Label>
                      <Select defaultValue="vertical">
                        <SelectTrigger>
                          <SelectValue placeholder="Select view mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="page">Page by Page</SelectItem>
                          <SelectItem value="vertical">Vertical Scroll</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">Preload Images</p>
                      <p className="text-sm text-muted-foreground">
                        Load next pages ahead of time
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {/* Interface & Theme */}
            {activeSection === "interface" && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Interface & Theme
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === "notifications" && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive chapter updates via email
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                {subscriptions.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Subscribed Manga</h3>
                    <div className="space-y-2">
                      {subscriptions.map(sub => {
                        const manga = subMangas.find(m => m.id === sub.manga_id);
                        return (
                          <div key={sub.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                            <span>{manga?.title || sub.manga_id}</span>
                            <Switch 
                              checked={sub.email_enabled}
                              onCheckedChange={(checked) => toggleEmailNotifications(sub.manga_id, checked)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security & Vault */}
            {activeSection === "security" && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security & Secret Vault
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div>
                      <p className="font-medium">Enable Secret Vault</p>
                      <p className="text-sm text-muted-foreground">
                        Access hidden content with a secure PIN. 
                        Use the secret combination on any page to enter.
                      </p>
                    </div>
                    <Switch 
                      checked={isSecretEnabled}
                      onCheckedChange={toggleSecretEnabled}
                    />
                  </div>

                  {isSecretEnabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Vault PIN</Label>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            placeholder="Set new PIN"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                          />
                          <Button onClick={() => {
                            if (newPin.length >= 4) {
                              setPin(newPin);
                              setNewPin("");
                            } else {
                              toast.error("PIN must be at least 4 characters");
                            }
                          }}>
                            Update PIN
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {pin ? "PIN is currently set." : "No PIN set. Anyone can access if unlocked."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline">Discard</Button>
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
