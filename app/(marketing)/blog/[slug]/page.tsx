import Link from "next/link";
import { notFound } from "next/navigation";
import { type Metadata } from "next";
import { getPostBySlug, getAllPosts } from "@/lib/blog/posts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Share2, Twitter, Facebook, Linkedin, ArrowLeft, ArrowRight } from "lucide-react";
import PostBody from "@/components/blog/PostBody";
import ShareButtons from "@/components/blog/ShareButtons";

type Props = {
  params: { slug: string };
};

// Async for dynamic metadata (MVP: works with static data too)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

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
      type: "article",
      tags: post.tags,
    },
  };
}

// For static generation (MVP: works with static data)
export async function generateStaticParams() {
  const posts = await getAllPosts();
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

export default async function BlogPostPage({ params }: Props) {
  // Ensure async for data fetching
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);

  // Get all posts for navigation
  const allPosts = await getAllPosts();
  const currentPostIndex = allPosts.findIndex((p) => p.slug === post.slug);
  // Posts are usually sorted newest first, so previous = next in array
  const previousPost =
    currentPostIndex < allPosts.length - 1
      ? allPosts[currentPostIndex + 1]
      : null;
  const nextPost =
    currentPostIndex > 0 ? allPosts[currentPostIndex - 1] : null;

  // Share URLs (MVP: Twitter, Facebook, LinkedIn, Copy Link)
  const postUrl =
    typeof window === "undefined"
      ? "" // fallback for SSR, will be empty
      : window.location.href;
  // For SSR, fallback to relative URL
  const shareUrl = `/blog/${post.slug}`;
  const encodedUrl =
    typeof window === "undefined"
      ? encodeURIComponent(shareUrl)
      : encodeURIComponent(window.location.href);
  const encodedTitle = encodeURIComponent(post.title);

  // MVP: Use relative URLs for share links (will work on deployed site)
  const twitterShare = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const facebookShare = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedinShare = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`;

  // MVP: Copy to clipboard handler (client only)
  function handleCopyLink(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      // Optionally: show toast/alert
      alert("Link copied to clipboard!");
    }
  }

  return (
    <>
      {/* Article Header */}
      <div className="relative bg-gradient-to-b from-background to-muted/30 border-b border-border/30 py-12 md:py-20">
        <div className="absolute inset-0 bg-grid-small-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="container max-w-4xl relative">
          <div className="mb-8 flex items-center">
            <Button variant="ghost" size="sm" className="-ml-3" asChild>
              <Link
                href="/blog"
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
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
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-secondary/60 hover:bg-secondary/80 transition-colors"
                >
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
            <div className="prose dark:prose-invert max-w-none">
              <PostBody content={post.content} />
            </div>

            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Share this article
                </h3>
                <div className="flex gap-2">
                  <ShareButtons twitterShare={twitterShare} facebookShare={facebookShare} linkedinShare={linkedinShare} />
                </div>
              </div>

              <div className="mt-4 sm:mt-0">
                <Button variant="default" className="gap-2" asChild>
                  <Link href="/newsletter">Subscribe to Newsletter</Link>
                </Button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8">
            {post.tags && post.tags.length > 0 && (
              <div className="rounded-xl border border-border/60 p-6 bg-card">
                <h3 className="text-lg font-semibold mb-3">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="hover:bg-primary/10 cursor-pointer transition-colors"
                    >
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
                <h4 className="font-medium line-clamp-2">
                  {previousPost.title}
                </h4>
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