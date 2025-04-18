"use client"

import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Share2 } from "lucide-react";

export default function ShareButtons({ twitterShare, facebookShare, linkedinShare }: { twitterShare: string, facebookShare: string, linkedinShare: string }) {
  function handleCopyLink(e: React.MouseEvent) {
    e.preventDefault();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  }

  return (
    <div className="flex gap-2">
      <a
        href={twitterShare}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10"
        >
          <Twitter className="h-4 w-4" />
        </Button>
      </a>
      <a
        href={facebookShare}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10"
        >
          <Facebook className="h-4 w-4" />
        </Button>
      </a>
      <a
        href={linkedinShare}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10"
        >
          <Linkedin className="h-4 w-4" />
        </Button>
      </a>
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-10 w-10"
        onClick={handleCopyLink}
        type="button"
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
} 