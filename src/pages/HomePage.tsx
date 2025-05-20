
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Calendar, Clock, ArrowRight } from "lucide-react";
import { useBlogStore } from "@/stores/BlogStore";
import { format } from "date-fns";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { getAllBlogs } = useBlogStore();
  
  const publishedBlogs = getAllBlogs('published');
  
  // Sort blogs by date (newest first)
  const sortedBlogs = publishedBlogs.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Simple search function
  const filteredBlogs = sortedBlogs.filter(blog => 
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-primary">
          Discover inspiring blogs
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Read, write, and connect with great thinkers on Blogify
        </p>
        
        <div className="relative w-full max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search posts by title or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-primary/20 focus-visible:ring-primary/30"
          />
        </div>
      </div>
      
      {filteredBlogs.length === 0 ? (
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
        <div className="space-y-8 max-w-4xl mx-auto">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="overflow-hidden border-primary/10 hover:shadow-md transition-shadow rounded-lg bg-card">
              <CardHeader className="pb-2 border-b border-primary/5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {blog.authorName && blog.authorName.length > 0 ? blog.authorName.charAt(0) : 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{blog.authorName || 'Anonymous'}</span>
                  <span className="mx-1">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> 
                    {formatDate(blog.createdAt)}
                  </span>
                  <span className="mx-1">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> 
                    {formatTime(blog.createdAt)}
                  </span>
                </div>
                <CardTitle className="text-2xl font-serif hover:text-primary/90 transition-colors">
                  <Link to={`/blog/${blog.id}`}>
                    {blog.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div 
                  className="line-clamp-3 text-muted-foreground mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: blog.content.replace(/<[^>]*>/g, ' ').substring(0, 200) + '...'
                  }} 
                />
                <div className="flex flex-wrap gap-2 mt-4">
                  {blog.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="hover:bg-primary/5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="border-t border-primary/5 pt-4 flex justify-between items-center bg-muted/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{blog.views || 0} views</span>
                </div>
                <Button variant="outline" asChild size="sm" className="gap-1 hover:text-primary hover:border-primary/20">
                  <Link to={`/blog/${blog.id}`}>
                    Read more
                    <ArrowRight className="h-3.5 w-3.5" />
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
