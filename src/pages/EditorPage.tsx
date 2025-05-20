
import { useEffect, useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import BlogEditor from "@/components/editor/BlogEditor";
import { useBlogStore } from "@/stores/BlogStore";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";

const EditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getBlog, publishBlog } = useBlogStore();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (id && id !== "new") {
      const existingBlog = getBlog(id);
      setBlog(existingBlog);
      
      if (!existingBlog) {
        toast({
          title: "Blog not found",
          description: "The requested blog post could not be found.",
          variant: "destructive",
        });
      }
    }
    setLoading(false);
  }, [id, getBlog, toast]);
  
  const handlePublish = async (blogData: any) => {
    try {
      // Validate title is not empty
      if (!blogData.title || blogData.title.trim() === '') {
        toast({
          title: "Title required",
          description: "Please enter a title for your blog post",
          variant: "destructive",
        });
        return false; // Return false to indicate publishing failed
      }
      
      const published = await publishBlog(blogData);
      toast({
        title: "Post published",
        description: "Your blog post has been published successfully",
      });
      
      // Redirect to the homepage (all posts)
      navigate("/", { replace: true });
      return true; // Return true to indicate publishing succeeded
    } catch (error) {
      toast({
        title: "Failed to publish",
        description: "There was an error publishing your post",
        variant: "destructive",
      });
      return false; // Return false to indicate publishing failed
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading editor...</div>
      </div>
    );
  }
  
  // If blog not found and we're not creating a new one
  if (!blog && id !== "new") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 max-w-4xl min-h-[calc(100vh-4rem)]">
        <BlogEditor 
          blogId={id !== "new" ? id : undefined}
          initialTitle={blog?.title || ''}
          initialContent={blog?.content || ''}
          initialTags={blog?.tags || []}
          onPublish={handlePublish}
        />
      </div>
    </ProtectedRoute>
  );
};

export default EditorPage;
