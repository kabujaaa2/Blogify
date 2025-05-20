
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold">Welcome to Blogify</h1>
          <p className="mt-2 text-muted-foreground">
            {activeTab === "login" 
              ? "Sign in to continue to your dashboard" 
              : "Create an account to start blogging"}
          </p>
        </div>
        
        <div className="bg-card rounded-lg border shadow-sm p-6">
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
