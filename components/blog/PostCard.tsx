import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/lib/blog/posts";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  return (
    <Card 
      className={cn(
        "flex flex-col h-full overflow-hidden group",
        "border-border/40 hover:border-primary/60",
        "hover:shadow-lg transition-all duration-300",
        "bg-gradient-to-b from-card to-card/95",
        featured && "md:grid md:grid-cols-12 gap-0 md:min-h-[320px]"
      )}
    >
      {/* Image placeholder - you could add real featured images later */}
      {featured && (
        <div className="relative col-span-5 bg-primary/5 overflow-hidden hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-80 
                        group-hover:scale-110 transition-transform duration-700 ease-out"/>
          <div className="absolute inset-0 flex items-center justify-center text-primary/40 text-3xl font-bold italic select-none">
            Global Pulse
          </div>
        </div>
      )}
      
      <div className={cn("flex flex-col", featured && "md:col-span-7")}>
        <CardHeader className={featured ? "md:p-8" : ""}>
          <CardTitle 
            className={cn(
              "text-xl md:text-2xl tracking-tight",
              "group-hover:text-primary transition-colors duration-300",
              featured && "md:text-3xl font-bold"
            )}
          >
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow pt-0">
          <p className={cn(
            "text-muted-foreground text-sm md:text-base mb-4", 
            featured ? "line-clamp-4" : "line-clamp-3"
          )}>
            {post.summary}
          </p>
          
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {post.tags.map((tag: string) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs font-medium px-2.5 py-0.5 bg-secondary/70 hover:bg-primary/20 
                          transition-colors duration-300 cursor-pointer"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="text-primary hover:text-primary group/btn relative pl-0"
          >
            <Link href={`/blog/${post.slug}`} className="flex items-center gap-1.5 text-sm font-medium">
              Read More 
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary group-hover/btn:w-full transition-all duration-300"></span>
            </Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
} 