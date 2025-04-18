import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPostBySlug, getAllPosts } from "@/lib/blog/posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Share2, Twitter, Facebook, Linkedin, ArrowLeft, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PostBody from "@/components/blog/PostBody";

type Props = {
  params: { slug: string };
};

// Function to generate dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Global Pulse Blog`,
    description: post.summary,
    keywords: post.tags,
    openGraph: {
        title: post.title,
        description: post.summary,
        type: 'article',
        tags: post.tags,
    },
  };
}

// Function to generate static paths (optional but good for performance)
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Helper to estimate reading time
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound(); // Trigger 404 page if post doesn't exist
  }

  const readingTime = calculateReadingTime(post.content);
  
  // Get all posts for navigation
  const allPosts = getAllPosts();
  const currentPostIndex = allPosts.findIndex(p => p.slug === post.slug);
  const previousPost = currentPostIndex < allPosts.length - 1 ? allPosts[currentPostIndex + 1] : null;
  const nextPost = currentPostIndex > 0 ? allPosts[currentPostIndex - 1] : null;

  return (
    <>
      {/* Article Header with Gradient */}
      <div className="relative bg-gradient-to-b from-background to-muted/30 border-b border-border/30 py-12 md:py-20">
        <div className="absolute inset-0 bg-grid-small-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="container max-w-4xl relative">
          <div className="mb-8 flex items-center">
            <Button variant="ghost" size="sm" className="-ml-3" asChild>
              <Link href="/blog" className="flex items-center text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Blog
              </Link>
            </Button>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm mb-8">
            <div className="flex items-center text-muted-foreground">
              <Clock className="h-4 w-4 mr-1.5" />
              <span>{readingTime} min read</span>
            </div>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-secondary/60 hover:bg-secondary/80 transition-colors">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-4xl">
        <div className="grid grid-cols-12 gap-8 py-12">
          {/* Article Content */}
          <article className="col-span-12 lg:col-span-9">
            {/* Render Markdown content using the PostBody component */}
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <PostBody content={post.content} />
            </div>
            
            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-3">Share this article</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button variant="default" className="gap-2">
                  Subscribe to Newsletter
                </Button>
              </div>
            </div>
          </article>
          
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            {/* Related Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="rounded-xl border border-border/60 p-6 bg-card">
                <h3 className="text-lg font-semibold mb-3">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="hover:bg-primary/10 cursor-pointer transition-colors">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
        
        {/* Post Navigation */}
        <div className="border-t border-border pt-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previousPost && (
              <Link 
                href={`/blog/${previousPost.slug}`}
                className="group p-4 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Previous Article
                </div>
                <h4 className="font-medium line-clamp-2">{previousPost.title}</h4>
              </Link>
            )}
            
            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group p-4 rounded-lg border border-border/60 hover:border-primary/40 hover:bg-muted/50 transition-colors md:text-right"
              >
                <div className="flex items-center justify-end text-sm text-muted-foreground mb-2">
                  Next Article
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="font-medium line-clamp-2">{nextPost.title}</h4>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 