
import { useParams, Navigate } from "react-router-dom";
import { useBlogStore } from "@/stores/BlogStore";

const BlogDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getBlog } = useBlogStore();
  
  const blog = getBlog(id!);
  
  if (!blog) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-serif font-bold mb-4">{blog.title}</h1>
      
      <div className="flex items-center gap-4 mb-8 text-sm text-muted-foreground">
        <span>Published on {new Date(blog.updatedAt).toLocaleDateString()}</span>
        {blog.tags.length > 0 && (
          <>
            <span className="text-muted-foreground">•</span>
            <div className="flex gap-2">
              {blog.tags.map((tag) => (
                <span key={tag} className="text-primary">#{tag}</span>
              ))}
            </div>
          </>
        )}
      </div>
      
      <div 
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
};

export default BlogDetailPage;
