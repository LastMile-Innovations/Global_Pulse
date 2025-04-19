import { getAllPosts } from "@/lib/blog/posts";
import PostCard from "@/components/blog/PostCard";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import NewsletterSignup from "@/components/blog/NewsletterSignup";

// Make the page async to support async data fetching
export default async function BlogIndexPage() {
  // Await posts for SSR/SSG compatibility
  const posts = await getAllPosts();
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
          <p className="text-center text-muted-foreground">
            No blog posts published yet. Check back soon!
          </p>
        ) : (
          <div className="space-y-16">
            {/* Featured Post - First post with enhanced styling */}
            {featuredPost && (
              <section>
                <div className="mb-10">
                  <h2 className="text-2xl font-bold tracking-tight mb-1">
                    Featured Post
                  </h2>
                  <p className="text-muted-foreground">
                    Our latest insights and updates
                  </p>
                </div>
                <PostCard post={featuredPost} featured={true} />
              </section>
            )}

            {/* Recent Posts Section */}
            {remainingPosts.length > 0 && (
              <section>
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-1">
                      Recent Posts
                    </h2>
                    <p className="text-muted-foreground">
                      Discover more of our content
                    </p>
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
            <section className="bg-muted/50 rounded-standard p-8 border border-border/60 shadow-md">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-2xl font-bold tracking-tight mb-2 accent-orange">
                  Stay informed
                </h2>
                <p className="text-muted-foreground mb-6">
                  Subscribe to our newsletter to receive the latest insights and updates directly in your inbox.
                </p>
                <NewsletterSignup />
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}