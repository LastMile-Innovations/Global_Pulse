"use client"

import type React from "react"

import { forwardRef } from "react"
import NextLink, { LinkProps as NextLinkProps } from "next/link"
import { cn } from "@/lib/utils"

interface LinkProps extends NextLinkProps {
  // Explicitly add className and children as they are used in the component
  className?: string;
  children?: React.ReactNode;
}

export const Link: React.FC<
  LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement>
> = forwardRef<HTMLAnchorElement, LinkProps>(({ href, className, children, scroll = true, ...props }, ref) => {
  return (
    <NextLink
      ref={ref}
      href={href}
      className={cn(className)}
      onClick={props.onClick}
      scroll={scroll}
      {...props}
    >
      {children}
    </NextLink>
  )
})

Link.displayName = "Link"
