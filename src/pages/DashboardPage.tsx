import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit, Trash2, Eye } from "lucide-react";
import { useBlogStore } from "@/stores/BlogStore";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DashboardPage = () => {
  const { getUserBlogs, bulkDeleteBlogs } = useBlogStore();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const userId = user?.id || 'user-1'; // Use actual user ID or fallback for demo
  const publishedBlogs = getUserBlogs(userId, 'published');

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = (items: any[]) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      await bulkDeleteBlogs(selectedItems);
      toast({
        title: "Success",
        description: `${selectedItems.length} item(s) deleted successfully`,
      });
      setSelectedItems([]);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete selected items",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-serif font-bold">My Published Posts</h1>
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedItems.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedItems.length} post(s)?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the selected posts.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button asChild>
              <Link to="/editor/new">New Post</Link>
            </Button>
          </div>
        </div>
        
        {publishedBlogs.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Published Posts</CardTitle>
              <CardDescription>
                Manage your published blog posts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedItems.length === publishedBlogs.length && publishedBlogs.length > 0}
                        onCheckedChange={() => handleSelectAll(publishedBlogs)}
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishedBlogs.map((blog) => (
                    <TableRow key={blog.id} className={selectedItems.includes(blog.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedItems.includes(blog.id)} 
                          onCheckedChange={() => handleSelectItem(blog.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{blog.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(blog.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{blog.views || 0}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                        >
                          <Link to={`/blog/${blog.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                        >
                          <Link to={`/editor/${blog.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Blog Post?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete
                                your blog post.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => bulkDeleteBlogs([blog.id])}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No published posts yet</h3>
            <p className="text-muted-foreground mb-6">
              Start creating content and publish your first post!
            </p>
            <Button asChild>
              <Link to="/editor/new">Create New Post</Link>
            </Button>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default DashboardPage;
