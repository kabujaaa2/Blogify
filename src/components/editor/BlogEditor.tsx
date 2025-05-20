
import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, 
  Heading1, Heading2, Save, Send, Image as ImageIcon, Link as LinkIcon,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Code, FileText, Eye
} from "lucide-react";
import { useBlogStore } from "@/stores/BlogStore";
import { debounce } from "@/lib/utils";
import TagInput from "./TagInput";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlogEditorProps {
  blogId?: string;
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  onPublish?: (blogData: any) => Promise<boolean>;
}

const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

const BlogEditor = ({ 
  blogId,
  initialTitle = '', 
  initialContent = '', 
  initialTags = [],
  onPublish
}: BlogEditorProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  const { saveDraft, publishBlog } = useBlogStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<string>("write");
  const [previewContent, setPreviewContent] = useState<string>(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary/60',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your amazing blog post...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    content: initialContent,
    autofocus: false, // We'll focus on title first
    editorProps: {
      attributes: {
        class: 'focus:outline-none tiptap-editor prose prose-lg dark:prose-invert prose-headings:font-serif prose-p:text-muted-foreground prose-a:text-primary max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      setPreviewContent(editor.getHTML());
    }
  });

  // Function to reset editor state
  const resetEditor = () => {
    setTitle('');
    setTags([]);
    editor?.commands.clearContent();
    setLastSaved(null);
    
    // Focus on title again
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  };

  // Auto-focus on title when creating a new post
  useEffect(() => {
    if (titleInputRef.current && !initialTitle) {
      titleInputRef.current.focus();
    }
  }, [initialTitle]);

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!editor?.getHTML()) return;

    try {
      setIsSaving(true);
      await saveDraft({
        id: blogId,
        title,
        content: editor.getHTML(),
        tags,
        authorId: user?.id || 'user-1',
        authorName: user?.name || 'Anonymous',
      });
      
      setLastSaved(new Date());
      
      toast({
        title: "Draft saved",
        description: "Your changes have been automatically saved",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "There was an error saving your draft",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [title, tags, editor, blogId, saveDraft, toast, user]);

  // Set up auto-save timer
  useEffect(() => {
    const timer = setInterval(() => {
      if ((title || (editor && editor.getHTML().length > 0)) && !isPublishing) {
        autoSave();
      }
    }, AUTO_SAVE_INTERVAL);
    
    return () => clearInterval(timer);
  }, [autoSave, editor, title, isPublishing]);

  // Debounced save function for input changes - with a longer delay for the title
  const debouncedTitleSave = useCallback(
    debounce(async (newTitle: string) => {
      if (!editor || !editor.getHTML()) return;
      
      setIsSaving(true);
      try {
        await saveDraft({
          id: blogId,
          title: newTitle,
          content: editor.getHTML(),
          tags,
          authorId: user?.id || 'user-1',
          authorName: user?.name || 'Anonymous',
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save draft:", error);
      } finally {
        setIsSaving(false);
      }
    }, 1000), // Shorter debounce for title - 1 second
    [editor, blogId, tags, saveDraft, user]
  );

  // Debounced save function for editor content changes
  const debouncedContentSave = useCallback(
    debounce(async () => {
      if (!editor || !editor.getHTML()) return;
      await autoSave();
    }, 2000), // Debounce for 2 seconds after typing stops
    [autoSave, editor]
  );

  // Handle title changes with debounce
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (newTitle && editor?.getHTML()) {
      debouncedTitleSave(newTitle);
    }
  };

  // Trigger debounced save when content changes
  useEffect(() => {
    if (editor) {
      editor.on('update', () => {
        debouncedContentSave();
      });
    }
    
    return () => {
      if (editor) {
        editor.off('update');
      }
    };
  }, [editor, debouncedContentSave]);

  // Trigger debounced save when tags change
  useEffect(() => {
    if (tags.length > 0 && editor?.getHTML()) {
      debouncedContentSave();
    }
  }, [tags, debouncedContentSave, editor]);

  // Manual save function
  const handleSave = async () => {
    if (!editor?.getHTML()) {
      toast({
        title: "Content required",
        description: "Please write some content for your blog post",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      await saveDraft({
        id: blogId,
        title,
        content: editor.getHTML(),
        tags,
        authorId: user?.id || 'user-1',
        authorName: user?.name || 'Anonymous',
      });
      
      setLastSaved(new Date());
      
      toast({
        title: "Draft saved",
        description: "Your blog post has been saved as a draft",
      });
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "There was an error saving your draft",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Publish function
  const handlePublish = async () => {
    if (!title || title.trim() === '') {
      toast({
        title: "Title required",
        description: "Please enter a title for your blog post",
        variant: "destructive",
      });
      return;
    }

    if (!editor?.getHTML() || editor.getHTML().trim() === '<p></p>') {
      toast({
        title: "Content required",
        description: "Please write some content for your blog post",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      const blogData = {
        id: blogId || `blog-${Date.now()}`,
        title,
        content: editor.getHTML(),
        tags,
        authorId: user?.id || 'user-1',
        authorName: user?.name || 'Anonymous',
      };
      
      let success = false;
      if (onPublish) {
        success = await onPublish(blogData);
      } else {
        await publishBlog(blogData);
        success = true;
        toast({
          title: "Post published",
          description: "Your blog post has been published successfully",
        });
      }
      
      // If publishing was successful, reset the editor
      if (success) {
        resetEditor();
      }
    } catch (error) {
      toast({
        title: "Failed to publish",
        description: "There was an error publishing your post",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  // Function to add image
  const addImage = useCallback(() => {
    const url = window.prompt('Enter image URL');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  // Function to add link
  const addLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL', previousUrl);
    
    // cancelled
    if (url === null) return;
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-col h-full bg-card shadow-lg rounded-xl p-6 border border-primary/10">
      {/* Title input */}
      <div className="mb-4">
        <Input
          ref={titleInputRef}
          type="text"
          placeholder="Blog Title"
          value={title}
          onChange={handleTitleChange}
          className="text-3xl font-serif font-bold border-0 focus-visible:ring-primary/20 focus-visible:ring-offset-0 px-0"
        />
      </div>
      
      {/* Tags input */}
      <TagInput 
        tags={tags}
        setTags={setTags}
        suggestions={["technology", "webdev", "programming", "javascript", "react", "design", "ux", "frontend", "backend", "database", "cloud", "ai", "machine-learning"]}
      />
      
      {/* Editor/Preview Tabs */}
      <Tabs 
        defaultValue="write" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex-grow flex flex-col mt-4"
      >
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="write" 
              className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>Write</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"
            >
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <div className="text-sm text-muted-foreground">
            {lastSaved ? (
              <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
            ) : (
              <span>Not saved yet</span>
            )}
          </div>
        </div>
        
        <TabsContent value="write" className="flex-grow flex flex-col mt-0 data-[state=inactive]:hidden">
          {/* Toolbar */}
          <div className="editor-toolbar bg-muted/30 p-1 rounded-lg flex flex-wrap gap-0.5 mb-2">
            <div className="flex items-center gap-0.5 mr-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={editor?.isActive('bold') ? 'bg-primary/10 text-primary' : ''}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={editor?.isActive('italic') ? 'bg-primary/10 text-primary' : ''}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={editor?.isActive('underline') ? 'bg-primary/10 text-primary' : ''}
                title="Underline"
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleCode().run()}
                className={editor?.isActive('code') ? 'bg-primary/10 text-primary' : ''}
                title="Inline Code"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-0.5 mr-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor?.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : ''}
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor?.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : ''}
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-0.5 mr-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={editor?.isActive('bulletList') ? 'bg-primary/10 text-primary' : ''}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={editor?.isActive('orderedList') ? 'bg-primary/10 text-primary' : ''}
                title="Ordered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={editor?.isActive('blockquote') ? 'bg-primary/10 text-primary' : ''}
                title="Blockquote"
              >
                <Quote className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-0.5 mr-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                className={editor?.isActive({ textAlign: 'left' }) ? 'bg-primary/10 text-primary' : ''}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                className={editor?.isActive({ textAlign: 'center' }) ? 'bg-primary/10 text-primary' : ''}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                className={editor?.isActive({ textAlign: 'right' }) ? 'bg-primary/10 text-primary' : ''}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-0.5 mr-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={addImage}
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={addLink}
                className={editor?.isActive('link') ? 'bg-primary/10 text-primary' : ''}
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="h-6 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Editor */}
          <div className="editor-container flex-grow border border-primary/10 rounded-lg p-4 overflow-auto">
            <EditorContent editor={editor} className="min-h-[300px]" />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-grow mt-0 data-[state=inactive]:hidden">
          <div className="border border-primary/10 rounded-lg p-6 overflow-auto h-full bg-card/50">
            <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-a:text-primary max-w-none">
              <h1 className="text-3xl font-serif font-bold mb-4">{title || "Untitled Blog Post"}</h1>
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div dangerouslySetInnerHTML={{ __html: previewContent }} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Action buttons */}
      <div className="flex items-center justify-end mt-4 pt-4 border-t border-primary/10 gap-3">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
          className="border-primary/20 hover:bg-primary/5"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Draft"}
        </Button>
        
        <Button
          onClick={handlePublish}
          disabled={isPublishing}
          className="bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-opacity"
        >
          <Send className="h-4 w-4 mr-2" />
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
};

export default BlogEditor;
