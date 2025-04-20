"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { logout } from "@/app/actions/auth"

interface LogoutButtonProps {
  variant?: "ghost"
}

export default function LogoutButton({ variant = "ghost" }: LogoutButtonProps) {
  return (
    <form action={logout}>
      <Button variant={variant} size="sm" type="submit">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    </form>
  )
}
