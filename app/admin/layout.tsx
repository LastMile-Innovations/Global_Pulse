import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { isAdminFromCookies } from "@/lib/auth/auth-utils"
import { logger } from "@/lib/utils/logger"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const isUserAdmin = await isAdminFromCookies();
  if (!isUserAdmin) {
    logger.warn(`Unauthorized page access attempt to /admin`);
    redirect('/login?message=Admin%20access%20required');
  }
  return <>{children}</>
} 