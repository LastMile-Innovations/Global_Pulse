import { Metadata } from "next";
import { getAllPosts } from "@/lib/blog/posts";
import PostCard from "@/components/blog/PostCard";
import { Separator } from "@/components/ui/separator";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Global Pulse",
  description: "Insights, updates, and articles from the Global Pulse team on emotional intelligence, AI ethics, and collective understanding.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();
  const featuredPost = posts[0];
  const remainingPosts = posts.slice(1);

  return (
    <>
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/5 border-b border-border/30">
        <div className="absolute inset-0 bg-grid-small-white/10 [mask-image:linear-gradient(to_bottom_left,white,transparent,transparent)]" />
        <div className="container max-w-5xl py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 
                         bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Global Pulse Blog
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              Insights, updates, and perspectives on emotional intelligence, AI ethics, and the changing landscape of 
              collective understanding.
            </p>
            <div className="h-1 w-16 bg-primary rounded-full mb-8" />
          </div>
        </div>
      </div>

      <div className="container max-w-5xl py-12 md:py-16">
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground">No blog posts published yet. Check back soon!</p>
        ) : (
          <div className="space-y-16">
            {/* Featured Post - First post with enhanced styling */}
            {featuredPost && (
              <section>
                <div className="mb-10">
                  <h2 className="text-2xl font-bold tracking-tight mb-1">Featured Post</h2>
                  <p className="text-muted-foreground">Our latest insights and updates</p>
                </div>
                <PostCard post={featuredPost} featured={true} />
              </section>
            )}

            {/* Recent Posts Section */}
            {remainingPosts.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">Recent Posts</h2>
                    <p className="text-muted-foreground">Discover more of our content</p>
                  </div>
                  {remainingPosts.length > 3 && (
                    <Link 
                      href="/blog/archive" 
                      className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      View all posts <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {remainingPosts.slice(0, 6).map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Newsletter Sign Up */}
            <section className="bg-muted/50 rounded-xl p-8 border border-border/60">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Stay informed</h2>
                <p className="text-muted-foreground mb-6">
                  Subscribe to our newsletter to receive the latest updates and insights directly in your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="rounded-md px-3 py-2 border border-border bg-background flex-grow"
                  />
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2 font-medium transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
} 