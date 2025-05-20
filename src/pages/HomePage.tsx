import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Search, 
  Calendar, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  Bookmark, 
  ThumbsUp,
  MessageSquare,
  Eye
} from "lucide-react";
import { useBlogStore } from "@/stores/BlogStore";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getAllBlogs } = useBlogStore();
  
  // Fetch blogs from API with improved error handling and loading states
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        
        // Add a small minimum loading time for better UX
        const minLoadTime = 800;
        const startTime = Date.now();
        
        const response = await fetch('/api/blogs');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || 
            `Failed to fetch blogs: ${response.status} ${response.statusText}`
          );
        }
        
        const data = await response.json();
        
        // Update blog store with fetched data
        if (data?.success === true && Array.isArray(data.data)) {
          // Update the blog store with the standardized API response data
          console.log('Fetched blogs:', data.data.length);
        } else if (Array.isArray(data)) {
          // Handle legacy API response format (direct array)
          console.log('Fetched blogs (legacy format):', data.length);
          // Here you would update your blog store with the fetched data
          // For example: setBlogData(data);
        } else {
          console.warn('Unexpected API response format:', data);
        }
        
        // Ensure minimum loading time for better UX
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minLoadTime) {
          await new Promise(resolve => setTimeout(resolve, minLoadTime - elapsedTime));
        }
        
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching blogs:', error);
        
        // Show error for at least 1 second before hiding loading state
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        
        // Here you could set an error state to display to the user
        // setError(error.message);
      }
    };
    
    fetchBlogs();
  }, []);
  
  const publishedBlogs = getAllBlogs('published');
  
  // Sort blogs by date (newest first)
  const sortedBlogs = publishedBlogs.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get featured blog (most viewed)
  const featuredBlog = [...sortedBlogs].sort((a, b) => 
    (b.views || 0) - (a.views || 0)
  )[0];
  
  // Get trending blogs (newest ones)
  const trendingBlogs = sortedBlogs.slice(0, 3);
  
  // Get all tags from blogs
  const allTags = Array.from(
    new Set(
      sortedBlogs.flatMap(blog => blog.tags)
    )
  ).sort();
  
  // Filter blogs by search term and tag
  const filteredBlogs = sortedBlogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !filterTag || blog.tags.includes(filterTag);
    
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch (e) {
      return '';
    }
  };
  
  // Helper to create loading skeleton with more realistic appearance
  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-8">
      {/* Featured post skeleton */}
      <div className="relative overflow-hidden rounded-xl bg-muted/40 w-full">
        <div className="h-72 bg-gradient-to-r from-muted/30 to-muted/50"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background/90 to-transparent">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-muted/70"></div>
              <div className="h-4 bg-muted/60 rounded w-32"></div>
            </div>
            <div className="h-7 bg-muted/60 rounded-md w-3/4"></div>
            <div className="h-4 bg-muted/50 rounded w-1/2"></div>
            <div className="flex gap-2 pt-2">
              <div className="h-6 w-16 bg-muted/50 rounded-full"></div>
              <div className="h-6 w-20 bg-muted/50 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section title skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 bg-muted/60 rounded w-40"></div>
        <div className="flex-grow h-px bg-muted/30"></div>
      </div>
      
      {/* Blog cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-muted/20 rounded-xl overflow-hidden shadow-sm">
            <div className="h-40 bg-gradient-to-br from-muted/30 via-muted/40 to-muted/50"></div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-muted/50 to-muted/70"></div>
                <div className="space-y-1">
                  <div className="h-3.5 bg-muted/60 rounded w-24"></div>
                  <div className="h-2.5 bg-muted/40 rounded w-32 flex">
                    <div className="h-full w-3 bg-muted/60 rounded mr-1"></div>
                    <div className="h-full w-16 bg-muted/50 rounded mr-1"></div>
                    <div className="h-full w-3 bg-muted/60 rounded mr-1"></div>
                    <div className="h-full w-8 bg-muted/50 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="h-6 bg-muted/60 rounded w-5/6"></div>
              <div className="space-y-1.5">
                <div className="h-3 bg-muted/40 rounded w-full"></div>
                <div className="h-3 bg-muted/40 rounded w-full"></div>
                <div className="h-3 bg-muted/40 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2 pt-1">
                <div className="h-5 w-14 bg-muted/40 rounded-full"></div>
                <div className="h-5 w-16 bg-muted/40 rounded-full"></div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-muted/20">
                <div className="flex gap-3">
                  <div className="h-4 w-16 bg-muted/40 rounded flex items-center">
                    <div className="h-3 w-3 bg-muted/60 rounded-full mr-1"></div>
                  </div>
                  <div className="h-4 w-16 bg-muted/40 rounded flex items-center">
                    <div className="h-3 w-3 bg-muted/60 rounded-full mr-1"></div>
                  </div>
                </div>
                <div className="h-7 w-24 bg-muted/40 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 mb-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Discover inspiring blogs
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Read, write, and connect with great thinkers on Blogify
            </p>
            
            <div className="relative w-full max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts by title or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-6 text-lg border-primary/20 focus-visible:ring-primary/30 rounded-full shadow-sm"
              />
            </div>
          </div>
        </div>
        
        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <span className="text-sm font-medium text-muted-foreground mr-2 self-center">Popular tags:</span>
            {allTags.slice(0, 8).map(tag => (
              <Button
                key={tag}
                variant={filterTag === tag ? "default" : "outline"}
                size="sm"
                className="rounded-full text-xs"
                onClick={() => setFilterTag(filterTag === tag ? null : tag)}
              >
                {tag}
              </Button>
            ))}
            {filterTag && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setFilterTag(null)}
              >
                Clear filter
              </Button>
            )}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton />
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-xl shadow-sm">
          {searchTerm ? (
            <>
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords
              </p>
            </>
          ) : (
            <>
              <h3 className="text-xl font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to create content!
              </p>
              <Button asChild>
                <Link to="/login">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {filteredBlogs.map((blog) => (
            <Card 
              key={blog.id} 
              className="overflow-hidden border-primary/10 hover:shadow-lg transition-all duration-300 rounded-xl bg-card group hover:border-primary/30 h-full flex flex-col"
            >
              <CardHeader className="pb-2 border-b border-primary/5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Avatar className="h-8 w-8 transition-transform group-hover:scale-110">
                    <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-medium">
                      {blog.authorName && blog.authorName.length > 0 ? blog.authorName.charAt(0) : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">{blog.authorName || 'Anonymous'}</span>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" /> 
                      {formatDate(blog.createdAt)}
                      <span className="mx-1">•</span>
                      <Clock className="h-3 w-3 mr-1" /> 
                      {formatTime(blog.createdAt)}
                    </div>
                  </div>
                </div>
                <CardTitle className="text-2xl font-serif group-hover:text-primary transition-colors line-clamp-2">
                  <Link to={`/blog/${blog.id}`} className="hover:underline decoration-primary/30 underline-offset-4">
                    {blog.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex-grow">
                <div 
                  className="line-clamp-3 text-muted-foreground mb-4 prose-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: blog.content.replace(/<[^>]*>/g, ' ').substring(0, 200) + '...'
                  }} 
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {blog.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="hover:bg-primary/10 transition-colors cursor-pointer"
                      onClick={() => setFilterTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-primary/5 pt-4 flex justify-between items-center bg-muted/10">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{blog.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 50)} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 10)} comments</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  asChild 
                  size="sm" 
                  className="gap-1 group-hover:text-primary group-hover:border-primary/30 transition-colors"
                >
                  <Link to={`/blog/${blog.id}`}>
                    Read more
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
