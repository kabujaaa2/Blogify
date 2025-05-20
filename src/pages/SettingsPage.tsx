import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import {
  Shield,
  Sun,
  Moon,
  Monitor,
  Eye,
  ZoomIn,
  MousePointer,
  Mail,
  Lock,
  Bell,
  UserCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { 
    theme, 
    eyeCare, 
    setTheme, 
    setColorTemperature, 
    toggleFontSize, 
    toggleReduceMotion, 
    setBlueLight 
  } = useTheme();

  const { user } = useAuth();
  const { toast } = useToast();
  const [blueLightValue, setBlueLightValue] = useState(eyeCare.blueLight);
  
  // Handle blue light filter slider
  const handleBlueLightChange = (value: number[]) => {
    setBlueLightValue(value[0]);
  };
  
  const handleBlueLightChangeEnd = (value: number[]) => {
    setBlueLight(value[0]);
  };

  // Handle profile save (placeholder)
  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  // Handle password change (placeholder)
  const handleChangePassword = () => {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-serif font-bold mb-6">Settings</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start border-b pb-px mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Lock className="mr-2 h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Shield className="mr-2 h-4 w-4" />
              Appearance & Accessibility
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile information visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={user?.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user?.email} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    rows={4} 
                    className="w-full p-2 rounded-md border border-input bg-background"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>
                  Update your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                
                <Button onClick={handleChangePassword}>Change Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Control how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Comment Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone comments on your post</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Like Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone likes your post</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Follower Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone follows you</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sun className="h-5 w-5" />
                  Theme Settings
                </CardTitle>
                <CardDescription>
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Color Theme</Label>
                    <RadioGroup 
                      defaultValue={theme} 
                      onValueChange={(value) => setTheme(value as any)}
                      className="flex space-x-2 mt-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light" className="cursor-pointer flex items-center gap-2">
                          <Sun className="h-4 w-4 text-amber-500" />
                          Light
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark" className="cursor-pointer flex items-center gap-2">
                          <Moon className="h-4 w-4 text-indigo-300" />
                          Dark
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="system" id="theme-system" />
                        <Label htmlFor="theme-system" className="cursor-pointer flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Accessibility
                </CardTitle>
                <CardDescription>
                  Adjust settings to improve readability and comfort
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-base">Color Temperature</Label>
                    <RadioGroup 
                      defaultValue={eyeCare.colorTemperature} 
                      onValueChange={(value) => setColorTemperature(value as any)}
                      className="flex space-x-2 mt-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="normal" id="temp-normal" />
                        <Label htmlFor="temp-normal" className="cursor-pointer flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Normal
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="warm" id="temp-warm" />
                        <Label htmlFor="temp-warm" className="cursor-pointer flex items-center gap-2">
                          <Sun className="h-4 w-4 text-amber-500" />
                          Warm
                        </Label>
                      </div>
                      
                      <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted">
                        <RadioGroupItem value="cool" id="temp-cool" />
                        <Label htmlFor="temp-cool" className="cursor-pointer flex items-center gap-2">
                          <Moon className="h-4 w-4 text-blue-500" />
                          Cool
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base flex items-center gap-2">
                          <ZoomIn className="h-4 w-4" />
                          Font Size
                        </Label>
                        <p className="text-sm text-muted-foreground">Increase text size for better readability</p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={toggleFontSize}
                        className="min-w-24"
                      >
                        {eyeCare.fontSize === "normal" ? "Normal" : 
                         eyeCare.fontSize === "large" ? "Large" : "Larger"}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base flex items-center gap-2">
                          <MousePointer className="h-4 w-4" />
                          Reduce Motion
                        </Label>
                        <p className="text-sm text-muted-foreground">Minimize animations throughout the application</p>
                      </div>
                      <Switch 
                        checked={eyeCare.reduceMotion}
                        onCheckedChange={toggleReduceMotion}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage; 