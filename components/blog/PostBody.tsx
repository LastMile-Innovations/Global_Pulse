'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { cn } from '@/lib/utils';
import type { Components } from 'react-markdown';
import type { CSSProperties } from 'react';

interface PostBodyProps {
  content: string;
}

// Custom styling for different markdown elements
const customComponents: Partial<Components> = {
  // Headings
  h1: ({ node, ...props }) => <h1 className="text-4xl font-bold my-6" {...props} />,
  h2: ({ node, ...props }) => <h2 className="text-3xl font-semibold my-5 border-b pb-2" {...props} />,
  h3: ({ node, ...props }) => <h3 className="text-2xl font-semibold my-4" {...props} />,
  h4: ({ node, ...props }) => <h4 className="text-xl font-semibold my-3" {...props} />,
  // Paragraphs
  p: ({ node, ...props }) => <p className="my-4 leading-relaxed" {...props} />,
  // Lists
  ul: ({ node, ...props }) => <ul className="list-disc list-inside my-4 pl-4 space-y-2" {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal list-inside my-4 pl-4 space-y-2" {...props} />,
  li: ({ node, ...props }) => <li className="my-1" {...props} />,
  // Links
  a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  // Code blocks
  code({ node, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : 'text';
    const codeString = String(children).replace(/\n$/, '');

    // Remove 'ref' from props to avoid type error
    const { ref, ...restProps } = props;

    return (
      <SyntaxHighlighter
        style={dracula as any}
        language={language}
        PreTag="div"
        className="rounded-md my-4 text-sm"
        {...restProps}
      >
        {codeString}
      </SyntaxHighlighter>
    );
  },
  // Blockquotes
  blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4 text-gray-600" {...props} />,
  // Thematic breaks (horizontal rules)
  hr: ({ node, ...props }) => <hr className="my-8 border-gray-300" {...props} />,
  // Tables
  table: ({ node, ...props }) => <table className="table-auto w-full my-4 border-collapse border border-gray-300" {...props} />,
  thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
  tbody: ({ node, ...props }) => <tbody {...props} />,
  tr: ({ node, ...props }) => <tr className="border-b border-gray-300" {...props} />,
  th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />,
  td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
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
};

const PostBody: React.FC<PostBodyProps> = ({ content }) => {
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
        components={customComponents}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default PostBody; 