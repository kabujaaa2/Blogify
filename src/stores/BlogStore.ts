
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Blog {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  views?: number;
}

interface BlogStore {
  blogs: Blog[];
  drafts: Blog[];
  
  // Actions
  saveDraft: (blog: Partial<Blog>) => Promise<Blog>;
  publishBlog: (blog: Partial<Blog>) => Promise<Blog>;
  deleteBlog: (id: string) => Promise<void>;
  deleteDraftsForBlog: (id: string) => Promise<void>;
  getBlog: (id: string) => Blog | undefined;
  getAllBlogs: (status?: 'draft' | 'published') => Blog[];
  getUserBlogs: (userId: string, status?: 'draft' | 'published') => Blog[];
  bulkDeleteBlogs: (ids: string[]) => Promise<void>;
}

// Sample dummy data for authors
const mockUsers = {
  'user-1': 'Sarah Wilson',
  'user-2': 'Alex Johnson',
  'user-3': 'Maya Parker'
};

// Sample dummy data for blogs
const dummyBlogs: Blog[] = [
  {
    id: 'blog-1',
    title: 'Getting Started with React Hooks',
    content: '<h1>React Hooks: A New Way to Write Components</h1><p>React Hooks were introduced in React 16.8 as a way to use state and other React features without writing a class. In this post, we\'ll explore the basics of useState and useEffect hooks.</p><h2>The useState Hook</h2><p>The useState hook lets you add state to functional components. Here\'s a simple example:</p><pre><code>function Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    &lt;div&gt;\n      &lt;p&gt;You clicked {count} times&lt;/p&gt;\n      &lt;button onClick={() => setCount(count + 1)}&gt;\n        Click me\n      &lt;/button&gt;\n    &lt;/div&gt;\n  );\n}</code></pre><p>This is just the beginning of what you can do with React Hooks!</p>',
    tags: ['react', 'javascript', 'webdev'],
    status: 'published',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'user-1',
    authorName: 'Sarah Wilson',
    views: 125
  },
  {
    id: 'blog-2',
    title: 'Building Modern UIs with Tailwind CSS',
    content: '<h1>Why I Love Tailwind CSS</h1><p>After years of writing custom CSS and using various frameworks, I\'ve found that Tailwind CSS provides the perfect balance between flexibility and convenience.</p><h2>Utility-First Approach</h2><p>Instead of pre-defined components, Tailwind gives you utility classes that you can combine to create your own designs without fighting against default styles. This makes it much easier to build exactly what you want.</p><p>Here\'s an example of a card component using Tailwind:</p><pre><code>&lt;div class="bg-white rounded-lg shadow-md p-6"&gt;\n  &lt;h2 class="text-xl font-bold mb-4"&gt;Card Title&lt;/h2&gt;\n  &lt;p class="text-gray-700"&gt;Card content goes here&lt;/p&gt;\n  &lt;button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"&gt;\n    Click Me\n  &lt;/button&gt;\n&lt;/div&gt;</code></pre><p>Once you get used to the utility-first workflow, you\'ll find that you can build UIs faster than ever before.</p>',
    tags: ['css', 'tailwind', 'frontend'],
    status: 'published',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'user-2',
    authorName: 'Alex Johnson',
    views: 87
  },
  {
    id: 'blog-3',
    title: 'Mastering TypeScript for Better Code Quality',
    content: '<h1>Why TypeScript is Worth Learning</h1><p>TypeScript has transformed how I write JavaScript applications. The static typing system helps catch errors early and provides better tooling and documentation.</p><h2>Key Benefits</h2><ul><li>Catch errors during development instead of runtime</li><li>Better IDE support with intellisense</li><li>Improved code documentation through types</li><li>Safer refactoring</li></ul><p>Here\'s a simple example of TypeScript in action:</p><pre><code>interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nfunction getUserName(user: User): string {\n  return user.name;\n}\n\n// This would cause a compile error\n// getUserName({ id: 1 });</code></pre><p>Once you get comfortable with TypeScript, you\'ll wonder how you ever lived without it!</p>',
    tags: ['typescript', 'javascript', 'programming'],
    status: 'published',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    authorId: 'user-3',
    authorName: 'Maya Parker',
    views: 142
  }
];

export const useBlogStore = create<BlogStore>()(
  persist(
    (set, get) => ({
      blogs: dummyBlogs, // Initialize with dummy blogs
      drafts: [],
      
      saveDraft: async (blogData) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const drafts = get().drafts;
            const now = new Date().toISOString();
            const userMock = blogData.authorId ? mockUsers[blogData.authorId as keyof typeof mockUsers] || 'Anonymous' : 'Anonymous';
            
            // Check if draft already exists
            const existingDraftIndex = drafts.findIndex(d => d.id === blogData.id);
            
            let newDraft: Blog;
            
            if (existingDraftIndex !== -1) {
              // Update existing draft
              newDraft = {
                ...drafts[existingDraftIndex],
                ...blogData,
                title: blogData.title || drafts[existingDraftIndex].title,
                content: blogData.content || drafts[existingDraftIndex].content,
                tags: blogData.tags || drafts[existingDraftIndex].tags,
                status: 'draft',
                updatedAt: now,
                authorName: blogData.authorName || drafts[existingDraftIndex].authorName || userMock,
              } as Blog;
              
              const updatedDrafts = [...drafts];
              updatedDrafts[existingDraftIndex] = newDraft;
              
              set({ drafts: updatedDrafts });
            } else {
              // Create new draft with a unique ID
              const draftId = blogData.id || `draft-${Date.now()}`;
              
              newDraft = {
                id: draftId,
                title: blogData.title || 'Untitled Draft',
                content: blogData.content || '',
                tags: blogData.tags || [],
                status: 'draft',
                createdAt: now,
                updatedAt: now,
                authorId: blogData.authorId || 'user-1', // Hardcoded for demo
                authorName: blogData.authorName || userMock,
                views: 0,
              };
              
              set({ drafts: [...drafts, newDraft] });
            }
            
            resolve(newDraft);
          }, 300); // Simulate API delay
        });
      },
      
      publishBlog: async (blogData) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const blogs = get().blogs;
            const now = new Date().toISOString();
            const userMock = blogData.authorId ? mockUsers[blogData.authorId as keyof typeof mockUsers] || 'Anonymous' : 'Anonymous';
            
            // Check if blog already exists
            const existingBlogIndex = blogs.findIndex(b => b.id === blogData.id);
            
            let newBlog: Blog;
            
            if (existingBlogIndex !== -1) {
              // Update existing blog
              newBlog = {
                ...blogs[existingBlogIndex],
                ...blogData,
                title: blogData.title || blogs[existingBlogIndex].title,
                content: blogData.content || blogs[existingBlogIndex].content,
                tags: blogData.tags || blogs[existingBlogIndex].tags,
                status: 'published',
                updatedAt: now,
                authorName: blogData.authorName || blogs[existingBlogIndex].authorName || userMock,
              } as Blog;
              
              const updatedBlogs = [...blogs];
              updatedBlogs[existingBlogIndex] = newBlog;
              
              set({ blogs: updatedBlogs });
            } else {
              // Create new blog with a unique ID
              const blogId = blogData.id || `blog-${Date.now()}`;
              
              newBlog = {
                id: blogId,
                title: blogData.title || 'Untitled Post',
                content: blogData.content || '',
                tags: blogData.tags || [],
                status: 'published',
                createdAt: now,
                updatedAt: now,
                authorId: blogData.authorId || 'user-1', // Hardcoded for demo
                authorName: blogData.authorName || userMock,
                views: 0,
              };
              
              set({ blogs: [...blogs, newBlog] });
            }
            
            // Delete all drafts related to this blog
            get().deleteDraftsForBlog(newBlog.id);
            
            resolve(newBlog);
          }, 500); // Simulate API delay
        });
      },
      
      deleteBlog: async (id) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const blogs = get().blogs.filter(b => b.id !== id);
            const drafts = get().drafts.filter(d => d.id !== id);
            
            set({ blogs, drafts });
            resolve();
          }, 300);
        });
      },

      deleteDraftsForBlog: async (id) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const drafts = get().drafts.filter(d => d.id !== id);
            set({ drafts });
            resolve();
          }, 200);
        });
      },
      
      getBlog: (id) => {
        const { blogs, drafts } = get();
        return blogs.find(b => b.id === id) || drafts.find(d => d.id === id);
      },
      
      getAllBlogs: (status) => {
        const { blogs, drafts } = get();
        
        if (status === 'published') return blogs;
        if (status === 'draft') return drafts;
        
        return [...blogs, ...drafts];
      },

      getUserBlogs: (userId, status) => {
        const { blogs, drafts } = get();

        if (status === 'published') return blogs.filter(b => b.authorId === userId);
        if (status === 'draft') return drafts.filter(d => d.authorId === userId);

        return [
          ...blogs.filter(b => b.authorId === userId),
          ...drafts.filter(d => d.authorId === userId)
        ];
      },

      bulkDeleteBlogs: async (ids) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const blogs = get().blogs.filter(b => !ids.includes(b.id));
            const drafts = get().drafts.filter(d => !ids.includes(d.id));
            
            set({ blogs, drafts });
            resolve();
          }, 500);
        });
      },
    }),
    {
      name: 'blog-storage',
    }
  )
);
