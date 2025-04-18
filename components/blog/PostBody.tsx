'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface PostBodyProps {
  content: string;
}

export default function PostBody({ content }: PostBodyProps) {
  return (
    <div className={cn(
      "prose prose-lg dark:prose-invert max-w-none",
      "prose-headings:font-bold prose-headings:tracking-tight",
      "prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4",
      "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
      "prose-p:leading-relaxed",
      "prose-a:text-primary hover:prose-a:text-primary/80 prose-a:transition-colors prose-a:font-medium",
      "prose-strong:font-semibold prose-strong:text-foreground",
      "prose-blockquote:border-l-primary/50 prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:not-italic prose-blockquote:rounded-r-sm",
      "prose-li:marker:text-primary/70",
      "prose-img:rounded-md prose-img:shadow-md",
      "prose-hr:border-border"
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="rounded-md overflow-hidden my-6">
                <div className="bg-zinc-800 text-xs px-3 py-1.5 text-gray-300 font-mono">
                  {match[1]}
                </div>
                <SyntaxHighlighter
                  {...props}
                  style={atomDark}
                  language={match[1]}
                  className="!m-0 !rounded-t-none !bg-zinc-900"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={cn("bg-muted px-1.5 py-0.5 rounded-md font-mono text-sm", className)} {...props}>
                {children}
              </code>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="not-italic border-l-2 border-primary/50 pl-4 py-1">
                {children}
              </blockquote>
            );
          },
          img({ src, alt }) {
            return (
              <div className="flex flex-col items-center my-8">
                <img 
                  src={src} 
                  alt={alt} 
                  className="rounded-lg shadow-md max-h-[600px] object-cover"
                />
                {alt && <p className="text-center text-sm text-muted-foreground mt-2">{alt}</p>}
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 