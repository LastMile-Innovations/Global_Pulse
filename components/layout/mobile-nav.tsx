"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, MessageSquareIcon } from "lucide-react"
import { NavLinks } from "./header"
import { UserAuth, ThemeToggle } from "./header-client"

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()



  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[80vw] sm:w-[350px] pr-0">
        <div className="flex flex-col gap-6 px-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setOpen(false)}>
              <MessageSquareIcon className="h-6 w-6 text-primary" />
              <span className="font-bold">Global Pulse</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
              <span className="sr-only">Close menu</span>
            </Button>
          </div>

          <NavLinks 
            pathname={pathname} 
            className="flex-col space-y-2" 
            onClick={() => setOpen(false)} 
          />

          <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
            <UserAuth />
          </div>

          <div className="mt-auto pt-4 border-t flex justify-center">
            <ThemeToggle />
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
