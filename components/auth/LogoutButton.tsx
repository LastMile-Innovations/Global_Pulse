"use client"

import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export default function LogoutButton({ variant = "ghost" }: LogoutButtonProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Button variant={variant} onClick={handleLogout} size="sm">
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
