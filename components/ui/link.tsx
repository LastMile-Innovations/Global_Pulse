"use client"

import type React from "react"

import { forwardRef } from "react"
import NextLink, { LinkProps as NextLinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface LinkProps extends NextLinkProps {
  // Explicitly add className and children as they are used in the component
  className?: string;
  children?: React.ReactNode;
}

export const Link: React.FC<
  LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
> = forwardRef<HTMLAnchorElement, LinkProps>(({ href, className, children, scroll = true, ...props }, ref) => {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow the default behavior for external links, or if the user is pressing
    // modifier keys (e.g., Ctrl, Alt, Shift, Meta)
    if (
      typeof href !== "string" ||
      href.startsWith("http") ||
      href.startsWith("#") ||
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.shiftKey
    ) {
      return
    }

    // For internal links, prevent default and handle with Next.js router
    e.preventDefault()
    router.push(href, { scroll })
  }

  return (
    <NextLink
      ref={ref}
      href={href}
      className={cn(className)}
      onClick={props.onClick || handleClick}
      scroll={scroll}
      {...props}
    >
      {children}
    </NextLink>
  )
})

Link.displayName = "Link"
