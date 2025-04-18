import { Database } from "lucide-react"
import Link from "next/link"

// Add this to your navigation component
// Added standard hover effect
;<Link href="/data-hub" className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
  <Database className="mr-2 h-4 w-4" />
  <span>Data Hub</span>
</Link>
