import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import EditorPage from "@/pages/EditorPage";
import BlogDetailPage from "@/pages/BlogDetailPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-background text-foreground">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/editor/:id" element={<EditorPage />} />
                  <Route path="/blog/:id" element={<BlogDetailPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <footer className="py-8 border-t border-border mt-12">
                <div className="container mx-auto px-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <h3 className="font-serif text-xl font-bold mb-4 text-primary">Blogify</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        A modern platform for writers and readers to connect through meaningful content.
                      </p>
                      <div className="flex space-x-4">
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                          </svg>
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-4">Quick Links</h4>
                      <ul className="space-y-2 text-sm">
                        <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
                        <li><a href="/explore" className="text-muted-foreground hover:text-primary transition-colors">Explore</a></li>
                        <li><a href="/trending" className="text-muted-foreground hover:text-primary transition-colors">Trending</a></li>
                        <li><a href="/categories" className="text-muted-foreground hover:text-primary transition-colors">Categories</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-4">Resources</h4>
                      <ul className="space-y-2 text-sm">
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Writing Guidelines</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">API Documentation</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community Guidelines</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-4">Company</h4>
                      <ul className="space-y-2 text-sm">
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-muted-foreground text-sm">
                      © {new Date().getFullYear()} Blogify. All rights reserved.
                    </p>
                    <div className="mt-4 md:mt-0">
                      <select className="bg-muted text-sm rounded-md border-border py-1 px-2">
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="es">Español</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
